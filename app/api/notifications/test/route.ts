import { NextRequest, NextResponse } from "next/server"
import { getAuthUserFromRequest } from "@/lib/auth"
import { db } from "@/lib/db"
import { sendEmailNotification, sendSMSNotification } from "@/lib/notifications"
import { normalizeE164 } from "@/lib/normalize-phone"

/**
 * POST /api/notifications/test — send a test email and/or SMS to the current user.
 * Body: { type: "email" | "sms" } or { type: "both" }.
 * SMS is sent to the user's saved notification phone (Settings → Notifications).
 * For SMS you must set "Phone number for SMS alerts" and have SMS consent on.
 */
export async function POST(req: NextRequest) {
  const user = await getAuthUserFromRequest(req)
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!user.businessId) return NextResponse.json({ error: "No business" }, { status: 400 })

  const business = await db.business.findUnique({
    where: { id: user.businessId },
  })
  if (!business) return NextResponse.json({ error: "Business not found" }, { status: 404 })

  let body: { type?: string } = {}
  try {
    body = await req.json()
  } catch {
    // optional body
  }
  const type = (body.type ?? "both") as string
  const doEmail = type === "email" || type === "both"
  const doSms = type === "sms" || type === "both"

  const results: { email?: string; sms?: string } = {}

  if (doEmail) {
    try {
      const retellCallId = `test-email-${Date.now()}`
      const call = await db.call.create({
        data: {
          retellCallId,
          businessId: business.id,
          duration: 0,
          minutes: 0,
          transcript: null,
          callerName: "Test",
          callerPhone: null,
          issueDescription: null,
          emergencyFlag: false,
          missedCallRecovery: false,
        },
      })
      const intake = {
        name: "Test Caller",
        phone: "+15550000000",
        issue_description: "This is a test notification.",
        emergency: false,
      }
      await sendEmailNotification(business, call, intake)
      results.email = "sent"
    } catch (err) {
      console.error("Test email error:", err)
      const msg = err instanceof Error ? err.message : "Failed to send"
      results.email = msg
      // Common causes: RESEND_API_KEY missing in production; Resend domain not verified (use RESEND_FROM_EMAIL=onboarding@resend.dev to test); email in spam
    }
  }

  if (doSms) {
    const ownerPhone = (user as { phoneNumber?: string | null }).phoneNumber
    const smsConsent = (user as { smsConsent?: boolean }).smsConsent
    const smsOptedOut = (user as { smsOptedOut?: boolean }).smsOptedOut
    const normalizedPhone = ownerPhone ? normalizeE164(ownerPhone) ?? ownerPhone : null

    if (!normalizedPhone) {
      results.sms = "Set your phone number in Notification settings first, then try again."
    } else if (!smsConsent || smsOptedOut) {
      results.sms = "Enable SMS consent in Notification settings (phone number + agree to receive SMS), then try again."
    } else {
      try {
        const retellCallId = `test-sms-${Date.now()}`
        const call = await db.call.create({
          data: {
            retellCallId,
            businessId: business.id,
            duration: 0,
            minutes: 0,
            transcript: null,
            callerName: "Test",
            callerPhone: null,
            issueDescription: null,
            emergencyFlag: false,
            missedCallRecovery: false,
          },
        })
        const intake = {
          name: "Test Caller",
          phone: "+15550000000",
          issue_description: "This is a test.",
          emergency: false,
        }
        await sendSMSNotification(
          business,
          call,
          intake
        )
        results.sms = "sent"
      } catch (err) {
        console.error("Test SMS error:", err)
        results.sms = err instanceof Error ? err.message : "Failed to send"
      }
    }
  }

  return NextResponse.json({ ok: true, results })
}
