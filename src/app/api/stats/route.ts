// src/app/api/stats/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const artistId = req.nextUrl.searchParams.get('artistId')
  if (!artistId) return NextResponse.json({ error: 'artistId required' }, { status: 400 })

  const snapshots = await prisma.statSnapshot.findMany({
    where: { artistId },
    orderBy: { date: 'asc' },
  })
  return NextResponse.json(snapshots)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { artistId, spotifyListeners, instagramFollowers, tiktokFollowers, youtubeSubscribers, soundcloudPlays, date } = body

  if (!artistId) return NextResponse.json({ error: 'artistId required' }, { status: 400 })

  const snapshot = await prisma.statSnapshot.create({
    data: {
      artistId,
      spotifyListeners:   spotifyListeners   ? parseInt(spotifyListeners)   : undefined,
      instagramFollowers: instagramFollowers ? parseInt(instagramFollowers) : undefined,
      tiktokFollowers:    tiktokFollowers    ? parseInt(tiktokFollowers)    : undefined,
      youtubeSubscribers: youtubeSubscribers ? parseInt(youtubeSubscribers) : undefined,
      soundcloudPlays:    soundcloudPlays    ? parseInt(soundcloudPlays)    : undefined,
      date: date ? new Date(date) : new Date(),
    },
  })
  return NextResponse.json(snapshot, { status: 201 })
}
