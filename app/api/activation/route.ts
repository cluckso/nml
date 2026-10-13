import { NextRequest, NextResponse } from "next/server"
import { getAuthUserFromRequest } from "@/lib/auth"
import { db } from "@/lib/db"

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

    const ownerPhone = (user as { phoneNumber?: string | null }).phoneNumber ?? null
    const nameTrimmed = business.name?.trim() || ""
    const prefillName =
      !nameTrimmed || nameTrimmed === "My Business"
        ? null
        : user.name?.trim() && nameTrimmed.toLowerCase() === user.name.trim().toLowerCase()
          ? null
          : nameTrimmed

    const phone =
      business.primaryForwardingNumber?.trim() &&
      !business.primaryForwardingNumber.startsWith("pending-")
        ? business.primaryForwardingNumber
        : null

    return NextResponse.json({
      businessId: business.id,
      onboardingComplete: !!business.onboardingComplete,
      needsTrialStart: false,
      needsOnboarding: !business.onboardingComplete,
      planType: business.planType,
      prefill: {
        industry: business.industry,
        name: prefillName,
        city: business.city,
        serviceAreas: business.serviceAreas?.length
          ? business.serviceAreas
          : business.city
            ? [business.city]
            : [],
        businessHours: business.businessHours,
        phoneNumber: phone,
        ownerPhone,
      },
    })
  } catch (error) {
    console.error("Activation GET error:", error)
    return NextResponse.json({ error: "Failed to load activation status" }, { status: 500 })
  }
}
