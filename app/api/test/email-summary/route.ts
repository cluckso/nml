import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { resolveClient } from "@/lib/resolve-client"
import { normalizeE164 } from "@/lib/normalize-phone"
import { sendEmailNotification } from "@/lib/notifications"

/**
 * Test endpoint to trigger the call summary email without a real Retell webhook.
 * Resolves the business by the "call forwarded from" number (primaryForwardingNumber)
 * and sends one sample email to the business owner.
 *
 * POST /api/test/email-summary
 * Body: { "forwarded_from_number": "+16086421459" } (optional; default +16086421459)
 *
 * Allowed only in development or when ?secret=TEST_EMAIL_SECRET (or header x-test-secret) is set.
 */
export async function POST(req: NextRequest) {
  const isDev = process.env.NODE_ENV === "development"
  const secret = req.nextUrl.searchParams.get("secret") ?? req.headers.get("x-test-secret")
  const allowed = isDev || (process.env.TEST_EMAIL_SECRET && secret === process.env.TEST_EMAIL_SECRET)
  if (!allowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  let body: { forwarded_from_number?: string } = {}
  try {
    body = await req.json()
  } catch {
    // optional body
  }
  const forwardedFrom =
    body.forwarded_from_number ?? process.env.TEST_EMAIL_FORWARDED_FROM ?? "+16086421459"
  const normalized = normalizeE164(forwardedFrom) ?? forwardedFrom

  const business = await resolveClient(normalized)
  if (!business) {
    return NextResponse.json(
      {
        error: "Business not found",
        hint: `No active business with primaryForwardingNumber = ${normalized}. Set that number on a test business (e.g. in onboarding) to receive the email.`,
      },
      { status: 404 }
    )
  }

  const retellCallId = `test-email-${Date.now()}`
  const call = await db.call.create({
    data: {
      retellCallId,
      businessId: business.id,
      duration: 120,
      minutes: 2,
      transcript: "Test: Caller asked for a quote. Agent took name and phone.",
      summary: "Test call summary: caller requested a quote; name and phone captured.",
      callerName: "Test Caller",
      callerPhone: "+15551234567",
      issueDescription: "Need a quote for HVAC service.",
      emergencyFlag: false,
      missedCallRecovery: false,
    },
  })

  const intake = {
    name: "Test Caller",
    phone: "+15551234567",
    address: "123 Test St",
    city: "Test City",
    issue_description: "Need a quote for HVAC service.",
    emergency: false,
  }

  try {
    await sendEmailNotification(business, call, intake)
  } catch (err) {
    console.error("Test email send error:", err)
    return NextResponse.json(
      { error: "Email send failed", detail: String(err) },
      { status: 500 }
    )
  }

  return NextResponse.json({
    ok: true,
    message: `Test summary email triggered for business "${business.name}" (forwarded_from ${normalized}). Check the business owner's inbox.`,
  })
}
