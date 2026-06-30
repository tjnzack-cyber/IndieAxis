import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { PlanTier, BillingInterval } from '@/lib/plans.config';

// If renewing early (existing period hasn't lapsed yet), extend from the
// existing end date so the user doesn't lose paid-for days. Otherwise extend from now.
function computePeriodEnd(interval: BillingInterval, existingEnd: Date | null): Date {
  const base = existingEnd && existingEnd > new Date() ? new Date(existingEnd) : new Date();
  if (interval === 'YEARLY') {
    base.setFullYear(base.getFullYear() + 1);
  } else {
    base.setMonth(base.getMonth() + 1);
  }
  return base;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { order_tracking_id, order_merchant_reference, status } = body;

    console.log('Pesapal IPN Received:', body);

    if (status === 'COMPLETED') {
      const payment = await prisma.payment.findUnique({
        where: { reference: order_merchant_reference },
        include: { user: true },
      });

      if (payment && payment.status !== 'COMPLETED') {
        await prisma.payment.update({
          where: { id: payment.id },
          data: { status: 'COMPLETED', trackingId: order_tracking_id },
        });

        const tier = (payment.planTier as PlanTier) || 'PRO';
        const interval = (payment.billingInterval as BillingInterval) || 'MONTHLY';

        const existingSub = await prisma.subscription.findUnique({
          where: { userId: payment.userId },
        });
        const currentPeriodEnd = computePeriodEnd(interval, existingSub?.currentPeriodEnd ?? null);

        await prisma.subscription.upsert({
          where: { userId: payment.userId },
          create: {
            userId: payment.userId,
            tier,
            billingInterval: interval,
            status: 'active',
            currentPeriodEnd,
            lastPaymentId: payment.id,
          },
          update: {
            tier,
            billingInterval: interval,
            status: 'active',
            currentPeriodEnd,
            lastPaymentId: payment.id,
          },
        });

        // Keep legacy flag in sync for any old code still reading it
        await prisma.user.update({
          where: { id: payment.userId },
          data: {
            subscriptionStatus: 'PREMIUM',
            trialEndsAt: null,
          },
        });

        console.log(`Subscription activated: user ${payment.userId} -> ${tier} (${interval})`);
      }
    } else if (status === 'FAILED' || status === 'INVALID') {
      await prisma.payment.updateMany({
        where: { reference: order_merchant_reference },
        data: { status },
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Pesapal IPN Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
