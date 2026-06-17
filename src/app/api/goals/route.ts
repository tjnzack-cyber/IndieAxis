// src/app/api/goals/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const artistId = req.nextUrl.searchParams.get('artistId')
  if (!artistId) return NextResponse.json({ error: 'artistId required' }, { status: 400 })

  const goals = await prisma.artistGoal.findMany({
    where: { artistId, archived: false },
    include: { tasks: { orderBy: { order: 'asc' } } },
    orderBy: { dueDate: 'asc' },
  })

  const goalsWithProgress = goals.map((g) => {
    const total = g.tasks.length
    const done = g.tasks.filter((t) => t.done).length
    return { ...g, progress: total > 0 ? Math.round((done / total) * 100) : g.progress }
  })

  return NextResponse.json(goalsWithProgress)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { artistId, title, category, dueDate } = body

  if (!artistId || !title) {
    return NextResponse.json({ error: 'artistId and title are required' }, { status: 400 })
  }

  const goal = await prisma.artistGoal.create({
    data: {
      artistId,
      title,
      category,
      dueDate: dueDate ? new Date(dueDate) : undefined,
    },
    include: { tasks: true },
  })
  return NextResponse.json(goal, { status: 201 })
}
