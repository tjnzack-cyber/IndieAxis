
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getPesapalTransactionStatus } from '@/lib/pesapal';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Try finding by reference first
    let payment = await prisma.payment.findUnique({
      where: { reference: id },
      include: { user: true },
    });

    // If not found, try trackingId
    if (!payment) {
      payment = await prisma.payment.findUnique({
        where: { trackingId: id },
        include: { user: true },
      });
    }

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    // If still PENDING in our DB, check with Pesapal to see if it updated
    if (payment.status === 'PENDING' && payment.trackingId) {
      try {
        const pesapalStatus = await getPesapalTransactionStatus(payment.trackingId);
        
        if (pesapalStatus.status === 'COMPLETED') {
          // Sync DB
          await prisma.payment.update({
            where: { id: payment.id },
            data: { status: 'COMPLETED' },
          });

          await prisma.user.update({
            where: { id: payment.userId },
            data: { 
              subscriptionStatus: 'PREMIUM',
              trialEndsAt: null
            },
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
        // Continue with local status
      }
    }

    return NextResponse.json({
      status: payment.status,
      amount: payment.amount,
      currency: payment.currency,
      reference: payment.reference,
      subscriptionStatus: payment.user.subscriptionStatus,
    });
  } catch (error) {
    console.error('Pesapal Status Check Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
