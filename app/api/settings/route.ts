import { NextRequest, NextResponse } from "next/server"
import { getAuthUserFromRequest } from "@/lib/auth"
import { db } from "@/lib/db"
import {
  mergeWithDefaults,
  getAllowedSections,
  isSectionAllowed,
  type BusinessSettings,
  type SettingsSection,
} from "@/lib/business-settings"
import { getEffectivePlanType } from "@/lib/plans"
import { syncRetellAgentFromBusiness } from "@/lib/retell"

/** GET /api/settings — return current business settings (merged with defaults). */
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(req)
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    if (!user.businessId) return NextResponse.json({ error: "No business" }, { status: 400 })

    const business = await db.business.findUnique({
      where: { id: user.businessId },
      select: { settings: true, planType: true },
    })
    if (!business) return NextResponse.json({ error: "Business not found" }, { status: 404 })

    const planType = getEffectivePlanType(business.planType)
    const settings = mergeWithDefaults(business.settings as Partial<BusinessSettings> | null)
    const allowedSections = getAllowedSections(planType)

    return NextResponse.json({ settings, allowedSections, planType })
  } catch (error) {
    console.error("Settings GET error:", error)
    return NextResponse.json({ error: "Failed to load settings" }, { status: 500 })
  }
}

/** PATCH /api/settings — update specific sections. Body: { [sectionName]: sectionData } */
export async function PATCH(req: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(req)
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    if (!user.businessId) return NextResponse.json({ error: "No business" }, { status: 400 })

    const business = await db.business.findUnique({
      where: { id: user.businessId },
      select: { settings: true, planType: true },
    })
    if (!business) return NextResponse.json({ error: "Business not found" }, { status: 404 })

    const planType = getEffectivePlanType(business.planType)
    const body = await req.json()

    // Only allow updating sections the plan permits
    const disallowed: string[] = []
    for (const key of Object.keys(body)) {
      if (!isSectionAllowed(key as SettingsSection, planType)) {
        disallowed.push(key)
      }
    }
    if (disallowed.length > 0) {
      return NextResponse.json(
        { error: `Your plan does not include: ${disallowed.join(", ")}. Upgrade to unlock.` },
        { status: 403 }
      )
    }

    const current = mergeWithDefaults(business.settings as Partial<BusinessSettings> | null)
    const updated = { ...current, ...body }

    await db.business.update({
      where: { id: user.businessId },
      data: { settings: updated as any },
    })

    // Sync per-business Retell agent so saved settings (greeting, tone, etc.) apply to the agent
    const businessForSync = await db.business.findUnique({
      where: { id: user.businessId },
      select: {
        name: true,
        industry: true,
        serviceAreas: true,
        businessHours: true,
        departments: true,
        afterHoursEmergencyPhone: true,
        voiceSettings: true,
        retellAgentId: true,
        planType: true,
        settings: true,
      },
    })
    if (businessForSync?.retellAgentId) {
      try {
        const mergedSettings = mergeWithDefaults(businessForSync.settings as Partial<BusinessSettings> | null)
        await syncRetellAgentFromBusiness(businessForSync, mergedSettings)
      } catch (err) {
        console.error("Settings PATCH: syncRetellAgentFromBusiness failed:", err)
        // Still return 200; settings were saved
      }
    }

    return NextResponse.json({ settings: updated })
  } catch (error) {
    console.error("Settings PATCH error:", error)
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 })
  }
}
