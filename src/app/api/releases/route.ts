// src/app/api/releases/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const artistId = req.nextUrl.searchParams.get('artistId')
  if (!artistId) return NextResponse.json({ error: 'artistId required' }, { status: 400 })

  const releases = await prisma.release.findMany({
    where: { artistId },
    include: { tasks: { orderBy: { order: 'asc' } } },
    orderBy: { releaseDate: 'asc' },
  })
  return NextResponse.json(releases)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { artistId, title, type, status, releaseDate, notes } = body

  if (!artistId || !title) {
    return NextResponse.json({ error: 'artistId and title required' }, { status: 400 })
  }

  const release = await prisma.release.create({
    data: {
      artistId,
      title,
      type: type ?? 'SINGLE',
      status: status ?? 'IDEA',
      releaseDate: releaseDate ? new Date(releaseDate) : undefined,
      notes,
    },
    include: { tasks: true },
  })
  return NextResponse.json(release, { status: 201 })
}
