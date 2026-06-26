import { NextRequest, NextResponse } from "next/server"

/**
 * Public SMS opt-in endpoint for the form on /sms-terms.
 * Used for Twilio toll-free verification (proof of consent URL).
 * Accepts unauthenticated submissions; we only validate and return success.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const consent = body?.consent === true
    if (!consent) {
      return NextResponse.json(
        { error: "Consent is required", ok: false },
        { status: 400 }
      )
    }
    // Optional: log or store phone if provided (e.g. for lead list). For Twilio verification we just need 200.
    const phone = typeof body?.phoneNumber === "string" ? body.phoneNumber.trim() : null
    if (phone) {
      // Could store in DB here if we add a public_opt_ins table; not required for verification
    }
    return NextResponse.json({ ok: true, message: "Opt-in received." })
  } catch {
    return NextResponse.json({ error: "Invalid request", ok: false }, { status: 400 })
  }
}
