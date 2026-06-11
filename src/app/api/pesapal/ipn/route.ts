
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getPesapalTransactionStatus } from '@/lib/pesapal';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      order_tracking_id, 
      order_merchant_reference, 
      status, 
      payment_method 
    } = body;

    console.log('Pesapal IPN Received:', body);

    // Fetch official status from Pesapal to be sure (optional but recommended)
    // const officialStatus = await getPesapalTransactionStatus(order_tracking_id);
    
    if (status === 'COMPLETED') {
      const payment = await prisma.payment.findUnique({
        where: { reference: order_merchant_reference },
        include: { user: true },
      });

      if (payment) {
        // Update payment status
        await prisma.payment.update({
          where: { id: payment.id },
          data: { 
            status: 'COMPLETED',
            trackingId: order_tracking_id 
          },
        });

        // Update user subscription status
        await prisma.user.update({
          where: { id: payment.userId },
          data: { 
            subscriptionStatus: 'PREMIUM',
            trialEndsAt: null // Paid subscription overrides/ends trial
          },
        });

        console.log(`Subscription activated for user ${payment.userId}`);
      }
    } else if (status === 'FAILED' || status === 'INVALID') {
      await prisma.payment.updateMany({
        where: { reference: order_merchant_reference },
        data: { status: status },
      });
    }

    // Always return 200 OK to Pesapal
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Pesapal IPN Error:', error);
    // Return 500 so Pesapal retries
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
