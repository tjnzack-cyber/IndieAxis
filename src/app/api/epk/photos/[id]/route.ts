// src/app/api/epk/photos/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()
  const { isPrimary, caption, order } = body

  if (isPrimary) {
    const photo = await prisma.ePKPhoto.findUnique({ where: { id: params.id } })
    if (photo) {
      await prisma.ePKPhoto.updateMany({
        where: { epkId: photo.epkId, isPrimary: true },
        data: { isPrimary: false },
      })
    }
  }

  const updated = await prisma.ePKPhoto.update({
    where: { id: params.id },
    data: {
      ...(isPrimary !== undefined ? { isPrimary } : {}),
      ...(caption !== undefined ? { caption } : {}),
      ...(order !== undefined ? { order } : {}),
    },
  })
  return NextResponse.json(updated)
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  await prisma.ePKPhoto.delete({ where: { id: params.id } })
  return NextResponse.json({ deleted: true })
}
