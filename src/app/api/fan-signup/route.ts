// src/app/api/fan-signup/route.ts
// PUBLIC route — no auth required. Fans on the public EPK page submit their
// email here, and it's saved straight into the artist's Fan CRM as a FAN contact.
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { artistId, email, name } = body

  if (!artistId || !email) {
    return NextResponse.json({ error: 'artistId and email required' }, { status: 400 })
  }

  // Avoid duplicate signups for the same email + artist
  const existing = await prisma.fanContact.findFirst({
    where: { artistId, email },
  })
  if (existing) {
    return NextResponse.json({ alreadySubscribed: true })
  }

  const contact = await prisma.fanContact.create({
    data: {
      artistId,
      name: name || email.split('@')[0],
      email,
      type: 'FAN',
      tags: ['mailing-list'],
      notes: 'Signed up via public EPK page',
    },
  })
  return NextResponse.json(contact, { status: 201 })
}
