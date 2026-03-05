import { NextRequest, NextResponse } from "next/server"

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

    // No SMS on unlock — consent is for exactly one SMS: the demo result (sent after they call).
    // Instructions and demo number are shown on the page only.

    return NextResponse.json({ 
      success: true,
      demoNumber: process.env.NEXT_PUBLIC_DEMO_NUMBER || "+1 (202) 873-8983"
    })
  } catch (error) {
    console.error("[Demo Unlock] Error:", error)
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    )
  }
}
