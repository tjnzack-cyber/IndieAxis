// src/app/api/pitching-windows/route.ts
// GET  — list all pitching windows (optionally filter by category)
// POST — admin/seed a new window (can also be used to let artists save custom ones)
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const category = req.nextUrl.searchParams.get('category')

  const windows = await prisma.pitchingWindow.findMany({
    where: category ? { category } : undefined,
    orderBy: { deadline: 'asc' },
  })
  return NextResponse.json(windows)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { title, description, month, location, deadline, category } = body

  if (!title || !month) {
    return NextResponse.json({ error: 'title and month required' }, { status: 400 })
  }

  const window = await prisma.pitchingWindow.create({
    data: { title, description, month, location, deadline, category },
  })
  return NextResponse.json(window, { status: 201 })
}
