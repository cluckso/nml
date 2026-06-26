import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import twilio from "twilio"

/**
 * POST /api/webhooks/twilio/sms
 *
 * Twilio inbound SMS webhook — handles opt-out (STOP), opt-in (START/UNSTOP), and HELP.
 * Returns TwiML to acknowledge.
 *
 * Twilio sends: From, To, Body, etc.
 * We respond with TwiML XML.
 *
 * IMPORTANT: Configure this URL in Twilio Console under your toll-free number's
 * Messaging > "A MESSAGE COMES IN" webhook.
 */
export async function POST(req: NextRequest) {
  try {
    // Validate Twilio request signature if auth token is set
    const authToken = process.env.TWILIO_AUTH_TOKEN
    if (authToken) {
      const signature = req.headers.get("x-twilio-signature") || ""
      const url = req.url
      // We need to parse body as form data for Twilio
      // Clone the request since we need to read it twice
      const cloned = req.clone()
      const formData = await cloned.formData()
      const params: Record<string, string> = {}
      formData.forEach((value, key) => {
        params[key] = value.toString()
      })

      const isValid = twilio.validateRequest(authToken, signature, url, params)
      if (!isValid) {
        console.warn("Invalid Twilio signature on SMS webhook")
        return new NextResponse("Forbidden", { status: 403 })
      }
    }

    const formData = await req.formData()
    const from = formData.get("From")?.toString()?.trim() || ""
    const body = formData.get("Body")?.toString()?.trim().toUpperCase() || ""

    if (!from) {
      return twimlResponse("")
    }

    // Normalize the phone number (remove non-digits, add +1 if needed)
    const normalized = normalizePhone(from)

    if (body === "STOP" || body === "UNSUBSCRIBE" || body === "CANCEL" || body === "QUIT" || body === "END") {
      // Opt out the user
      await optOutByPhone(normalized)
      return twimlResponse(
        "You have been unsubscribed from CallGrabbr messages. You will not receive any more texts. Reply START to re-subscribe."
      )
    }

    if (body === "START" || body === "UNSTOP" || body === "SUBSCRIBE" || body === "YES") {
      // Re-opt-in the user
      await optInByPhone(normalized)
      return twimlResponse(
        "You have been re-subscribed to CallGrabbr messages. Reply STOP to unsubscribe. Msg & data rates may apply."
      )
    }

    if (body === "HELP" || body === "INFO") {
      return twimlResponse(
        "CallGrabbr: Call alerts & lead notifications. Reply STOP to opt out. Msg & data rates may apply. For help, visit callgrabbr.com or email support."
      )
    }

    // Unknown keyword — no auto-response (avoid unintended messaging costs)
    return twimlResponse("")
  } catch (error) {
    console.error("Twilio SMS webhook error:", error)
    return twimlResponse("")
  }
}

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "")
  if (digits.length === 10) return `+1${digits}`
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`
  return phone.startsWith("+") ? phone : `+${digits}`
}

async function optOutByPhone(phone: string) {
  // Find users with this phone number and mark them as opted out
  const users = await db.user.findMany({
    where: {
      OR: [
        { phoneNumber: phone },
        { phoneNumber: phone.replace("+1", "") },
        { phoneNumber: phone.replace("+", "") },
      ],
    },
  })

  for (const user of users) {
    await db.user.update({
      where: { id: user.id },
      data: {
        smsOptedOut: true,
        smsOptedOutAt: new Date(),
      },
    })
  }

  if (users.length === 0) {
    console.info(`STOP received from ${phone} but no matching user found`)
  } else {
    console.info(`Opted out ${users.length} user(s) for phone ${phone}`)
  }
}

async function optInByPhone(phone: string) {
  const users = await db.user.findMany({
    where: {
      OR: [
        { phoneNumber: phone },
        { phoneNumber: phone.replace("+1", "") },
        { phoneNumber: phone.replace("+", "") },
      ],
    },
  })

  for (const user of users) {
    await db.user.update({
      where: { id: user.id },
      data: {
        smsConsent: true,
        smsConsentAt: new Date(),
        smsOptedOut: false,
        smsOptedOutAt: null,
      },
    })
  }

  if (users.length === 0) {
    console.info(`START received from ${phone} but no matching user found`)
  } else {
    console.info(`Re-opted-in ${users.length} user(s) for phone ${phone}`)
  }
}

function twimlResponse(message: string): NextResponse {
  const twiml = message
    ? `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${escapeXml(message)}</Message></Response>`
    : `<?xml version="1.0" encoding="UTF-8"?><Response></Response>`

  return new NextResponse(twiml, {
    status: 200,
    headers: { "Content-Type": "text/xml" },
  })
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}
