
import { NextRequest, NextResponse } from 'next/server';
import { submitPesapalOrder } from '@/lib/pesapal';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { planId, userId, email, name } = await request.json();

    if (!planId || !userId || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const planPrices: Record<string, { amount: number; description: string }> = {
      'premium': { amount: 5.00, description: 'IndieAxis Premium Plan - Monthly' },
      'epk-once': { amount: 2.00, description: 'One-time EPK Generation' },
    };

    const plan = planPrices[planId];
    if (!plan) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const reference = `IND-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    // Create payment record in DB
    const payment = await prisma.payment.create({
      data: {
        userId,
        amount: plan.amount,
        currency: 'USD',
        status: 'PENDING',
        reference,
      },
    });

    const { orderTrackingId, redirectUrl } = await submitPesapalOrder({
      orderId: reference,
      amount: plan.amount.toString(),
      currency: 'USD',
      description: plan.description,
      callbackUrl: `${baseUrl}/dashboard?payment=success&reference=${reference}`,
      billingEmail: email,
      billingName: name || '',
    });

    // Update payment with trackingId
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
