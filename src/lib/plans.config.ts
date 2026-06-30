// src/lib/plans.config.ts
//
// SINGLE SOURCE OF TRUTH for plan pricing, limits, and feature flags.
// Never hardcode a tier check or a limit number anywhere else in the app —
// always read through here (via entitlements.ts).

export type PlanTier = "FREE" | "EPK_PRO" | "PRO" | "LIFETIME_PRO" | "TEAM";
export type BillingInterval = "MONTHLY" | "YEARLY" | "LIFETIME";

export interface PlanLimits {
  ai_generation: number; // per calendar month, Infinity = unlimited
  epk_count: number;
  release_count: number;
  fan_contact_count: number;
}

export interface PlanFeatures {
  removeBranding: boolean;
  customUrl: boolean;
  pdfExport: boolean;
  qrCode: boolean;
  advancedAnalytics: boolean;
  prioritySupport: boolean;
  aiCoach: boolean;
}

export interface PlanDefinition {
  label: string;
  // prices in USD cents. null = not purchasable directly (e.g. Team, reserved)
  price: { monthly: number | null; yearly: number | null; lifetime: number | null };
  limits: PlanLimits;
  features: PlanFeatures;
}

export const PLAN_CONFIG: Record<PlanTier, PlanDefinition> = {
  FREE: {
    label: "Free",
    price: { monthly: 0, yearly: 0, lifetime: null },
    limits: {
      ai_generation: 10,
      epk_count: 1,
      release_count: 1,
      fan_contact_count: 20,
    },
    features: {
      removeBranding: false,
      customUrl: false,
      pdfExport: false,
      qrCode: false,
      advancedAnalytics: false,
      prioritySupport: false,
      aiCoach: false,
    },
  },
  EPK_PRO: {
    label: "EPK Pro",
    price: { monthly: 499, yearly: 4900, lifetime: null },
    limits: {
      ai_generation: 10,
      epk_count: Infinity,
      release_count: 1,
      fan_contact_count: 20,
    },
    features: {
      removeBranding: true,
      customUrl: true,
      pdfExport: true,
      qrCode: true,
      advancedAnalytics: false,
      prioritySupport: false,
      aiCoach: false,
    },
  },
  PRO: {
    label: "IndieAxis Pro",
    price: { monthly: 1299, yearly: 12900, lifetime: null },
    limits: {
      ai_generation: Infinity,
      epk_count: Infinity,
      release_count: Infinity,
      fan_contact_count: Infinity,
    },
    features: {
      removeBranding: true,
      customUrl: true,
      pdfExport: true,
      qrCode: true,
      advancedAnalytics: true,
      prioritySupport: true,
      aiCoach: true,
    },
  },
  // Same entitlements as PRO. Kept as a distinct tier (not just a billingInterval
  // value) so it can be hidden/shown via PlanAvailability and reported on separately.
  LIFETIME_PRO: {
    label: "IndieAxis Pro (Lifetime)",
    price: { monthly: null, yearly: null, lifetime: 19900 },
    limits: {
      ai_generation: Infinity,
      epk_count: Infinity,
      release_count: Infinity,
      fan_contact_count: Infinity,
    },
    features: {
      removeBranding: true,
      customUrl: true,
      pdfExport: true,
      qrCode: true,
      advancedAnalytics: true,
      prioritySupport: true,
      aiCoach: true,
    },
  },
  // Reserved. Not purchasable yet — no checkout route reads this for sale,
  // it exists so Subscription.tier and the gating system already understand it.
  TEAM: {
    label: "Team",
    price: { monthly: null, yearly: null, lifetime: null },
    limits: {
      ai_generation: Infinity,
      epk_count: Infinity,
      release_count: Infinity,
      fan_contact_count: Infinity,
    },
    features: {
      removeBranding: true,
      customUrl: true,
      pdfExport: true,
      qrCode: true,
      advancedAnalytics: true,
      prioritySupport: true,
      aiCoach: true,
    },
  },
};

// Reserved keys for future one-time purchases (OneTimePurchase.productKey).
// Not wired into any checkout flow yet.
export const ONE_TIME_PRODUCTS = {
  epk_once: { label: "One-time EPK Generation", priceCents: 200 },
  ai_bio_rewrite: { label: "AI Bio Rewrite", priceCents: 500 },
  press_release_generator: { label: "Press Release Generator", priceCents: 500 },
  release_rollout_template: { label: "Release Rollout Template", priceCents: 500 },
  social_content_pack: { label: "Social Media Content Pack", priceCents: 700 },
  branding_kit: { label: "Artist Branding Kit", priceCents: 1500 },
} as const;

// Helper: resolve the USD amount for a (tier, interval) purchase from Pesapal initiate route
export function getPlanPrice(tier: PlanTier, interval: BillingInterval): number | null {
  const plan = PLAN_CONFIG[tier];
  if (interval === "MONTHLY") return plan.price.monthly;
  if (interval === "YEARLY") return plan.price.yearly;
  if (interval === "LIFETIME") return plan.price.lifetime;
  return null;
}
