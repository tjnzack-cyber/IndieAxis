import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    let artist = await prisma.artistProfile.findFirst({
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
      const user = await prisma.user.findFirst();
      if (!user) {
        return NextResponse.json({ error: 'No user found' }, { status: 404 });
      }
      artist = await prisma.artistProfile.create({
        data: {
          userId: user.id,
          name: 'Artist',
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
