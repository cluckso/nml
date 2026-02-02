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
    const message = error instanceof Error ? error.message : String(error)
    const stack = error instanceof Error ? error.stack : undefined

    // Log full error for debugging (terminal / server logs)
    console.error("Checkout error:", message)
    if (stack) console.error(stack)
    const raw = error as { raw?: { message?: string }; response?: { statusCode?: number }; code?: string; type?: string }
    if (raw?.raw?.message) console.error("Stripe raw:", raw.raw.message)
    if (raw?.response?.statusCode) console.error("Stripe status:", raw.response.statusCode)

    // Stripe API errors — return 400 with message
    const stripeMessage = raw?.raw?.message || (error as { message?: string })?.message || message
    if (
      raw?.type === "StripeError" ||
      raw?.response?.statusCode !== undefined ||
      (typeof stripeMessage === "string" && (stripeMessage.toLowerCase().includes("stripe") || raw?.code))
    ) {
      const clientMessage =
        raw?.code === "resource_missing"
          ? "Stripe price or product not found. Create prices in Stripe Dashboard and set STRIPE_PRICE_* / STRIPE_USAGE_PRICE_ID in .env. See STRIPE_SETUP.md."
          : stripeMessage
      return NextResponse.json({ error: clientMessage }, { status: 400 })
    }

    // Config / validation errors — return 400
    if (
      message.includes("not set") ||
      message.includes("STRIPE_") ||
      message.includes("Business not found") ||
      message.includes("must start with price_")
    ) {
      return NextResponse.json({ error: message }, { status: 400 })
    }

    // In development, return 500 with actual error in `error` so UI shows it
    const isDev = process.env.NODE_ENV === "development"
    return NextResponse.json(
      {
        error: isDev ? message : "Failed to create checkout session",
        details: isDev ? undefined : message,
      },
      { status: 500 }
    )
  }
}
