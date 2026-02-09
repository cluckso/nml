import { Business, Call } from "@prisma/client"
import { Resend } from "resend"
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
}

export async function sendEmailNotification(
  business: Business,
  call: Call,
  intake: StructuredIntake
) {
  if (!resend) {
    console.warn("Resend API key not configured")
    return
  }

  // Find business owner email
  const owner = await import("./db").then((m) => m.db.user.findFirst({
    where: { businessId: business.id },
  }))

  if (!owner) {
    console.error("No owner found for business")
    return
  }

  const emergencyBadge = intake.emergency ? "🚨 EMERGENCY" : ""
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

          ${intake.issue_description ? `
            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h2 style="margin-top: 0;">Issue Description</h2>
              <p>${intake.issue_description}</p>
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
              <p style="white-space: pre-wrap;">${(call as { summary?: string }).summary}</p>
            </div>
          ` : ""}

          ${call.transcript ? `
            <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h2 style="margin-top: 0;">Transcript</h2>
              <p style="white-space: pre-wrap;">${call.transcript}</p>
            </div>
          ` : ""}

          <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
            This is an automated notification from NeverMissLead-AI
          </p>
        </div>
      </body>
    </html>
  `

  try {
    await resend.emails.send({
      from: "NeverMissLead-AI <notifications@nevermisslead.ai>",
      to: owner.email,
      subject,
      html,
    })
  } catch (error) {
    console.error("Email send error:", error)
    throw error
  }
}

export async function sendSMSNotification(
  business: Business,
  call: Call,
  intake: StructuredIntake
) {
  if (!twilioClient || !process.env.TWILIO_PHONE_NUMBER) {
    console.warn("Twilio not configured")
    return
  }

  // Find business owner phone (would need to be stored in user profile)
  const owner = await import("./db").then((m) => m.db.user.findFirst({
    where: { businessId: business.id },
  }))

  const ownerPhone = (owner as { phoneNumber?: string; smsConsent?: boolean; smsOptedOut?: boolean }).phoneNumber
  const smsConsent = (owner as { smsConsent?: boolean }).smsConsent
  const smsOptedOut = (owner as { smsOptedOut?: boolean }).smsOptedOut

  if (!owner || !ownerPhone) {
    return
  }

  // Respect SMS consent and opt-out status (Twilio toll-free compliance)
  if (!smsConsent || smsOptedOut) {
    console.info(`SMS skipped for user ${owner.id}: consent=${smsConsent}, optedOut=${smsOptedOut}`)
    return
  }

  const emergencyPrefix = intake.emergency ? "🚨 EMERGENCY: " : ""
  const message = `${emergencyPrefix}New call from ${intake.name || "Unknown"}. ${intake.issue_description ? `Issue: ${intake.issue_description.substring(0, 100)}` : ""} Call back: ${intake.phone || "N/A"}`

  try {
    await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER!,
      to: ownerPhone,
    })
  } catch (error) {
    console.error("SMS send error:", error)
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
  intake: StructuredIntake
) {
  if (!twilioClient || !process.env.TWILIO_PHONE_NUMBER) {
    return
  }
  const message = `Thanks for calling ${business.name}. We received your information and will reach out shortly. Reply STOP to opt out of future texts.`
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

/** Pro+: forward lead to CRM webhook and/or forward email */
export async function forwardToCrm(
  business: Business & { crmWebhookUrl?: string | null; forwardToEmail?: string | null },
  call: Call,
  intake: StructuredIntake
) {
  const payload = {
    source: "nevermisslead-ai",
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
        from: "NeverMissLead-AI <notifications@nevermisslead.ai>",
        to: business.forwardToEmail,
        subject: `Lead: ${intake.name || "Unknown"} - ${business.name}`,
        html: `
          <p>New lead from NeverMissLead-AI:</p>
          <pre>${JSON.stringify(payload, null, 2)}</pre>
        `,
      })
    } catch (error) {
      console.error("CRM forward email error:", error)
    }
  }
}
