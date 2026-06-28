import { Business, Call } from "@prisma/client"
import { Resend } from "resend"
import { sanitizeIssueDescription } from "@/lib/parse-lead-from-transcript"
import twilio from "twilio"

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null

export interface StructuredIntake {
  name?: string
  phone?: string
  address?: string
  city?: string
  issue_description?: string
  emergency?: boolean
  appointment_preference?: string
  department?: string
  vehicle_year?: string
  vehicle_make?: string
  vehicle_model?: string
  year?: string
  make?: string
  model?: string
  availability?: string
  preferred_time?: string
}

/** Prefer one bubble up to ~3 SMS segments; split into a second text if still too long. */
const SMS_PREFERRED_MAX_CHARS = 480
/** Twilio concatenated SMS hard limit (~10 segments). */
const SMS_HARD_MAX_CHARS = 1530

function formatLeadAddress(intake: StructuredIntake): string {
  const parts = [intake.address, intake.city]
    .filter((s): s is string => typeof s === "string" && s.trim().length > 0)
    .map((s) => s.trim())
  return parts.length > 0 ? parts.join(", ") : "—"
}

/** Build lead summary SMS body (name, contact, address, issue, vehicle, appt). */
export function buildLeadSummarySmsBody(
  intake: StructuredIntake,
  call: Call | { appointmentRequest?: { preferredDays?: string; preferredTime?: string; notes?: string } }
): string {
  return buildLeadSummarySmsBodies(intake, call).join("\n\n")
}

/** One or two SMS bodies — contact block first, details second when needed. */
export function buildLeadSummarySmsBodies(
  intake: StructuredIntake,
  call: Call | { appointmentRequest?: { preferredDays?: string; preferredTime?: string; notes?: string } }
): string[] {
  const name = (intake.name || "—").trim()
  const phone = (intake.phone || "—").trim()
  const address = formatLeadAddress(intake)
  const issue = sanitizeIssueDescription(intake.issue_description) || "—"
  const vehicle = [intake.vehicle_year, intake.vehicle_make, intake.vehicle_model, intake.year, intake.make, intake.model]
    .filter(Boolean)
    .map((s) => String(s).trim())
    .join(" ") || ""
  const appt = (call as { appointmentRequest?: { preferredDays?: string; preferredTime?: string; notes?: string } }).appointmentRequest
  const apptStr =
    appt?.notes?.trim() ||
    [appt?.preferredDays, appt?.preferredTime].filter(Boolean).join(" ") ||
    intake.appointment_preference?.trim() ||
    intake.availability?.trim() ||
    intake.preferred_time?.trim() ||
    ""

  const contactLines = [`Name: ${name}`, `Phone: ${phone}`, `Address: ${address}`]
  const detailLines = [`Reason for call: ${issue}`]
  if (vehicle) detailLines.push(`Year-Make-Model: ${vehicle}`)
  if (apptStr) detailLines.push(`Appointment pref: ${apptStr}`)

  const emergencyPrefix = intake.emergency ? "🚨 EMERGENCY\n" : ""
  const fullMessage = emergencyPrefix + [...contactLines, ...detailLines].join("\n")

  if (fullMessage.length <= SMS_PREFERRED_MAX_CHARS) {
    return [fullMessage.slice(0, SMS_HARD_MAX_CHARS)]
  }

  const contactMessage = emergencyPrefix + contactLines.join("\n")
  const detailsMessage = detailLines.join("\n")
  const bodies = [contactMessage, detailsMessage].map((b) => b.slice(0, SMS_HARD_MAX_CHARS))
  return bodies.filter((b) => b.trim().length > 0)
}

/** Truncate summary to key points only (no full transcript in email). ~320 chars, break at sentence. */
function truncateSummaryForEmail(summary: string | null | undefined): string {
  if (!summary?.trim()) return ""
  const s = summary.trim()
  if (s.length <= 320) return s
  const slice = s.slice(0, 320)
  const lastPeriod = slice.lastIndexOf(".")
  const lastNewline = slice.lastIndexOf("\n")
  const breakAt = lastPeriod >= 200 ? lastPeriod + 1 : lastNewline >= 200 ? lastNewline + 1 : 320
  return slice.slice(0, breakAt).trim() + (breakAt < s.length ? "…" : "")
}

/** From address: use RESEND_FROM_EMAIL for testing (e.g. onboarding@resend.dev); otherwise notifications@callgrabbr.com (domain must be verified in Resend). */
const EMAIL_FROM = process.env.RESEND_FROM_EMAIL?.trim()
  ? `CallGrabbr <${process.env.RESEND_FROM_EMAIL.trim()}>`
  : "CallGrabbr <notifications@callgrabbr.com>"

export async function sendEmailNotification(
  business: Business,
  call: Call,
  intake: StructuredIntake
) {
  if (!resend) {
    const msg = "RESEND_API_KEY not configured"
    console.warn("[Notifications] Email skipped:", msg)
    throw new Error(msg)
  }

  const owner = await import("./db").then((m) => m.db.user.findFirst({
    where: { businessId: business.id },
  }))

  if (!owner) {
    const msg = "No owner user for business"
    console.error("[Notifications] Email skipped:", msg, business.id)
    throw new Error(msg)
  }
  const toEmail = (owner as { email?: string }).email
  if (!toEmail) {
    const msg = "Owner has no email"
    console.error("[Notifications] Email skipped:", msg, owner.id)
    throw new Error(msg)
  }

  const emergencyBadge = intake.emergency ? "🚨 EMERGENCY" : ""
  const issueDescription = sanitizeIssueDescription(intake.issue_description)
  const subject = intake.emergency
    ? `🚨 EMERGENCY: New Call from ${intake.name || "Unknown"}`
    : `New Call from ${intake.name || "Unknown"}`

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>New Call Notification</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: ${intake.emergency ? "#dc2626" : "#2563eb"};">
            ${emergencyBadge} New Call Received
          </h1>
          
          <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h2 style="margin-top: 0;">Caller Information</h2>
            <p><strong>Name:</strong> ${intake.name || "Not provided"}</p>
            <p><strong>Phone:</strong> ${intake.phone || "Not provided"}</p>
            ${intake.address ? `<p><strong>Address:</strong> ${intake.address}</p>` : ""}
            ${intake.city ? `<p><strong>City:</strong> ${intake.city}</p>` : ""}
          </div>

          ${issueDescription ? `
            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h2 style="margin-top: 0;">Reason for call</h2>
              <p>${issueDescription}</p>
            </div>
          ` : ""}

          <div style="background: #e0e7ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h2 style="margin-top: 0;">Call Details</h2>
            <p><strong>Duration:</strong> ${Math.floor(call.minutes)} minutes ${Math.round((call.minutes % 1) * 60)} seconds</p>
            <p><strong>Time:</strong> ${new Date(call.createdAt).toLocaleString()}</p>
            <p><strong>Call ID:</strong> ${call.retellCallId}</p>
          </div>

          ${(call as { summary?: string }).summary ? `
            <div style="background: #ecfdf5; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h2 style="margin-top: 0;">Summary</h2>
              <p style="white-space: pre-wrap;">${truncateSummaryForEmail((call as { summary?: string }).summary)}</p>
              <p style="font-size: 13px; color: #6b7280;">View full transcript in your <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://www.callgrabbr.com"}/calls">dashboard</a>.</p>
            </div>
          ` : call.transcript ? `
            <p style="font-size: 13px; color: #6b7280;">View full transcript in your <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://www.callgrabbr.com"}/calls">dashboard</a>.</p>
          ` : ""}

          <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
            This is an automated notification from CallGrabbr
          </p>
        </div>
      </body>
    </html>
  `

  const { data, error } = await resend.emails.send({
    from: EMAIL_FROM,
    to: toEmail,
    subject,
    html,
  })
  if (error) {
    const msg = typeof error === "object" && error !== null && "message" in error
      ? String((error as { message?: unknown }).message)
      : String(error)
    console.error("[Notifications] Email send error:", msg, error)
    throw new Error(msg || "Resend send failed")
  }
}

export async function sendSMSNotification(
  business: Business,
  call: Call,
  intake: StructuredIntake
) {
  if (!twilioClient || !process.env.TWILIO_PHONE_NUMBER) {
    console.warn("[Notifications] SMS skipped: Twilio not configured (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER)")
    return
  }

  // Prefer a user who has notification phone + SMS consent (the one who set up alerts)
  const db = await import("./db").then((m) => m.db)
  let owner = await db.user.findFirst({
    where: {
      businessId: business.id,
      phoneNumber: { not: null },
      smsConsent: true,
      smsOptedOut: false,
    },
  })
  if (!owner) {
    owner = await db.user.findFirst({ where: { businessId: business.id } })
  }

  const ownerPhone = (owner as { phoneNumber?: string; smsConsent?: boolean; smsOptedOut?: boolean }).phoneNumber
  const smsConsent = (owner as { smsConsent?: boolean }).smsConsent
  const smsOptedOut = (owner as { smsOptedOut?: boolean }).smsOptedOut

  if (!owner) {
    console.error("[Notifications] SMS skipped: no owner for business", business.id)
    return
  }
  if (!ownerPhone?.trim()) {
    console.info("[Notifications] SMS skipped: owner has no phone number set. Set it in Settings → Notifications.")
    return
  }
  if (!smsConsent || smsOptedOut) {
    console.info("[Notifications] SMS skipped: consent=" + smsConsent + ", optedOut=" + smsOptedOut)
    return
  }

  const messages = buildLeadSummarySmsBodies(intake, call)
  try {
    for (const body of messages) {
      await twilioClient.messages.create({
        body,
        from: process.env.TWILIO_PHONE_NUMBER!,
        to: ownerPhone,
      })
    }
    console.info("[Notifications] SMS sent to owner", { businessId: business.id, to: ownerPhone, parts: messages.length })
  } catch (error) {
    console.error("[Notifications] SMS send error:", error)
    throw error
  }
}

/** Pro+: send SMS confirmation to caller after the call.
 *  Note: This is a one-time transactional message triggered by the caller's own call.
 *  Includes opt-out instructions per Twilio toll-free compliance.
 */
export async function sendSMSToCaller(
  business: Business,
  callerPhone: string,
  intake: StructuredIntake,
  customMessage?: string | null
) {
  if (!twilioClient || !process.env.TWILIO_PHONE_NUMBER) {
    return
  }
  const message =
    customMessage?.trim() ||
    `Thanks for calling ${business.name}. We received your information and will reach out shortly. Reply STOP to opt out of future texts.`
  try {
    await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: callerPhone,
    })
  } catch (error) {
    console.error("SMS to caller error:", error)
  }
}

/** Send missed-call text-back to caller when call ends without full capture */
export async function sendMissedCallTextBack(
  business: Business,
  callerPhone: string,
  messageText: string
) {
  if (!twilioClient || !process.env.TWILIO_PHONE_NUMBER) {
    return
  }
  const body =
    messageText.trim() ||
    `Sorry we missed you at ${business.name}! We'll call back shortly. Need urgent help? Reply URGENT. Reply STOP to opt out.`
  try {
    await twilioClient.messages.create({
      body,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: callerPhone,
    })
    console.info("[Notifications] Missed call text-back sent", { businessId: business.id, to: callerPhone })
  } catch (error) {
    console.error("[Notifications] Missed call text-back error:", error)
    throw error
  }
}

/** Pro+: 24hr follow-up SMS to caller if no appointment booked */
export async function sendFollowUpSMS(
  business: Business,
  callerPhone: string,
  issueDescription: string | null | undefined,
  customMessage?: string | null
) {
  if (!twilioClient || !process.env.TWILIO_PHONE_NUMBER) {
    return
  }
  const issue = issueDescription?.trim() ? ` about ${issueDescription.trim().slice(0, 60)}` : ""
  const message =
    customMessage?.trim() ||
    `Hi from ${business.name}! Still need help${issue}? Reply YES and we'll follow up. Reply STOP to opt out.`
  try {
    await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: callerPhone,
    })
    console.info("[Notifications] Follow-up SMS sent", { businessId: business.id, to: callerPhone })
  } catch (error) {
    console.error("[Notifications] Follow-up SMS error:", error)
    throw error
  }
}

/** Pro+: request Google review after completed appointment */
export async function sendGoogleReviewRequest(
  business: Business,
  callerPhone: string,
  googleReviewUrl: string,
  customMessage?: string | null
) {
  if (!twilioClient || !process.env.TWILIO_PHONE_NUMBER) {
    return
  }
  const message =
    customMessage?.trim()?.replace("{reviewUrl}", googleReviewUrl) ||
    `Thanks for choosing ${business.name}! If we did a great job, would you leave us a quick Google review? ${googleReviewUrl} Reply STOP to opt out.`
  try {
    await twilioClient.messages.create({
      body: message.slice(0, SMS_HARD_MAX_CHARS),
      from: process.env.TWILIO_PHONE_NUMBER,
      to: callerPhone,
    })
    console.info("[Notifications] Google review request sent", { businessId: business.id, to: callerPhone })
  } catch (error) {
    console.error("[Notifications] Google review request error:", error)
    throw error
  }
}

/** Demo calls only: send exactly one SMS to the caller with their lead summary (or short fallback if nothing captured).
 *  Matches consent: "exactly one SMS with my demo call result (sent after I call)".
 */
export async function sendDemoResultSms(
  callerPhone: string,
  intake: StructuredIntake,
  call: Call,
  hasActionableInfo: boolean
) {
  if (!twilioClient || !process.env.TWILIO_PHONE_NUMBER) {
    console.warn("[Notifications] Demo result SMS skipped: Twilio not configured")
    return
  }
  const bodies = hasActionableInfo
    ? buildLeadSummarySmsBodies(intake, call)
    : ["CallGrabbr: We didn't capture enough for a summary. Call again and briefly describe a job (e.g. \"I need a plumber for a leak\") to see your demo result."]
  try {
    for (const body of bodies) {
      await twilioClient.messages.create({
        body,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: callerPhone,
      })
    }
    console.info("[Notifications] Demo result SMS sent to caller", { to: callerPhone, hasInfo: hasActionableInfo, parts: bodies.length })
  } catch (error) {
    console.error("[Notifications] Demo result SMS error:", error)
  }
}

/** Pro+: forward lead to CRM webhook and/or forward email */
export async function forwardToCrm(
  business: Business & { crmWebhookUrl?: string | null; forwardToEmail?: string | null },
  call: Call,
  intake: StructuredIntake
) {
  const payload = {
    source: "callgrabbr",
    businessId: business.id,
    businessName: business.name,
    callId: call.id,
    retellCallId: call.retellCallId,
    createdAt: call.createdAt,
    callerName: intake.name,
    callerPhone: intake.phone,
    address: intake.address,
    city: intake.city,
    issueDescription: intake.issue_description,
    emergency: intake.emergency,
    transcript: call.transcript,
    summary: (call as { summary?: string }).summary,
  }

  if (business.crmWebhookUrl) {
    try {
      await fetch(business.crmWebhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
    } catch (error) {
      console.error("CRM webhook error:", error)
      throw error
    }
  }

  if (business.forwardToEmail && resend) {
    try {
      await resend.emails.send({
        from: EMAIL_FROM,
        to: business.forwardToEmail,
        subject: `Lead: ${intake.name || "Unknown"} - ${business.name}`,
        html: `
          <p>New lead from CallGrabbr:</p>
          <pre>${JSON.stringify(payload, null, 2)}</pre>
        `,
      })
    } catch (error) {
      console.error("CRM forward email error:", error)
    }
  }
}
