// src/lib/entitlements.ts
//
// Every gated route or component should go through these functions.
// Never compare `tier === "PRO"` directly elsewhere in the codebase.

import prisma from "@/lib/prisma";
import { PLAN_CONFIG, PlanTier, PlanLimits, PlanFeatures } from "@/lib/plans.config";

export interface Entitlements {
  tier: PlanTier;
  status: string;
  currentPeriodEnd: Date | null;
  limits: PlanLimits;
  features: PlanFeatures;
  usage: Record<string, number>;
}

function currentPeriodStart(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

// Lazily downgrades an expired subscription back to FREE.
// Called on every entitlements read so no cron is required to keep this correct,
// though a daily cron doing the same in bulk is recommended for cleanliness later.
async function resolveActiveTier(userId: string) {
  const sub = await prisma.subscription.findUnique({ where: { userId } });

  if (!sub) {
    return { tier: "FREE" as PlanTier, status: "active", currentPeriodEnd: null };
  }

  if (sub.billingInterval === "LIFETIME" || sub.tier === "LIFETIME_PRO") {
    return { tier: sub.tier as PlanTier, status: "lifetime", currentPeriodEnd: null };
  }

  const expired = sub.currentPeriodEnd ? sub.currentPeriodEnd < new Date() : false;

  if (expired && sub.tier !== "FREE") {
    await prisma.subscription.update({
      where: { userId },
      data: { tier: "FREE", status: "expired" },
    });
    // keep the legacy flag in sync for any old code paths still reading it
    await prisma.user.update({
      where: { id: userId },
      data: { subscriptionStatus: "FREE" },
    });
    return { tier: "FREE" as PlanTier, status: "expired", currentPeriodEnd: sub.currentPeriodEnd };
  }

  return {
    tier: sub.tier as PlanTier,
    status: sub.status,
    currentPeriodEnd: sub.currentPeriodEnd,
  };
}

export async function getEntitlements(userId: string): Promise<Entitlements> {
  const { tier, status, currentPeriodEnd } = await resolveActiveTier(userId);
  const plan = PLAN_CONFIG[tier];

  const periodStart = currentPeriodStart();
  const counters = await prisma.usageCounter.findMany({
    where: { userId, periodStart },
  });

  const usage: Record<string, number> = {};
  for (const c of counters) usage[c.metric] = c.count;

  return {
    tier,
    status,
    currentPeriodEnd,
    limits: plan.limits,
    features: plan.features,
    usage,
  };
}

// Returns true if the user has room left for this metric this period.
// For non-monthly metrics (epk_count, release_count) this checks against
// lifetime totals computed from the actual related tables, not UsageCounter,
// since those are "how many do you currently have" not "how many this month".
export async function canUse(
  userId: string,
  metric: keyof PlanLimits
): Promise<{ allowed: boolean; limit: number; used: number }> {
  const entitlements = await getEntitlements(userId);
  const limit = entitlements.limits[metric];

  if (limit === Infinity) return { allowed: true, limit, used: 0 };

  let used = 0;

  if (metric === "ai_generation") {
    used = entitlements.usage["ai_generation"] || 0;
  } else if (metric === "epk_count") {
    const artist = await prisma.artistProfile.findUnique({ where: { userId } });
    used = artist ? await prisma.ePK.count({ where: { artistId: artist.id } }) : 0;
  } else if (metric === "release_count") {
    const artist = await prisma.artistProfile.findUnique({ where: { userId } });
    used = artist ? await prisma.release.count({ where: { artistId: artist.id } }) : 0;
  } else if (metric === "fan_contact_count") {
    const artist = await prisma.artistProfile.findUnique({ where: { userId } });
    used = artist ? await prisma.fanContact.count({ where: { artistId: artist.id } }) : 0;
  }

  return { allowed: used < limit, limit, used };
}

// Call after a successful gated AI generation (the only metric tracked via
// UsageCounter — the others are derived live from row counts above).
export async function incrementUsage(userId: string, metric: "ai_generation") {
  const periodStart = currentPeriodStart();
  await prisma.usageCounter.upsert({
    where: { userId_metric_periodStart: { userId, metric, periodStart } },
    create: { userId, metric, periodStart, count: 1 },
    update: { count: { increment: 1 } },
  });
}

export async function hasFeature(
  userId: string,
  feature: keyof PlanFeatures
): Promise<boolean> {
  const entitlements = await getEntitlements(userId);
  return entitlements.features[feature];
}
