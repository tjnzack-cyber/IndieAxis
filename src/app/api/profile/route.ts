import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let artist = await prisma.artistProfile.findUnique({
      where: { userId: user.id },
      include: {
        user: true,
        epks: true,
        marketingPlans: {
          include: {
            tasks: {
              orderBy: { order: 'asc' }
            }
          }
        },
        gigApplications: {
          include: { gig: true }
        }
      }
    });

    if (!artist) {
      artist = await prisma.artistProfile.create({
        data: {
          userId: user.id,
          name: user.email.split('@')[0],
          bio: '',
          genre: '',
          location: '',
          socialLinks: {},
        },
        include: {
          user: true,
          epks: true,
          marketingPlans: {
            include: {
              tasks: { orderBy: { order: 'asc' } }
            }
          },
          gigApplications: {
            include: { gig: true }
          }
        }
      });
    }

    return NextResponse.json(artist);
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { name, bio, genre, location, socialLinks, profileImageUrl } = body;

    const artist = await prisma.artistProfile.findUnique({
      where: { userId: user.id }
    });

    if (!artist) {
      return NextResponse.json({ error: 'Artist not found' }, { status: 404 });
    }

    const updatedArtist = await prisma.artistProfile.update({
      where: { id: artist.id },
      data: { name, bio, genre, location,
socialLinks, profileImageUrl }
    });

    return NextResponse.json(updatedArtist);
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
