import { Business, Call } from "@prisma/client"
import { Resend } from "resend"
import twilio from "twilio"

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null

interface StructuredIntake {
  name?: string
  phone?: string
  address?: string
  city?: string
  issue_description?: string
  emergency?: boolean
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
  // For now, use a fallback or skip SMS if no phone
  const owner = await import("./db").then((m) => m.db.user.findFirst({
    where: { businessId: business.id },
  }))

  // SMS would need phone number in user profile
  // For MVP, we'll skip if not available
  if (!owner) {
    return
  }

  const emergencyPrefix = intake.emergency ? "🚨 EMERGENCY: " : ""
  const message = `${emergencyPrefix}New call from ${intake.name || "Unknown"}. ${intake.issue_description ? `Issue: ${intake.issue_description.substring(0, 100)}` : ""} Call back: ${intake.phone || "N/A"}`

  try {
    // Note: In production, you'd need to store phone numbers in user profile
    // For now, this is a placeholder
    // await twilioClient.messages.create({
    //   body: message,
    //   from: process.env.TWILIO_PHONE_NUMBER,
    //   to: owner.phoneNumber, // Would need to add this field
    // })
    console.log("SMS notification (placeholder):", message)
  } catch (error) {
    console.error("SMS send error:", error)
    throw error
  }
}
