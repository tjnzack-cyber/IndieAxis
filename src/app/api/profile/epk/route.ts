import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const artist = await prisma.artistProfile.findFirst();
    if (!artist) return NextResponse.json({ error: 'Artist not found' }, { status: 404 });

    const epks = await prisma.ePK.findMany({
      where: { artistId: artist.id }
    });

    return NextResponse.json(epks);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const artist = await prisma.artistProfile.findFirst();
    if (!artist) return NextResponse.json({ error: 'Artist not found' }, { status: 404 });

    const body = await request.json();
    const { title, slug, description, musicLinks, videoLinks, pressQuotes, isPublic } = body;

    const epk = await prisma.ePK.create({
      data: {
        artistId: artist.id,
        title,
        slug,
        description,
        musicLinks,
        videoLinks,
        pressQuotes,
        isPublic
      }
    });

    return NextResponse.json(epk);
  } catch (error) {
    console.error('Error creating EPK:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
