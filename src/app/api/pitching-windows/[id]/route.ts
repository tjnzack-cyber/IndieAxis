// src/app/api/pitching-windows/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.pitchingWindow.delete({ where: { id } })
  return NextResponse.json({ deleted: true })
}
