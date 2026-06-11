import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { email, name, genre, location } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = await prisma.user.upsert({
      where: { email },
      update: {
        // Just update profile data if needed, don't force PREMIUM here
      },
      create: {
        email,
        passwordHash: 'dummy_hash',
        subscriptionStatus: 'FREE',
        trialUsed: false,
        artistProfile: {
          create: {
            name: name || email.split('@')[0],
            genre,
            location,
          }
        }
      },
      include: {
        artistProfile: true
      }
    });

    return NextResponse.json({ 
      success: true, 
      user: {
        id: user.id,
        email: user.email,
        subscriptionStatus: user.subscriptionStatus,
        trialEndsAt: user.trialEndsAt
      }
    });
  } catch (error) {
    console.error('Onboarding API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
