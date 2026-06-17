// src/app/api/goals/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()
  const { dueDate, ...rest } = body

  const goal = await prisma.artistGoal.update({
    where: { id: params.id },
    data: {
      ...rest,
      ...(dueDate !== undefined ? { dueDate: dueDate ? new Date(dueDate) : null } : {}),
    },
    include: { tasks: { orderBy: { order: 'asc' } } },
  })
  return NextResponse.json(goal)
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  await prisma.artistGoal.delete({ where: { id: params.id } })
  return NextResponse.json({ deleted: true })
}
