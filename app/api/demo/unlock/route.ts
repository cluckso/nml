import { NextRequest, NextResponse } from "next/server"
import twilio from "twilio"

const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null

interface DemoUnlockRequest {
  name: string
  phone: string
  businessType: string
}

export async function POST(request: NextRequest) {
  try {
    const body: DemoUnlockRequest = await request.json()
    const { name, phone, businessType } = body

    if (!name?.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }
    if (!phone?.trim() || phone.replace(/\D/g, "").length < 10) {
      return NextResponse.json({ error: "Valid phone number is required" }, { status: 400 })
    }
    if (!businessType?.trim()) {
      return NextResponse.json({ error: "Business type is required" }, { status: 400 })
    }

    const cleanPhone = phone.replace(/\D/g, "")
    const formattedPhone = cleanPhone.startsWith("1") ? `+${cleanPhone}` : `+1${cleanPhone}`

    console.info("[Demo Unlock] Lead captured:", { name, phone: formattedPhone, businessType })

    if (twilioClient && process.env.TWILIO_PHONE_NUMBER) {
      try {
        await twilioClient.messages.create({
          body: `Hi ${name}! Thanks for trying CallGrabbr.\n\nCall our demo: ${process.env.NEXT_PUBLIC_DEMO_NUMBER || "(Demo number not configured)"}\n\nPretend you're a customer with a job request. After the call, you'll receive your "lead" summary here.\n\nQuestions? Reply to this message.`,
          to: formattedPhone,
          from: process.env.TWILIO_PHONE_NUMBER,
        })
        console.info("[Demo Unlock] Welcome SMS sent to", formattedPhone)
      } catch (smsError) {
        console.error("[Demo Unlock] SMS send failed:", smsError)
      }
    }

    return NextResponse.json({ 
      success: true,
      demoNumber: process.env.NEXT_PUBLIC_DEMO_NUMBER || "(Demo number not configured)"
    })
  } catch (error) {
    console.error("[Demo Unlock] Error:", error)
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    )
  }
}
