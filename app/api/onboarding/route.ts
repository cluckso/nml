import { NextRequest, NextResponse } from "next/server"
import { getAuthUserFromRequest } from "@/lib/auth"
import { db } from "@/lib/db"
import { Industry } from "@prisma/client"
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

    const serviceAreas = Array.isArray(businessInfo.serviceAreas)
      ? businessInfo.serviceAreas.map((s: string) => String(s).trim()).filter(Boolean)
      : businessInfo.city
        ? [businessInfo.city]
        : []

    const requiresManualSetup = isComplexSetup({
      industry: industry as Industry,
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

    // Create or update business (businessLinePhone = user's existing line; phoneNumber = AI number, set when agent is created)
    const business = await db.business.upsert({
      where: { id: user.businessId || "new" },
      create: {
        name: businessInfo.name,
        industry: industry as Industry,
        address: businessInfo.address,
        city: businessInfo.city,
        state: businessInfo.state,
        zipCode: businessInfo.zipCode,
        businessLinePhone: businessInfo.phoneNumber || undefined,
        businessHours: businessHours ?? undefined,
        departments,
        serviceAreas,
        crmWebhookUrl: businessInfo.crmWebhookUrl || undefined,
        forwardToEmail: businessInfo.forwardToEmail || undefined,
        afterHoursEmergencyPhone: businessInfo.afterHoursEmergencyPhone || undefined,
        onboardingComplete: !requiresManualSetup,
        requiresManualSetup,
        users: {
          connect: { id: user.id },
        },
      },
      update: {
        name: businessInfo.name,
        industry: industry as Industry,
        address: businessInfo.address,
        city: businessInfo.city,
        state: businessInfo.state,
        zipCode: businessInfo.zipCode,
        businessLinePhone: businessInfo.phoneNumber || undefined,
        businessHours: businessHours ?? undefined,
        departments,
        serviceAreas,
        crmWebhookUrl: businessInfo.crmWebhookUrl || undefined,
        forwardToEmail: businessInfo.forwardToEmail || undefined,
        afterHoursEmergencyPhone: businessInfo.afterHoursEmergencyPhone || undefined,
        onboardingComplete: !requiresManualSetup,
        requiresManualSetup,
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
