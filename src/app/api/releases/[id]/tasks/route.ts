// src/app/api/releases/[id]/tasks/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const { title, dueDate, order } = body

  if (!title) return NextResponse.json({ error: 'title required' }, { status: 400 })

  const task = await prisma.releaseTask.create({
    data: {
      releaseId: id,
      title,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      order: order ?? 0,
    },
  })
  return NextResponse.json(task, { status: 201 })
}
