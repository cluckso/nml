import { NextRequest, NextResponse } from "next/server"
import { getAuthUserFromRequest } from "@/lib/auth"
import { db } from "@/lib/db"

function asHours(
  value: unknown
): { open: string; close: string; days: string[] } | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null
  const obj = value as Record<string, unknown>
  const open = typeof obj.open === "string" ? obj.open : null
  const close = typeof obj.close === "string" ? obj.close : null
  const days = Array.isArray(obj.days) ? obj.days.map(String) : null
  if (!open || !close || !days) return null
  return { open, close, days }
}

/**
 * GET /api/activation — mobile/web gate: business + onboarding status and prefill.
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(req)
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    if (!user.businessId) {
      return NextResponse.json({
        businessId: null,
        onboardingComplete: false,
        needsTrialStart: true,
        needsOnboarding: false,
        prefill: null,
      })
    }

    const business = await db.business.findUnique({
      where: { id: user.businessId },
      select: {
        id: true,
        name: true,
        industry: true,
        city: true,
        serviceAreas: true,
        businessHours: true,
        primaryForwardingNumber: true,
        onboardingComplete: true,
        planType: true,
      },
    })

    if (!business) {
      return NextResponse.json({
        businessId: null,
        onboardingComplete: false,
        needsTrialStart: true,
        needsOnboarding: false,
        prefill: null,
      })
    }

    const ownerPhone =
      typeof (user as { phoneNumber?: unknown }).phoneNumber === "string"
        ? (user as { phoneNumber: string }).phoneNumber
        : null
    const userName =
      typeof (user as { name?: unknown }).name === "string"
        ? (user as { name: string }).name.trim()
        : ""
    const nameTrimmed = business.name?.trim() || ""
    const prefillName =
      !nameTrimmed || nameTrimmed === "My Business"
        ? null
        : userName && nameTrimmed.toLowerCase() === userName.toLowerCase()
          ? null
          : nameTrimmed

    const phone =
      business.primaryForwardingNumber?.trim() &&
      !business.primaryForwardingNumber.startsWith("pending-")
        ? business.primaryForwardingNumber
        : null

    const serviceAreas = Array.isArray(business.serviceAreas)
      ? business.serviceAreas.filter((a): a is string => typeof a === "string")
      : []

    return NextResponse.json({
      businessId: business.id,
      onboardingComplete: !!business.onboardingComplete,
      needsTrialStart: false,
      needsOnboarding: !business.onboardingComplete,
      planType: business.planType ?? null,
      prefill: {
        industry: business.industry ?? null,
        name: prefillName,
        city: business.city ?? null,
        serviceAreas: serviceAreas.length
          ? serviceAreas
          : business.city
            ? [business.city]
            : [],
        businessHours: asHours(business.businessHours),
        phoneNumber: phone,
        ownerPhone,
      },
    })
  } catch (error) {
    console.error("Activation GET error:", error)
    return NextResponse.json({ error: "Failed to load activation status" }, { status: 500 })
  }
}
