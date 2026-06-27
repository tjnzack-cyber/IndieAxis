// src/app/api/email/route.ts
// Central email sending route — handles all 3 notification types:
// 1. Artist notified when a fan signs up via EPK page
// 2. Welcome email to the fan who just signed up
// 3. Deadline reminder emails (called by cron or manually)
import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import prisma from '@/lib/prisma'

const FROM = 'IndieAxis <noreply@indieaxis.com>'

function resend() {
  if (!process.env.RESEND_API_KEY) throw new Error('RESEND_API_KEY not set')
  return new Resend(process.env.RESEND_API_KEY)
}

// ── Email templates ───────────────────────────────────────────────────────────

function fanSignupArtistEmail(artistName: string, fanName: string, fanEmail: string) {
  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0f0f1a;color:#fff;padding:32px;border-radius:12px;">
      <div style="margin-bottom:24px;">
        <span style="background:linear-gradient(90deg,#6c5ce7,#ec4899);-webkit-background-clip:text;-webkit-text-fill-color:transparent;font-size:20px;font-weight:900;">IndieAxis</span>
      </div>
      <h2 style="color:#fff;margin-bottom:8px;">You have a new fan! 🎉</h2>
      <p style="color:#a1a1aa;">Someone just signed up to your mailing list via your public press kit.</p>
      <div style="background:#18181b;border:1px solid #27272a;border-radius:8px;padding:16px;margin:24px 0;">
        <p style="margin:0;color:#a1a1aa;font-size:14px;">Fan details</p>
        <p style="margin:8px 0 0;color:#fff;font-weight:bold;">${fanName}</p>
        <p style="margin:4px 0 0;color:#a1a1aa;font-size:14px;">${fanEmail}</p>
      </div>
      <p style="color:#a1a1aa;font-size:14px;">View all your fan contacts in your <a href="${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/fans" style="color:#ec4899;">Fan CRM</a>.</p>
      <hr style="border-color:#27272a;margin:24px 0;">
      <p style="color:#52525b;font-size:12px;">IndieAxis — the all-in-one toolkit for independent artists.</p>
    </div>
  `
}

function fanWelcomeEmail(artistName: string, epkSlug: string) {
  const epkUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/epk/${epkSlug}`
  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0f0f1a;color:#fff;padding:32px;border-radius:12px;">
      <div style="margin-bottom:24px;">
        <span style="background:linear-gradient(90deg,#6c5ce7,#ec4899);-webkit-background-clip:text;-webkit-text-fill-color:transparent;font-size:20px;font-weight:900;">IndieAxis</span>
      </div>
      <h2 style="color:#fff;margin-bottom:8px;">You're on the list! 🎵</h2>
      <p style="color:#a1a1aa;">Thanks for subscribing to updates from <strong style="color:#fff;">${artistName}</strong>. You'll be the first to know about new releases, shows, and everything in between.</p>
      <div style="text-align:center;margin:32px 0;">
        <a href="${epkUrl}" style="display:inline-block;padding:14px 28px;background:linear-gradient(90deg,#6c5ce7,#ec4899);color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;">View Artist Page</a>
      </div>
      <hr style="border-color:#27272a;margin:24px 0;">
      <p style="color:#52525b;font-size:12px;">You received this because you signed up at ${artistName}'s artist page. Powered by <a href="${process.env.NEXT_PUBLIC_BASE_URL}" style="color:#6c5ce7;">IndieAxis</a>.</p>
    </div>
  `
}

function deadlineReminderEmail(artistName: string, items: { title: string; deadline: string; type: string }[]) {
  const rows = items.map(item => `
    <tr>
      <td style="padding:12px;border-bottom:1px solid #27272a;color:#fff;">${item.title}</td>
      <td style="padding:12px;border-bottom:1px solid #27272a;color:#a1a1aa;">${item.type}</td>
      <td style="padding:12px;border-bottom:1px solid #27272a;color:#ec4899;font-weight:bold;">${item.deadline}</td>
    </tr>
  `).join('')

  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0f0f1a;color:#fff;padding:32px;border-radius:12px;">
      <div style="margin-bottom:24px;">
        <span style="background:linear-gradient(90deg,#6c5ce7,#ec4899);-webkit-background-clip:text;-webkit-text-fill-color:transparent;font-size:20px;font-weight:900;">IndieAxis</span>
      </div>
      <h2 style="color:#fff;margin-bottom:8px;">Upcoming deadlines 📅</h2>
      <p style="color:#a1a1aa;">Hey ${artistName}, here are your upcoming deadlines in the next 14 days.</p>
      <table style="width:100%;border-collapse:collapse;margin:24px 0;background:#18181b;border-radius:8px;overflow:hidden;">
        <thead>
          <tr style="background:#27272a;">
            <th style="padding:12px;text-align:left;color:#a1a1aa;font-size:12px;text-transform:uppercase;">Title</th>
            <th style="padding:12px;text-align:left;color:#a1a1aa;font-size:12px;text-transform:uppercase;">Type</th>
            <th style="padding:12px;text-align:left;color:#a1a1aa;font-size:12px;text-transform:uppercase;">Deadline</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <div style="text-align:center;margin:24px 0;">
        <a href="${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/profile" style="display:inline-block;padding:12px 24px;background:linear-gradient(90deg,#6c5ce7,#ec4899);color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;">Open Dashboard</a>
      </div>
      <hr style="border-color:#27272a;margin:24px 0;">
      <p style="color:#52525b;font-size:12px;">IndieAxis — the all-in-one toolkit for independent artists.</p>
    </div>
  `
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { type } = body
    const r = resend()

    if (type === 'fan-signup') {
      // Called from fan-signup route after a fan subscribes
      const { artistId, fanName, fanEmail } = body
      if (!artistId || !fanEmail) {
        return NextResponse.json({ error: 'artistId and fanEmail required' }, { status: 400 })
      }

      const artist = await prisma.artistProfile.findUnique({
        where: { id: artistId },
        include: {
          user: true,
          epks: { take: 1 },
        },
      })
      if (!artist) return NextResponse.json({ error: 'Artist not found' }, { status: 404 })

      const epkSlug = artist.epks[0]?.slug ?? ''

      // 1. Notify the artist
      await r.emails.send({
        from: FROM,
        to: artist.user.email,
        subject: `New fan signup — ${fanName || fanEmail}`,
        html: fanSignupArtistEmail(artist.name, fanName || fanEmail, fanEmail),
      })

      // 2. Welcome the fan
      await r.emails.send({
        from: FROM,
        to: fanEmail,
        subject: `You're on ${artist.name}'s list!`,
        html: fanWelcomeEmail(artist.name, epkSlug),
      })

      return NextResponse.json({ sent: true })
    }

    if (type === 'deadline-reminder') {
      // Can be called manually or by a cron job
      // Finds all artists with deadlines in the next 14 days and emails them
      const { artistId } = body

      const artist = await prisma.artistProfile.findUnique({
        where: { id: artistId },
        include: { user: true },
      })
      if (!artist) return NextResponse.json({ error: 'Artist not found' }, { status: 404 })

      const now = new Date()
      const in14 = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000)

      // Gather upcoming release dates
      const releases = await prisma.release.findMany({
        where: {
          artistId,
          releaseDate: { gte: now, lte: in14 },
          status: { not: 'RELEASED' },
        },
      })

      // Gather upcoming opportunity deadlines
      const opportunities = await prisma.opportunity.findMany({
        where: {
          artistId,
          deadline: { gte: now, lte: in14 },
          status: { notIn: ['ACCEPTED', 'REJECTED', 'WITHDRAWN'] },
        },
      })

      // Gather upcoming goal due dates
      const goals = await prisma.artistGoal.findMany({
        where: {
          artistId,
          dueDate: { gte: now, lte: in14 },
          archived: false,
        },
      })

      const items = [
        ...releases.map(r => ({
          title: r.title,
          type: 'Release',
          deadline: r.releaseDate!.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        })),
        ...opportunities.map(o => ({
          title: o.title,
          type: 'Opportunity',
          deadline: o.deadline!.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        })),
        ...goals.map(g => ({
          title: g.title,
          type: 'Goal',
          deadline: g.dueDate!.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        })),
      ]

      if (items.length === 0) {
        return NextResponse.json({ sent: false, reason: 'No upcoming deadlines' })
      }

      await r.emails.send({
        from: FROM,
        to: artist.user.email,
        subject: `You have ${items.length} deadline${items.length > 1 ? 's' : ''} coming up`,
        html: deadlineReminderEmail(artist.name, items),
      })

      return NextResponse.json({ sent: true, count: items.length })
    }

    return NextResponse.json({ error: 'Unknown email type' }, { status: 400 })
  } catch (error) {
    console.error('Email send error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send email' },
      { status: 500 }
    )
  }
}
