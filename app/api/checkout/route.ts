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

    let body: { planType?: string }
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
    }
    const planType = body?.planType
    if (!planType || typeof planType !== "string") {
      return NextResponse.json({ error: "Missing planType" }, { status: 400 })
    }

    const setupFee = SETUP_FEES[planType as PlanType]
    if (setupFee === undefined) {
      return NextResponse.json(
        { error: "Invalid plan" },
        { status: 400 }
      )
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

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
      setupFee,
      appUrl
    )

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error("Checkout error:", error)

    // Stripe API errors (invalid price, etc.) — return message so frontend can show it
    const stripeError = error as { type?: string; code?: string; message?: string }
    if (stripeError?.type === "StripeError" || (stripeError?.code && typeof stripeError?.message === "string")) {
      const message =
        stripeError.code === "resource_missing"
          ? "Stripe price or product not found. Create prices in Stripe Dashboard and set STRIPE_PRICE_* / STRIPE_PRODUCT_* env vars."
          : stripeError.message || "Stripe error"
      return NextResponse.json({ error: message }, { status: 400 })
    }

    const message = error instanceof Error ? error.message : "Failed to create checkout session"
    return NextResponse.json(
      { error: "Failed to create checkout session", details: message },
      { status: 500 }
    )
  }
}
