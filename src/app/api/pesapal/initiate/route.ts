import { NextRequest, NextResponse } from 'next/server';
import { submitPesapalOrder } from '@/lib/pesapal';
import prisma from '@/lib/prisma';
import { getPlanPrice, PLAN_CONFIG, PlanTier, BillingInterval } from '@/lib/plans.config';

export async function POST(request: NextRequest) {
  try {
    const { tier, interval, userId, email, name } = await request.json();

    if (!tier || !interval || !userId || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!(tier in PLAN_CONFIG)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    // Only these are actually purchasable right now — LIFETIME_PRO and TEAM
    // are gated separately (lifetime via PlanAvailability, team not sold yet).
    const purchasableTiers: PlanTier[] = ['EPK_PRO', 'PRO'];
    if (!purchasableTiers.includes(tier)) {
      return NextResponse.json({ error: 'This plan is not currently purchasable' }, { status: 400 });
    }

    const amountCents = getPlanPrice(tier as PlanTier, interval as BillingInterval);
    if (amountCents === null) {
      return NextResponse.json({ error: 'Invalid billing interval for this plan' }, { status: 400 });
    }

    const amount = amountCents / 100;
    const planLabel = PLAN_CONFIG[tier as PlanTier].label;
    const description = `IndieAxis ${planLabel} - ${interval === 'YEARLY' ? 'Yearly' : 'Monthly'}`;

    const reference = `IND-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    // Create payment record, carrying tier+interval so the IPN handler
    // knows what to activate once Pesapal confirms payment.
    const payment = await prisma.payment.create({
      data: {
        userId,
        amount,
        currency: 'USD',
        status: 'PENDING',
        reference,
        planTier: tier,
        billingInterval: interval,
      },
    });

    const { orderTrackingId, redirectUrl } = await submitPesapalOrder({
      orderId: reference,
      amount: amount.toString(),
      currency: 'USD',
      description,
      callbackUrl: `${baseUrl}/dashboard?payment=success&reference=${reference}`,
      billingEmail: email,
      billingName: name || '',
    });

    await prisma.payment.update({
      where: { id: payment.id },
      data: { trackingId: orderTrackingId },
    });

    return NextResponse.json({ redirectUrl, orderTrackingId, reference });
  } catch (error) {
    console.error('Pesapal initiate error:', error);
    return NextResponse.json({ error: 'Payment initiation failed' }, { status: 500 });
  }
}
