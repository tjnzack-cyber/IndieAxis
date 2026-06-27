// src/app/api/fan-signup/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(req: NextRequest) {
  let body: any
  try {
    body = await req.json()
  } catch (e) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { artistId, email, name, phone, nationality } = body

  if (!artistId) {
    console.error('fan-signup: missing artistId. Body:', body)
    return NextResponse.json({ error: 'artistId is required' }, { status: 400 })
  }
  if (!email) {
    console.error('fan-signup: missing email. Body:', body)
    return NextResponse.json({ error: 'email is required' }, { status: 400 })
  }

  try {
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

    // Fire emails in background — don't block the response
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://indie-axis.vercel.app'
    fetch(`${baseUrl}/api/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'fan-signup',
        artistId,
        fanName: name?.trim() || email.split('@')[0],
        fanEmail: email,
      }),
    }).catch(err => console.error('Email trigger failed:', err))

    return NextResponse.json(contact, { status: 201 })
  } catch (err) {
    console.error('fan-signup: database error', err)
    return NextResponse.json({ error: 'Could not save signup' }, { status: 500 })
  }
}
