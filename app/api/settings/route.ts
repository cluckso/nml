import { NextRequest, NextResponse } from "next/server"
import { getAuthUserFromRequest } from "@/lib/auth"
import { db } from "@/lib/db"
import {
  mergeWithDefaults,
  mergeSectionInto,
  getAllowedSections,
  isSectionAllowed,
  type BusinessSettings,
  type SettingsSection,
} from "@/lib/business-settings"
import { getEffectivePlanType } from "@/lib/plans"
import { syncRetellAgentFromBusiness } from "@/lib/retell"

/** GET /api/settings — return current business settings (merged with defaults) and owner notification phone. */
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
    const notificationPhone = (user as { phoneNumber?: string | null }).phoneNumber ?? null
    const smsConsent = (user as { smsConsent?: boolean }).smsConsent ?? false

    return NextResponse.json({
      settings,
      allowedSections,
      planType,
      notificationPhone,
      smsConsent,
    })
  } catch (error) {
    console.error("Settings GET error:", error)
    return NextResponse.json({ error: "Failed to load settings" }, { status: 500 })
  }
}

/** PATCH /api/settings — update specific sections. Body: { [sectionName]: sectionData } or notificationPhone, smsConsent. */
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

    // Update owner notification phone / SMS consent (not a settings section)
    const notificationPhone = body.notificationPhone
    const smsConsent = body.smsConsent
    if (notificationPhone !== undefined || smsConsent !== undefined) {
      const { normalizeE164 } = await import("@/lib/normalize-phone")
      const updateData: { phoneNumber?: string | null; smsConsent?: boolean; smsConsentAt?: Date | null; smsOptedOut?: boolean; smsOptedOutAt?: Date | null } = {}
      if (notificationPhone !== undefined) {
        updateData.phoneNumber = notificationPhone === "" || notificationPhone == null
          ? null
          : (normalizeE164(String(notificationPhone).trim()) ?? String(notificationPhone).trim())
      }
      if (smsConsent !== undefined) {
        updateData.smsConsent = !!smsConsent
        updateData.smsConsentAt = smsConsent ? new Date() : null
        updateData.smsOptedOut = smsConsent ? false : (updateData.smsOptedOut ?? undefined)
        updateData.smsOptedOutAt = smsConsent ? null : (updateData.smsOptedOutAt ?? undefined)
      }
      if (Object.keys(updateData).length > 0) {
        await db.user.update({
          where: { id: user.id },
          data: updateData as any,
        })
      }
    }

    // Only allow updating sections the plan permits (skip non-section keys)
    const sectionKeys = Object.keys(body).filter(
      (k) => k !== "notificationPhone" && k !== "smsConsent"
    ) as SettingsSection[]
    const disallowed: string[] = []
    for (const key of sectionKeys) {
      if (!isSectionAllowed(key, planType)) {
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
    const updated: BusinessSettings = sectionKeys.length
      ? (sectionKeys.reduce(
          (acc, k) => {
            const cur = acc[k as keyof BusinessSettings]
            const incoming = body[k]
            if (incoming === undefined) return acc
            if (
              typeof cur === "object" &&
              cur !== null &&
              !Array.isArray(cur) &&
              typeof incoming === "object" &&
              incoming !== null &&
              !Array.isArray(incoming)
            ) {
              return { ...acc, [k]: mergeSectionInto(cur as unknown as Record<string, unknown>, incoming as Record<string, unknown>) }
            }
            return { ...acc, [k]: incoming }
          },
          { ...current }
        ) as BusinessSettings)
      : current

    await db.business.update({
      where: { id: user.businessId },
      data: { settings: updated as any },
    })

    const verified = await db.business.findUnique({
      where: { id: user.businessId },
      select: { settings: true },
    })
    const verifiedSettings = mergeWithDefaults(verified?.settings as Partial<BusinessSettings> | null)

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

    const out: { settings: BusinessSettings; verified?: boolean; notificationPhone?: string | null; smsConsent?: boolean } = {
      settings: verifiedSettings,
      verified: true,
    }
    if (notificationPhone !== undefined || smsConsent !== undefined) {
      const updatedUser = await db.user.findUnique({
        where: { id: user.id },
        select: { phoneNumber: true, smsConsent: true },
      })
      if (updatedUser) {
        out.notificationPhone = updatedUser.phoneNumber ?? null
        out.smsConsent = updatedUser.smsConsent
      }
    }
    return NextResponse.json(out)
  } catch (error) {
    console.error("Settings PATCH error:", error)
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 })
  }
}
