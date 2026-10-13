import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getDemoNumberDisplay } from "@/lib/demo-line"

const BUSINESS_TYPE_TO_INDUSTRY: Record<string, string> = {
  hvac: "hvac",
  plumbing: "plumbing",
  electrical: "electrician",
  "auto repair": "auto-repair",
  handyman: "handyman",
  cleaning: "cleaning",
  landscaping: "landscaping",
  other: "other",
}

interface DemoUnlockRequest {
  name: string
  phone: string
  businessType: string
  consent?: boolean
}

function mapIndustry(businessType: string): string {
  const key = businessType.trim().toLowerCase()
  const mapped = BUSINESS_TYPE_TO_INDUSTRY[key] ?? key.replace(/\s+/g, "-")
  return mapped || "demo"
}

export async function POST(request: NextRequest) {
  try {
    const body: DemoUnlockRequest = await request.json()
    const { name, phone, businessType, consent } = body

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
    const industry = mapIndustry(businessType)
    const smsConsent = consent === true

    console.info("[Demo Unlock] Lead captured:", {
      name: name.trim(),
      phone: formattedPhone,
      businessType,
      industry,
    })

    let persisted = false
    let leadId: string | null = null
    try {
      const lead = await db.funnelLead.create({
        data: {
          industry,
          score: 0,
          responses: {
            source: "demo_unlock",
            businessType: businessType.trim(),
            smsConsent,
          },
          name: name.trim(),
          phone: formattedPhone,
          email: null,
        },
      })
      persisted = true
      leadId = lead.id
    } catch (dbError) {
      console.warn("[Demo Unlock] DB insert failed, returning demo number anyway:", dbError)
    }

    // No SMS on unlock — consent is for exactly one SMS: the demo result (sent after they call).
    // Instructions and demo number are shown on the page only.

    return NextResponse.json({
      success: true,
      demoNumber: getDemoNumberDisplay(),
      persisted,
      leadId,
    })
  } catch (error) {
    console.error("[Demo Unlock] Error:", error)
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    )
  }
}
