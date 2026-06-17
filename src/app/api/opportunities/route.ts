// src/app/api/opportunities/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const artistId = req.nextUrl.searchParams.get('artistId')
  if (!artistId) return NextResponse.json({ error: 'artistId required' }, { status: 400 })

  const opportunities = await prisma.opportunity.findMany({
    where: { artistId },
    orderBy: [{ deadline: 'asc' }, { createdAt: 'desc' }],
  })
  return NextResponse.json(opportunities)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { artistId, title, organization, type, deadline, prize, description, applyUrl, status, notes } = body

  if (!artistId || !title) {
    return NextResponse.json({ error: 'artistId and title are required' }, { status: 400 })
  }

  const opportunity = await prisma.opportunity.create({
    data: {
      artistId,
      title,
      organization,
      type,
      deadline: deadline ? new Date(deadline) : undefined,
      prize,
      description,
      applyUrl,
      status,
      notes,
    },
  })
  return NextResponse.json(opportunity, { status: 201 })
}
