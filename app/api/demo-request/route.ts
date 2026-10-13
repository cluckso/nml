import { NextRequest, NextResponse } from "next/server"
import {
  DemoOutboundConfigError,
  DemoOutboundProviderError,
  createDemoOutboundCall,
} from "@/lib/demo-outbound-call"
import { normalizeE164 } from "@/lib/normalize-phone"
import { rateLimit } from "@/lib/rate-limit"

export async function POST(req: NextRequest) {
  try {
    const forwarded = req.headers.get("x-forwarded-for")
    const ip = forwarded?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown"

    let body: { phone?: unknown; consent?: unknown }
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: "Enter a valid mobile number." }, { status: 400 })
    }

    if (body.consent !== true) {
      return NextResponse.json({ error: "Consent is required." }, { status: 400 })
    }

    const phone = normalizeE164(typeof body.phone === "string" ? body.phone : "")
    if (!phone) {
      return NextResponse.json({ error: "Enter a valid mobile number." }, { status: 400 })
    }

    const ipLimit = rateLimit(`demo-outbound:${ip}`, 3, 60_000)
    const phoneLimit = rateLimit(`demo-outbound:phone:${phone}`, 2, 300_000)
    if (!ipLimit.allowed || !phoneLimit.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Try again in a bit." },
        { status: 429 }
      )
    }

    const { callId } = await createDemoOutboundCall(phone)
    console.info("Demo outbound call started", { callId })

    return NextResponse.json({ ok: true, call_id: callId })
  } catch (error) {
    if (error instanceof DemoOutboundConfigError) {
      console.error(error.message)
      return NextResponse.json({ error: "Could not start demo call." }, { status: 503 })
    }
    if (error instanceof DemoOutboundProviderError) {
      return NextResponse.json({ error: "Could not start demo call." }, { status: 502 })
    }
    console.error(error)
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 })
  }
}
