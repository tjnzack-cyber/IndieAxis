import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getPesapalTransactionStatus } from '@/lib/pesapal';
import { PlanTier, BillingInterval } from '@/lib/plans.config';

function computePeriodEnd(interval: BillingInterval, existingEnd: Date | null): Date {
  const base = existingEnd && existingEnd > new Date() ? new Date(existingEnd) : new Date();
  if (interval === 'YEARLY') {
    base.setFullYear(base.getFullYear() + 1);
  } else {
    base.setMonth(base.getMonth() + 1);
  }
  return base;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    let payment = await prisma.payment.findUnique({
      where: { reference: id },
      include: { user: true },
    });

    if (!payment) {
      payment = await prisma.payment.findUnique({
        where: { trackingId: id },
        include: { user: true },
      });
    }

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    if (payment.status === 'PENDING' && payment.trackingId) {
      try {
        const pesapalStatus = await getPesapalTransactionStatus(payment.trackingId);

        if (pesapalStatus.status === 'COMPLETED') {
          await prisma.payment.update({
            where: { id: payment.id },
            data: { status: 'COMPLETED' },
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

          await prisma.user.update({
            where: { id: payment.userId },
            data: { subscriptionStatus: 'PREMIUM', trialEndsAt: null },
          });

          payment.status = 'COMPLETED';
        } else if (pesapalStatus.status === 'FAILED' || pesapalStatus.status === 'INVALID') {
          await prisma.payment.update({
            where: { id: payment.id },
            data: { status: pesapalStatus.status },
          });
          payment.status = pesapalStatus.status;
        }
      } catch (pesapalError) {
        console.error('Error syncing with Pesapal:', pesapalError);
      }
    }

    const subscription = await prisma.subscription.findUnique({
      where: { userId: payment.userId },
    });

    return NextResponse.json({
      status: payment.status,
      amount: payment.amount,
      currency: payment.currency,
      reference: payment.reference,
      planTier: payment.planTier,
      billingInterval: payment.billingInterval,
      subscriptionStatus: payment.user.subscriptionStatus,
      tier: subscription?.tier || 'FREE',
      currentPeriodEnd: subscription?.currentPeriodEnd || null,
    });
  } catch (error) {
    console.error('Pesapal Status Check Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
