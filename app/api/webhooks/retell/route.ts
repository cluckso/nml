import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { sendEmailNotification, sendSMSNotification } from "@/lib/notifications"
import { reportUsageToStripe } from "@/lib/stripe"
import { rateLimit } from "@/lib/rate-limit"
import crypto from "crypto"

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const ip = req.headers.get("x-forwarded-for") || req.ip || "unknown"
    const limit = rateLimit(`webhook-retell-${ip}`, 100, 60000) // 100 requests per minute
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded" },
        { status: 429 }
      )
    }

    // Verify webhook signature
    const signature = req.headers.get("x-retell-signature")
    const body = await req.text()
    
    if (!verifyRetellSignature(body, signature || "")) {
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      )
    }

    const event = JSON.parse(body)

    // Handle call completion event
    if (event.event === "call_ended" || event.event === "call_analysis") {
      await handleCallCompletion(event)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Retell webhook error:", error)
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    )
  }
}

function verifyRetellSignature(body: string, signature: string): boolean {
  // Retell webhook signature verification
  const webhookSecret = process.env.RETELL_WEBHOOK_SECRET
  if (!webhookSecret) {
    // In development, allow without signature
    return process.env.NODE_ENV === "development"
  }

  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(body)
    .digest("hex")

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  )
}

async function handleCallCompletion(event: any) {
  const callId = event.call?.call_id
  const agentId = event.call?.agent_id

  if (!callId || !agentId) {
    console.error("Missing call_id or agent_id in webhook")
    return
  }

  // Find business by agent ID
  const business = await db.business.findUnique({
    where: { retellAgentId: agentId },
  })

  if (!business) {
    console.error(`Business not found for agent ${agentId}`)
    return
  }

  // Extract structured intake data
  const analysis = event.call_analysis || {}
  const structuredIntake = {
    name: analysis.caller_name || analysis.extracted_variables?.name,
    phone: analysis.caller_phone || analysis.extracted_variables?.phone,
    address: analysis.service_address || analysis.extracted_variables?.address,
    city: analysis.city || analysis.extracted_variables?.city,
    issue_description: analysis.issue_description || analysis.extracted_variables?.issue_description,
    emergency: detectEmergency(analysis),
  }

  // Calculate duration
  const duration = event.call?.end_timestamp && event.call?.start_timestamp
    ? Math.floor((event.call.end_timestamp - event.call.start_timestamp) / 1000)
    : 0
  const minutes = duration / 60

  // Check if call already exists
  const existingCall = await db.call.findUnique({
    where: { retellCallId: callId },
  })

  if (existingCall) {
    // Update existing call
    await db.call.update({
      where: { id: existingCall.id },
      data: {
        duration,
        minutes,
        transcript: analysis.transcript || event.call?.transcript,
        structuredIntake: structuredIntake as any,
        emergencyFlag: structuredIntake.emergency,
        callerName: structuredIntake.name,
        callerPhone: structuredIntake.phone,
        issueDescription: structuredIntake.issue_description,
      },
    })
    return
  }

  // Create new call record
  const call = await db.call.create({
    data: {
      retellCallId: callId,
      businessId: business.id,
      duration,
      minutes,
      transcript: analysis.transcript || event.call?.transcript,
      structuredIntake: structuredIntake as any,
      emergencyFlag: structuredIntake.emergency,
      callerName: structuredIntake.name,
      callerPhone: structuredIntake.phone,
      issueDescription: structuredIntake.issue_description,
    },
  })

  // Send notifications
  try {
    await Promise.all([
      sendEmailNotification(business, call, structuredIntake),
      sendSMSNotification(business, call, structuredIntake),
    ])
  } catch (error) {
    console.error("Notification error:", error)
    // Don't fail the webhook if notifications fail
  }

  // Report usage to Stripe
  try {
    await reportUsageToStripe(business.id, minutes)
  } catch (error) {
    console.error("Usage reporting error:", error)
    // Don't fail the webhook if usage reporting fails
  }
}

function detectEmergency(analysis: any): boolean {
  const emergencyKeywords = [
    "flooding",
    "no heat",
    "gas smell",
    "burst pipe",
    "emergency",
    "urgent",
    "sparks",
    "smoke",
    "no power",
    "electrical fire",
    "no water",
    "frozen pipes",
  ]

  const text = JSON.stringify(analysis).toLowerCase()
  return emergencyKeywords.some((keyword) => text.includes(keyword))
}
