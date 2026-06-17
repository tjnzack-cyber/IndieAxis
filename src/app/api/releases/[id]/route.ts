// src/app/api/releases/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const { releaseDate, ...rest } = body

  const release = await prisma.release.update({
    where: { id },
    data: {
      ...rest,
      ...(releaseDate !== undefined ? { releaseDate: releaseDate ? new Date(releaseDate) : null } : {}),
    },
    include: { tasks: { orderBy: { order: 'asc' } } },
  })
  return NextResponse.json(release)
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.release.delete({ where: { id } })
  return NextResponse.json({ deleted: true })
}
