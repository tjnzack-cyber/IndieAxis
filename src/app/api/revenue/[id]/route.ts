// src/app/api/revenue/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.revenueEntry.delete({ where: { id } })
  return NextResponse.json({ deleted: true })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const { date, ...rest } = body
  const updated = await prisma.revenueEntry.update({
    where: { id },
    data: {
      ...rest,
      ...(date ? { date: new Date(date) } : {}),
    },
  })
  return NextResponse.json(updated)
}
