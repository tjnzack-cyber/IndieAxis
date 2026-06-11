import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.trialUsed) {
      return NextResponse.json({ error: 'Trial has already been used' }, { status: 400 });
    }

    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 7);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionStatus: 'PREMIUM',
        trialUsed: true,
        trialEndsAt,
      },
    });

    return NextResponse.json({
      success: true,
      subscriptionStatus: updatedUser.subscriptionStatus,
      trialEndsAt: updatedUser.trialEndsAt,
    });
  } catch (error) {
    console.error('Error starting trial:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
