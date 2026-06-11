import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    // For now, we'll fetch a hardcoded artist since auth isn't fully implemented
    // In a real app, this would be based on the session user
    const artist = await prisma.artistProfile.findFirst({
      include: {
        user: true,
        epks: true,
        marketingPlans: {
          include: {
            tasks: {
              orderBy: {
                order: 'asc'
              }
            }
          }
        },
        gigApplications: {
          include: {
            gig: true
          }
        }
      }
    });

    if (!artist) {
      return NextResponse.json({ error: 'Artist not found' }, { status: 404 });
    }

    // Lazy trial expiration check
    if (artist.user.subscriptionStatus === 'PREMIUM' && artist.user.trialEndsAt) {
      if (new Date(artist.user.trialEndsAt) < new Date()) {
        // Check if there's a successful payment
        const successfulPayment = await prisma.payment.findFirst({
          where: {
            userId: artist.user.id,
            status: 'COMPLETED'
          }
        });

        if (!successfulPayment) {
          await prisma.user.update({
            where: { id: artist.user.id },
            data: { 
              subscriptionStatus: 'FREE',
              trialEndsAt: null
            }
          });
          artist.user.subscriptionStatus = 'FREE';
          artist.user.trialEndsAt = null;
        }
      }
    }

    return NextResponse.json(artist);
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { name, bio, genre, location, socialLinks, profileImageUrl } = body;

    const artist = await prisma.artistProfile.findFirst();

    if (!artist) {
      return NextResponse.json({ error: 'Artist not found' }, { status: 404 });
    }

    const updatedArtist = await prisma.artistProfile.update({
      where: { id: artist.id },
      data: {
        name,
        bio,
        genre,
        location,
        socialLinks,
        profileImageUrl
      }
    });

    return NextResponse.json(updatedArtist);
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
