import { type NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

const OWNER_EMAIL = "breakawaypickleball@gmail.com"
const FROM_EMAIL = "Breakaway Pickleball <bookings@breakawaypickleball.ca>"

interface WaitlistPayload {
  email: string
  postalCode?: string
  skillLevels?: string
  timestamp?: string
}

export async function POST(req: NextRequest) {
  let payload: WaitlistPayload
  try {
    payload = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 })
  }

  const email = (payload.email ?? "").trim()
  const postalCode = (payload.postalCode ?? "").trim()
  const skillLevels = (payload.skillLevels ?? "").trim()
  const timestamp = payload.timestamp || new Date().toISOString()

  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, error: "Invalid email" }, { status: 400 })
  }

  const submittedAt = new Date(timestamp).toISOString()
  const userAgent = req.headers.get("user-agent") ?? ""
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    ""

  const record = { email, postalCode, skillLevels, submittedAt, userAgent, ip }

  console.log("[waitlist] signup", JSON.stringify(record))

  if (resend) {
    try {
      const subject = `New waitlist signup — ${email}`
      const html = `
        <h2>New waitlist signup</h2>
        <table style="border-collapse:collapse">
          <tr><td style="padding:4px 12px 4px 0"><strong>Email</strong></td><td>${escapeHtml(email)}</td></tr>
          <tr><td style="padding:4px 12px 4px 0"><strong>Postal code</strong></td><td>${escapeHtml(postalCode) || "—"}</td></tr>
          <tr><td style="padding:4px 12px 4px 0"><strong>Skill level(s)</strong></td><td>${escapeHtml(skillLevels) || "—"}</td></tr>
          <tr><td style="padding:4px 12px 4px 0"><strong>Submitted at</strong></td><td>${escapeHtml(submittedAt)}</td></tr>
        </table>
      `.trim()

      const { error } = await resend.emails.send({
        from: FROM_EMAIL,
        to: OWNER_EMAIL,
        replyTo: email,
        subject,
        html,
      })
      if (error) console.error("[waitlist] resend error", error)
    } catch (err) {
      console.error("[waitlist] resend threw", err)
    }
  } else {
    console.warn("[waitlist] RESEND_API_KEY not set — no owner email sent")
  }

  const zapUrl = process.env.ZAPIER_WEBHOOK_URL
  if (zapUrl) {
    try {
      await fetch(zapUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, postalCode, skillLevels, timestamp: submittedAt }),
      })
    } catch (err) {
      console.error("[waitlist] zapier forward failed", err)
    }
  }

  return NextResponse.json({ ok: true })
}

export async function GET() {
  return NextResponse.json({ ok: false, error: "Method not allowed" }, { status: 405 })
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}
