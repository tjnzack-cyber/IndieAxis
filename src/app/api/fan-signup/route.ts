// src/app/api/fan-signup/route.ts
// PUBLIC route — no auth required. Fans on the public EPK page submit their
// details here, saved straight into the artist's Fan CRM as a FAN contact.
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(req: NextRequest) {
  let body: any
  try {
    body = await req.json()
  } catch (e) {
    console.error('fan-signup: failed to parse request body', e)
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { artistId, email, name, phone, nationality } = body

  if (!artistId) {
    console.error('fan-signup: missing artistId. Body received:', body)
    return NextResponse.json({ error: 'artistId is required' }, { status: 400 })
  }
  if (!email) {
    console.error('fan-signup: missing email. Body received:', body)
    return NextResponse.json({ error: 'email is required' }, { status: 400 })
  }

  try {
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
        name: name?.trim() || email.split('@')[0],
        email,
        phone: phone?.trim() || undefined,
        nationality: nationality?.trim() || undefined,
        type: 'FAN',
        tags: ['mailing-list'],
        notes: 'Signed up via public EPK page',
      },
    })
    return NextResponse.json(contact, { status: 201 })
  } catch (err) {
    console.error('fan-signup: database error', err)
    return NextResponse.json({ error: 'Could not save signup' }, { status: 500 })
  }
}
