import type { NextRequest } from "next/server"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i

export async function POST(req: NextRequest) {
  try {
    const { email, postalCode = "", skillLevels = "", timestamp } = await req.json()
    console.log("[v0] Waitlist submission received:", { email, postalCode, skillLevels, timestamp })
    
    if (!email || !EMAIL_RE.test(email)) {
      console.log("[v0] Invalid email:", email)
      return new Response(JSON.stringify({ ok: false, error: "Invalid email" }), { status: 400 })
    }

    const webhook = "https://hooks.zapier.com/hooks/catch/22788039/ugfdooi/"
    const payload = {
      email,
      postalCode,
      skillLevels,
      timestamp: timestamp || new Date().toISOString(),
      source: "breakawaypickleball.ca",
    }
    console.log("[v0] Sending to Zapier:", payload)
    
    const z = await fetch(webhook, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
    
    console.log("[v0] Zapier response status:", z.status)
    
    if (!z.ok) {
      console.log("[v0] Zapier error response")
      return new Response(JSON.stringify({ ok: false, error: "Upstream error" }), { status: 502 })
    }
    console.log("[v0] Waitlist submission successful")
    return new Response(JSON.stringify({ ok: true }), { status: 200 })
  } catch {
    return new Response(JSON.stringify({ ok: false, error: "Unexpected error" }), { status: 500 })
  }
}

export async function GET() {
  return new Response("Method Not Allowed", { status: 405 })
}
