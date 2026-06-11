import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, slug, description, musicLinks, videoLinks, pressQuotes, isPublic } = body;

    const epk = await prisma.ePK.update({
      where: { id },
      data: {
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
    console.error('Error updating EPK:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.ePK.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting EPK:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
