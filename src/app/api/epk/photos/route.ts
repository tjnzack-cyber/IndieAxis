// src/app/api/epk/photos/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { epkId, url, caption, order, isPrimary } = body

  if (!epkId || !url) {
    return NextResponse.json({ error: 'epkId and url required' }, { status: 400 })
  }

  if (isPrimary) {
    await prisma.ePKPhoto.updateMany({
      where: { epkId, isPrimary: true },
      data: { isPrimary: false },
    })
  }

  const photo = await prisma.ePKPhoto.create({
    data: { epkId, url, caption, order: order ?? 0, isPrimary: isPrimary ?? false },
  })
  return NextResponse.json(photo, { status: 201 })
}
