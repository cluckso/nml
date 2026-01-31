import { NextRequest, NextResponse } from "next/server"
import { getAuthUserFromRequest } from "@/lib/auth"
import { db } from "@/lib/db"
import { Industry } from "@prisma/client"
import { checkTrialEligibility } from "@/lib/trial"
import { createStripeCustomerForTrial, createTrialSetupSession } from "@/lib/stripe"
import { TRIAL_DAYS } from "@/lib/plans"

/**
 * POST /api/trial/start
 * Body: { businessPhone: string }
 * Checks eligibility (one-trial-per-phone), creates Business with trial fields,
 * Stripe Customer, TrialClaim, and returns Stripe Checkout setup session URL.
 * Client redirects to URL to collect card; on success user lands on /onboarding.
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(req)
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    if (user.businessId) {
      return NextResponse.json(
        { error: "You already have a business. Complete onboarding or go to dashboard." },
        { status: 400 }
      )
    }

    const body = await req.json().catch(() => ({}))
    const businessPhone = body?.businessPhone
    if (typeof businessPhone !== "string" || !businessPhone.trim()) {
      return NextResponse.json(
        { error: "Business phone is required" },
        { status: 400 }
      )
    }

    const eligibility = await checkTrialEligibility(businessPhone.trim())
    if (eligibility.eligible === false) {
      const reason = eligibility.reason
      return NextResponse.json(
        {
          error:
            reason === "phone_already_used_trial"
              ? "This number has already been used for a trial. Upgrade or contact support."
              : "Invalid phone number. Use a valid US number.",
          code: reason,
        },
        { status: 403 }
      )
    }

    const normalizedPhone = eligibility.normalizedPhone
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

    const stripeCustomerId = await createStripeCustomerForTrial(user.email)

    const now = new Date()
    const trialEndsAt = new Date(now.getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000)

    // Create Business + TrialClaim in a transaction so the same phone can't win two trials (unique on TrialClaim.primaryForwardingNumber).
    const business = await db.$transaction(async (tx) => {
      const b = await tx.business.create({
        data: {
          name: "My Business",
          industry: Industry.GENERIC,
          primaryForwardingNumber: normalizedPhone,
          stripeCustomerId,
          onboardingComplete: false,
          trialStartedAt: now,
          trialEndsAt,
          trialMinutesUsed: 0,
          users: { connect: { id: user.id } },
        },
      })
      await tx.trialClaim.create({
        data: {
          primaryForwardingNumber: normalizedPhone,
          businessId: b.id,
        },
      })
      return b
    })

    await db.user.update({
      where: { id: user.id },
      data: { businessId: business.id },
    })

    const session = await createTrialSetupSession(business.id, stripeCustomerId, appUrl)

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error("Trial start error:", error)
    // Unique constraint on TrialClaim.primaryForwardingNumber — same number claimed between check and create
    const prismaError = error as { code?: string }
    if (prismaError.code === "P2002") {
      return NextResponse.json(
        { error: "This number has already been used for a trial. Upgrade or contact support.", code: "phone_already_used_trial" },
        { status: 403 }
      )
    }
    const message = error instanceof Error ? error.message : "Failed to start trial"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
