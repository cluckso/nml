import { NextRequest, NextResponse } from "next/server"
import { getAuthUserFromRequest } from "@/lib/auth"
import { db } from "@/lib/db"
import { normalizeE164 } from "@/lib/normalize-phone"
import { Industry, Prisma } from "@prisma/client"
import { ClientStatus } from "@prisma/client"
import { getEffectivePlanType } from "@/lib/plans"

/**
 * PATCH /api/business
 * Update business info (name, phone, address, hours, industry, flow options, voice settings).
 * All plans can update basic business info. Industry/flow selection applies per plan.
 */
export async function PATCH(req: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(req)
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    if (!user.businessId) return NextResponse.json({ error: "Business not found" }, { status: 400 })

    const business = await db.business.findUnique({
      where: { id: user.businessId },
      include: { subscription: true },
    })
    if (!business) return NextResponse.json({ error: "Business not found" }, { status: 404 })

    const body = await req.json().catch(() => ({}))
    const effectivePlan = getEffectivePlanType(business.subscription?.planType)
    const isLocalPlus = effectivePlan === "LOCAL_PLUS"

    const updates: Record<string, unknown> = {}

    if (typeof body.name === "string" && body.name.trim()) {
      updates.name = body.name.trim()
    }
    if (body.primaryForwardingNumber !== undefined) {
      const normalized = normalizeE164(body.primaryForwardingNumber)
      if (normalized) updates.primaryForwardingNumber = normalized
    }
    if (body.status !== undefined && (body.status === "ACTIVE" || body.status === "PAUSED")) {
      if (body.status === "ACTIVE" && !business.testCallVerifiedAt) {
        return NextResponse.json(
          { error: "Complete a test call first: forward a call to the shared intake number so we can verify your forwarding number." },
          { status: 400 }
        )
      }
      updates.status = body.status as ClientStatus
    }
    if (body.address !== undefined) updates.address = typeof body.address === "string" ? body.address.trim() || null : null
    if (body.city !== undefined) updates.city = typeof body.city === "string" ? body.city.trim() || null : null
    if (body.state !== undefined) updates.state = typeof body.state === "string" ? body.state.trim() || null : null
    if (body.zipCode !== undefined) updates.zipCode = typeof body.zipCode === "string" ? body.zipCode.trim() || null : null
    if (body.serviceAreas !== undefined) {
      updates.serviceAreas = Array.isArray(body.serviceAreas)
        ? body.serviceAreas.map((s: unknown) => String(s).trim()).filter(Boolean)
        : []
    }
    if (body.businessHours !== undefined) {
      const bh = body.businessHours
      updates.businessHours =
        bh && (bh.open != null || bh.close != null || Array.isArray(bh.days))
          ? {
              open: typeof bh.open === "string" ? bh.open : "09:00",
              close: typeof bh.close === "string" ? bh.close : "17:00",
              days: Array.isArray(bh.days) ? bh.days : [],
            }
          : null
    }

    // Industry / flow: Pro and Local Plus can change; Basic stays GENERIC
    if (effectivePlan !== "STARTER") {
      const validIndustries = Object.values(Industry) as string[]
      if (typeof body.industry === "string" && validIndustries.includes(body.industry)) {
        updates.industry = body.industry as Industry
      }
      if ((body.industry === "AUTO_REPAIR" || business.industry === "AUTO_REPAIR") && typeof body.offersRoadsideService === "boolean") {
        updates.offersRoadsideService = body.offersRoadsideService
      }
    }

    // After-hours emergency: Pro only (Local Plus has Priority Support instead)
    if (!isLocalPlus) {
      if (body.afterHoursEmergencyPhone !== undefined) {
        updates.afterHoursEmergencyPhone =
          typeof body.afterHoursEmergencyPhone === "string" ? body.afterHoursEmergencyPhone.trim() || null : null
      }
    } else {
      updates.afterHoursEmergencyPhone = null
      updates.departments = []
    }

    // Pro+ CRM/email
    if (effectivePlan !== "STARTER") {
      if (body.crmWebhookUrl !== undefined) updates.crmWebhookUrl = typeof body.crmWebhookUrl === "string" ? body.crmWebhookUrl.trim() || null : null
      if (body.forwardToEmail !== undefined) updates.forwardToEmail = typeof body.forwardToEmail === "string" ? body.forwardToEmail.trim() || null : null
    }

    // Voice settings: Local Plus only
    if (isLocalPlus && body.voiceSettings !== undefined && typeof body.voiceSettings === "object") {
      const vs = body.voiceSettings as Record<string, unknown>
      updates.voiceSettings = {
        speed: typeof vs.speed === "number" ? Math.max(0, Math.min(1, vs.speed)) : undefined,
        temperature: typeof vs.temperature === "number" ? Math.max(0, Math.min(1, vs.temperature)) : undefined,
        volume: typeof vs.volume === "number" ? Math.max(0, Math.min(1, vs.volume)) : undefined,
      }
    }

    const updated = await db.business.update({
      where: { id: user.businessId },
      data: updates as Prisma.BusinessUpdateInput,
      include: { subscription: true },
    })

    return NextResponse.json({ success: true, business: updated })
  } catch (error) {
    console.error("Business update error:", error)
    return NextResponse.json({ error: "Failed to update business" }, { status: 500 })
  }
}
