// src/app/api/revenue/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const artistId = req.nextUrl.searchParams.get('artistId')
  if (!artistId) return NextResponse.json({ error: 'artistId required' }, { status: 400 })

  const entries = await prisma.revenueEntry.findMany({
    where: { artistId },
    orderBy: { date: 'desc' },
  })
  return NextResponse.json(entries)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { artistId, type, amount, currency, description, source, date } = body

  if (!artistId || !amount) {
    return NextResponse.json({ error: 'artistId and amount required' }, { status: 400 })
  }

  const entry = await prisma.revenueEntry.create({
    data: {
      artistId,
      type: type ?? 'OTHER',
      amount: parseFloat(amount),
      currency: currency ?? 'USD',
      description,
      source,
      date: date ? new Date(date) : new Date(),
    },
  })
  return NextResponse.json(entry, { status: 201 })
}
