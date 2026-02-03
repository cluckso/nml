import { NextRequest, NextResponse } from "next/server"
import { getAuthUserFromRequest } from "@/lib/auth"
import { db } from "@/lib/db"
import { checkTrialEligibility } from "@/lib/trial"
import { createStripeCustomerForTrial, createTrialSetupSession, stripe } from "@/lib/stripe"
import { Industry } from "@prisma/client"
import { ClientStatus } from "@prisma/client"

/**
 * POST /api/trial/start
 * Body: { businessPhone: string }
 * Creates or updates business with that phone, creates Stripe setup session (card on file, no charge), returns { url }.
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!stripe) {
      return NextResponse.json(
        { error: "Billing is not configured. Set STRIPE_SECRET_KEY in your environment." },
        { status: 503 }
      )
    }

    const body = await req.json().catch(() => ({}))
    const businessPhone = body?.businessPhone
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
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

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

    let stripeCustomerId = business.stripeCustomerId
    if (!stripeCustomerId) {
      const email = user.email || undefined
      if (!email) {
        return NextResponse.json(
          { error: "Account email is required to start a trial." },
          { status: 400 }
        )
      }
      stripeCustomerId = await createStripeCustomerForTrial(email)
      await db.business.update({
        where: { id: business.id },
        data: { stripeCustomerId },
      })
    }

    const session = await createTrialSetupSession(business.id, stripeCustomerId, appUrl)
    return NextResponse.json({ url: session.url ?? null })
  } catch (error) {
    console.error("Trial start error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to start trial" },
      { status: 500 }
    )
  }
}
