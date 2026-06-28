// src/app/api/fan-signup/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { Resend } from 'resend'

const FROM = 'IndieAxis <noreply@indieaxis.com>'
const BASE = 'https://indie-axis.vercel.app'

export async function POST(req: NextRequest) {
  let body: any
  try {
    body = await req.json()
  } catch (e) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { artistId, email, name, phone, nationality } = body

  if (!artistId) return NextResponse.json({ error: 'artistId is required' }, { status: 400 })
  if (!email) return NextResponse.json({ error: 'email is required' }, { status: 400 })

  try {
    const existing = await prisma.fanContact.findFirst({ where: { artistId, email } })
    if (existing) return NextResponse.json({ alreadySubscribed: true })

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

    // Send emails directly here — same pattern as forgot-password
    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY)

      const artist = await prisma.artistProfile.findUnique({
        where: { id: artistId },
        include: { user: true, epks: { take: 1 } },
      })

      if (artist) {
        const fanName = name?.trim() || email.split('@')[0]
        const epkUrl = `${BASE}/epk/${artist.epks[0]?.slug ?? ''}`

        // 1. Notify the artist
        await resend.emails.send({
          from: FROM,
          to: artist.user.email,
          subject: `New fan signup — ${fanName}`,
          html: `
            <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0f0f1a;color:#fff;padding:32px;border-radius:12px;">
              <h2 style="color:#fff;">You have a new fan! 🎉</h2>
              <p style="color:#a1a1aa;">Someone just signed up to your mailing list via your public press kit.</p>
              <div style="background:#18181b;border:1px solid #27272a;border-radius:8px;padding:16px;margin:24px 0;">
                <p style="margin:0;color:#fff;font-weight:bold;">${fanName}</p>
                <p style="margin:4px 0 0;color:#a1a1aa;font-size:14px;">${email}</p>
              </div>
              <a href="${BASE}/dashboard/fans" style="display:inline-block;padding:12px 24px;background:linear-gradient(90deg,#6c5ce7,#ec4899);color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;">View Fan CRM</a>
              <hr style="border-color:#27272a;margin:24px 0;">
              <p style="color:#52525b;font-size:12px;">IndieAxis — the all-in-one toolkit for independent artists.</p>
            </div>
          `,
        }).catch(err => console.error('Artist notification email failed:', err))

        // 2. Welcome the fan
        await resend.emails.send({
          from: FROM,
          to: email,
          subject: `You're on ${artist.name}'s list!`,
          html: `
            <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0f0f1a;color:#fff;padding:32px;border-radius:12px;">
              <h2 style="color:#fff;">You're on the list! 🎵</h2>
              <p style="color:#a1a1aa;">Thanks for subscribing to updates from <strong style="color:#fff;">${artist.name}</strong>. You'll be the first to know about new releases, shows, and everything in between.</p>
              <div style="text-align:center;margin:32px 0;">
                <a href="${epkUrl}" style="display:inline-block;padding:14px 28px;background:linear-gradient(90deg,#6c5ce7,#ec4899);color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;">View Artist Page</a>
              </div>
              <hr style="border-color:#27272a;margin:24px 0;">
              <p style="color:#52525b;font-size:12px;">Powered by <a href="${BASE}" style="color:#6c5ce7;">IndieAxis</a>.</p>
            </div>
          `,
        }).catch(err => console.error('Fan welcome email failed:', err))
      }
    } else {
      console.error('RESEND_API_KEY not set — skipping emails')
    }

    return NextResponse.json(contact, { status: 201 })
  } catch (err) {
    console.error('fan-signup error:', err)
    return NextResponse.json({ error: 'Could not save signup' }, { status: 500 })
  }
}
