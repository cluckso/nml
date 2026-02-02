import { NextRequest, NextResponse } from "next/server"
import { getAuthUserFromRequest } from "@/lib/auth"
import { db } from "@/lib/db"
import { normalizeE164 } from "@/lib/normalize-phone"
import { Industry } from "@prisma/client"
import { ClientStatus } from "@prisma/client"
import { isComplexSetup } from "@/lib/industries"

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(req)
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const body = await req.json()

    const { industry, businessInfo } = body

    if (!industry || !businessInfo) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const validIndustries = Object.values(Industry) as string[]
    if (typeof industry !== "string" || !validIndustries.includes(industry)) {
      return NextResponse.json(
        { error: "Invalid industry" },
        { status: 400 }
      )
    }

    const businessName = typeof businessInfo.name === "string" ? businessInfo.name.trim() : ""
    if (!businessName) {
      return NextResponse.json(
        { error: "Business name is required" },
        { status: 400 }
      )
    }

    const serviceAreas = Array.isArray(businessInfo.serviceAreas)
      ? businessInfo.serviceAreas.map((s: string) => String(s).trim()).filter(Boolean)
      : businessInfo.city
        ? [businessInfo.city]
        : []

    const industryTyped = industry as Industry
    const requiresManualSetup = isComplexSetup({
      industry: industryTyped,
      serviceAreas,
    })

    const businessHours = businessInfo.businessHours
      ? {
          open: businessInfo.businessHours.open,
          close: businessInfo.businessHours.close,
          days: Array.isArray(businessInfo.businessHours.days) ? businessInfo.businessHours.days : [],
        }
      : undefined
    const departments = Array.isArray(businessInfo.departments) ? businessInfo.departments : []
    const primaryForwardingNumberNormalized = normalizeE164(businessInfo.phoneNumber ?? businessInfo.primaryForwardingNumber)
    if (!primaryForwardingNumberNormalized) {
      return NextResponse.json(
        { error: "Primary forwarding number is required (valid US E.164). This is the number that will forward missed calls to us." },
        { status: 400 }
      )
    }

    // Create or update business (primaryForwardingNumber = user's existing line that forwards to AI)
    const business = await db.business.upsert({
      where: { id: user.businessId || "new" },
      create: {
        name: businessName,
        industry: industryTyped,
        primaryForwardingNumber: primaryForwardingNumberNormalized,
        address: businessInfo.address,
        city: businessInfo.city,
        state: businessInfo.state,
        zipCode: businessInfo.zipCode,
        businessHours: businessHours ?? undefined,
        departments,
        serviceAreas,
        crmWebhookUrl: businessInfo.crmWebhookUrl || undefined,
        forwardToEmail: businessInfo.forwardToEmail || undefined,
        afterHoursEmergencyPhone: businessInfo.afterHoursEmergencyPhone || undefined,
        onboardingComplete: !requiresManualSetup,
        requiresManualSetup,
        status: ClientStatus.ACTIVE, // so inbound calls are answered (trial or paid)
        users: {
          connect: { id: user.id },
        },
      },
      update: {
        name: businessName,
        industry: industryTyped,
        address: businessInfo.address,
        city: businessInfo.city,
        state: businessInfo.state,
        zipCode: businessInfo.zipCode,
        primaryForwardingNumber: primaryForwardingNumberNormalized,
        businessHours: businessHours ?? undefined,
        departments,
        serviceAreas,
        crmWebhookUrl: businessInfo.crmWebhookUrl || undefined,
        forwardToEmail: businessInfo.forwardToEmail || undefined,
        afterHoursEmergencyPhone: businessInfo.afterHoursEmergencyPhone || undefined,
        onboardingComplete: !requiresManualSetup,
        requiresManualSetup,
        status: ClientStatus.ACTIVE, // ensure trial users get calls after onboarding
      },
    })

    // Update user's businessId and owner phone (optional, for future use)
    await db.user.update({
      where: { id: user.id },
      data: {
        businessId: business.id,
        phoneNumber: businessInfo.ownerPhone || undefined,
      },
    })

    return NextResponse.json({ success: true, business })
  } catch (error) {
    console.error("Onboarding error:", error)
    return NextResponse.json(
      { error: "Failed to save onboarding data" },
      { status: 500 }
    )
  }
}
