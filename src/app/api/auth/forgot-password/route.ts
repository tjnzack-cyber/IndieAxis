import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { Resend } from "resend"
import { v4 as uuidv4 } from "uuid"

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      // For security reasons, don't reveal if user exists
      return NextResponse.json({ message: "If an account with that email exists, we sent a reset link." })
    }

    const token = uuidv4()
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    await prisma.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt,
      },
    })

    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${token}`

    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY)
      await resend.emails.send({
        from: "IndieAxis <noreply@indieaxis.com>",
        to: email,
        subject: "Reset your IndieAxis password",
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Reset your IndieAxis password</h2>
            <p>You requested a password reset for your IndieAxis account.</p>
            <p>Click the button below to reset your password. This link will expire in 24 hours.</p>
            <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #ec4899; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">Reset Password</a>
            <p>Or copy and paste this link into your browser:</p>
            <p>${resetUrl}</p>
            <p>If you did not request this, please ignore this email.</p>
          </div>
        `,
      })
    } else {
      console.error("RESEND_API_KEY is not set. Skipping email send. Reset URL:", resetUrl)
    }

    return NextResponse.json({ message: "If an account with that email exists, we sent a reset link." })
  } catch (error) {
    console.error("Forgot password error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
