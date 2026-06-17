// src/app/api/epk/route.ts
// Works with your EXISTING EPK model — uses isPublic, musicLinks, pressQuotes, etc.
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const artistId = req.nextUrl.searchParams.get('artistId')
  if (!artistId) return NextResponse.json({ error: 'artistId required' }, { status: 400 })

  // An artist can have multiple EPKs — return all of them with photos
  const epks = await prisma.ePK.findMany({
    where: { artistId },
    include: { photos: { orderBy: { order: 'asc' } } },
  })
  return NextResponse.json(epks)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { artistId, title, slug, description, musicLinks, videoLinks, pressQuotes, isPublic } = body

  if (!artistId || !slug || !title) {
    return NextResponse.json({ error: 'artistId, title and slug are required' }, { status: 400 })
  }

  // Upsert by slug so re-saving the same EPK updates it
  const epk = await prisma.ePK.upsert({
    where: { slug },
    create: { artistId, title, slug, description, musicLinks, videoLinks, pressQuotes, isPublic: isPublic ?? false },
    update: { title, description, musicLinks, videoLinks, pressQuotes, ...(isPublic !== undefined ? { isPublic } : {}) },
    include: { photos: { orderBy: { order: 'asc' } } },
  })
  return NextResponse.json(epk)
}
