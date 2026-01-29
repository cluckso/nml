import { NextRequest, NextResponse } from "next/server"
import { getAuthUserFromRequest } from "@/lib/auth"
import { createCheckoutSession, stripe } from "@/lib/stripe"
import { db } from "@/lib/db"
import { PlanType } from "@prisma/client"
import { Industry } from "@prisma/client"
import { SETUP_FEES } from "@/lib/plans"
import Stripe from "stripe"

/** Plan-first flow: create minimal business so user can checkout before onboarding. */
export async function POST(req: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json(
        { error: "Billing is not configured. Set STRIPE_SECRET_KEY in your environment." },
        { status: 503 }
      )
    }

    const user = await getAuthUserFromRequest(req)
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const { planType } = await req.json()

    const setupFee = SETUP_FEES[planType as PlanType]
    if (setupFee === undefined) {
      return NextResponse.json(
        { error: "Invalid plan" },
        { status: 400 }
      )
    }

    let businessId = user.businessId
    if (!businessId) {
      const business = await db.business.create({
        data: {
          name: "My Business",
          industry: Industry.GENERIC,
          onboardingComplete: false,
          users: { connect: { id: user.id } },
        },
      })
      businessId = business.id
      await db.user.update({
        where: { id: user.id },
        data: { businessId },
      })
    }

    const session = await createCheckoutSession(
      businessId,
      planType as PlanType,
      setupFee
    )

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error("Checkout error:", error)

    // Stripe API errors (invalid price, etc.) — return message so frontend can show it
    if (error instanceof Stripe.errors.StripeError) {
      const message =
        error.code === "resource_missing"
          ? "Stripe price or product not found. Create prices in Stripe Dashboard and set STRIPE_PRICE_* / STRIPE_PRODUCT_* env vars."
          : error.message
      return NextResponse.json({ error: message }, { status: 400 })
    }

    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    )
  }
}
