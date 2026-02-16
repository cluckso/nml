import { NextRequest, NextResponse } from "next/server"
import { getAuthUserFromRequest } from "@/lib/auth"
import { db } from "@/lib/db"
import { checkTrialEligibility } from "@/lib/trial"
import { TRIAL_DAYS } from "@/lib/plans"
import { Industry } from "@prisma/client"
import { ClientStatus } from "@prisma/client"

/**
 * POST /api/trial/start
 * Body: { businessPhone: string, smsConsent?: boolean }
 * No card required. Creates or updates business, starts trial (50 min or 4 days), redirects to onboarding.
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json().catch(() => ({}))
    const businessPhone = body?.businessPhone
    const smsConsent = body?.smsConsent === true
    if (typeof businessPhone !== "string" || !businessPhone.trim()) {
      return NextResponse.json(
        { error: "Missing businessPhone" },
        { status: 400 }
      )
    }

    const eligibility = await checkTrialEligibility(businessPhone.trim())
    if (!eligibility.eligible) {
      const reason = "reason" in eligibility ? eligibility.reason : "invalid_phone"
      return NextResponse.json(
        {
          error:
            reason === "phone_already_used_trial"
              ? "This number has already been used for a trial."
              : "Invalid phone number.",
        },
        { status: 403 }
      )
    }

    const normalizedPhone = eligibility.normalizedPhone
    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "")

    let business = user.businessId
      ? await db.business.findUnique({
          where: { id: user.businessId },
        })
      : null

    if (business?.primaryForwardingNumber?.startsWith("pending-")) {
      await db.business.update({
        where: { id: business.id },
        data: { primaryForwardingNumber: normalizedPhone },
      })
      business = await db.business.findUnique({ where: { id: business.id } })
    } else if (!business) {
      business = await db.business.create({
        data: {
          name: "My Business",
          industry: Industry.GENERIC,
          primaryForwardingNumber: normalizedPhone,
          onboardingComplete: false,
          status: ClientStatus.ACTIVE,
          users: { connect: { id: user.id } },
        },
      })
      await db.user.update({
        where: { id: user.id },
        data: { businessId: business.id },
      })
    }

    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 500 })
    }

    const now = new Date()
    const trialEndsAt = new Date(now.getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000)
    await db.business.update({
      where: { id: business.id },
      data: {
        trialStartedAt: now,
        trialEndsAt,
        status: ClientStatus.ACTIVE,
      },
    })

    if (smsConsent) {
      await db.user.update({
        where: { id: user.id },
        data: {
          smsConsent: true,
          smsConsentAt: new Date(),
          smsOptedOut: false,
          smsOptedOutAt: null,
        },
      })
    }

    return NextResponse.json({ url: `${appUrl}/onboarding` })
  } catch (error) {
    console.error("Trial start error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to start trial" },
      { status: 500 }
    )
  }
}
