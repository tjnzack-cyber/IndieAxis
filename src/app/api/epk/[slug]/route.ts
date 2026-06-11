import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const epk = await prisma.ePK.findUnique({
      where: { slug },
      include: {
        artist: true
      }
    });

    if (!epk) {
      return NextResponse.json({ error: 'EPK not found' }, { status: 404 });
    }

    if (!epk.isPublic) {
      return NextResponse.json({ error: 'This EPK is private' }, { status: 403 });
    }

    return NextResponse.json(epk);
  } catch (error) {
    console.error('Error fetching EPK:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
