// src/app/api/fans/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const artistId = req.nextUrl.searchParams.get('artistId')
  if (!artistId) return NextResponse.json({ error: 'artistId required' }, { status: 400 })

  const contacts = await prisma.fanContact.findMany({
    where: { artistId },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(contacts)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { artistId, name, email, phone, type, tags, notes, location, instagram, twitter, metAt } = body

  if (!artistId || !name) {
    return NextResponse.json({ error: 'artistId and name required' }, { status: 400 })
  }

  const contact = await prisma.fanContact.create({
    data: {
      artistId, name, email, phone,
      type: type ?? 'FAN',
      tags: tags ?? [],
      notes, location, instagram, twitter, metAt,
    },
  })
  return NextResponse.json(contact, { status: 201 })
}
