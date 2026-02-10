import { NextRequest, NextResponse } from "next/server"
import { getAuthUserFromRequest } from "@/lib/auth"
import { db } from "@/lib/db"
import { normalizeE164 } from "@/lib/normalize-phone"
import { Industry } from "@prisma/client"
import { ClientStatus } from "@prisma/client"
import { isComplexSetup } from "@/lib/industries"
import { getConfiguredIntakeNumbersE164 } from "@/lib/intake-routing"
import { provisionAgentAndNumberForBusiness } from "@/lib/retell"

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
    const intakeNumbers = getConfiguredIntakeNumbersE164()
    if (intakeNumbers.length && intakeNumbers.includes(primaryForwardingNumberNormalized)) {
      return NextResponse.json(
        { error: "Use your business phone number (the line that forwards to the AI), not the AI intake number. The AI number is shown above for reference — your customers call your business line, which forwards to that number." },
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

    // Update user's businessId, owner phone, and SMS consent
    const smsConsent = businessInfo.smsConsent === true
    await db.user.update({
      where: { id: user.id },
      data: {
        businessId: business.id,
        phoneNumber: businessInfo.ownerPhone || undefined,
        ...(smsConsent
          ? { smsConsent: true, smsConsentAt: new Date(), smsOptedOut: false, smsOptedOutAt: null }
          : { smsConsent: false, smsConsentAt: null }),
      },
    })

    // Provision a dedicated Retell agent + phone number for this business (one agent per business)
    let retellPhoneNumber = business.retellPhoneNumber
    let retellAgentId = business.retellAgentId
    if (!retellAgentId || !retellPhoneNumber) {
      console.info("Provisioning Retell agent and number for business:", business.id, business.name)
      const provisioned = await provisionAgentAndNumberForBusiness({
        name: business.name,
        industry: business.industry,
        serviceAreas: business.serviceAreas,
        planType: business.planType ?? undefined,
        businessHours: business.businessHours as { open?: string; close?: string; days?: string[] } | undefined,
        departments: business.departments ?? [],
        afterHoursEmergencyPhone: business.afterHoursEmergencyPhone ?? undefined,
      })

      if (provisioned) {
        retellAgentId = provisioned.agent_id
        retellPhoneNumber = provisioned.phone_number
        await db.business.update({
          where: { id: business.id },
          data: { retellAgentId, retellPhoneNumber },
        })
        console.info("Assigned Retell agent and number to business:", retellAgentId, retellPhoneNumber, business.id)
      } else {
        console.warn("Failed to provision Retell agent/number for business:", business.id)
        // Continue without - will fall back to shared agent/number or single-tenant mode
      }
    }

    // Refetch business with the updated retellPhoneNumber
    const updatedBusiness = await db.business.findUnique({
      where: { id: business.id },
    })

    return NextResponse.json({ success: true, business: updatedBusiness })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    const isPrismaOrDb =
      message.includes("Unknown arg") ||
      message.includes("does not exist") ||
      message.includes("column") ||
      (error as { code?: string }).code === "P2009" ||
      (error as { code?: string }).code === "P2010"
    console.error("Onboarding error:", error)
    // In dev or for known DB/schema issues, return a hint so deployers can fix migrations
    const hint = isPrismaOrDb
      ? " Database may be missing columns (e.g. run prisma/add_sms_consent.sql). Check server logs for details."
      : ""
    return NextResponse.json(
      {
        error: "Failed to save onboarding data",
        ...(process.env.NODE_ENV !== "production" || isPrismaOrDb
          ? { details: message, hint: hint.trim() }
          : {}),
      },
      { status: 500 }
    )
  }
}
