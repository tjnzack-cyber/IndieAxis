// src/app/api/releases/[id]/tasks/[taskId]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ taskId: string }> }) {
  const { taskId } = await params
  const body = await req.json()
  const updated = await prisma.releaseTask.update({
    where: { id: taskId },
    data: body,
  })
  return NextResponse.json(updated)
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ taskId: string }> }) {
  const { taskId } = await params
  await prisma.releaseTask.delete({ where: { id: taskId } })
  return NextResponse.json({ deleted: true })
}
