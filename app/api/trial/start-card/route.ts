import { NextRequest, NextResponse } from "next/server"
import { getAuthUserFromRequest } from "@/lib/auth"
import { createSubscriptionTrialCheckoutSession, stripe } from "@/lib/stripe"
import { PlanType } from "@prisma/client"
import { hasAcceptedTerms } from "@/lib/user-legal"
import { prepareBusinessForTrial } from "@/lib/trial-start-business"
import { db } from "@/lib/db"

const VALID_PLANS = new Set<string>(Object.values(PlanType))

/**
 * POST /api/trial/start-card
 * Card-on-file trial: Stripe subscription with trial_period_days (auto-converts to paid).
 */
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

    const body = await req.json().catch(() => ({}))
    const businessPhone = body?.businessPhone
    const planTypeRaw = typeof body?.planType === "string" ? body.planType : PlanType.STARTER
    const planType = VALID_PLANS.has(planTypeRaw) ? (planTypeRaw as PlanType) : PlanType.STARTER

    if (typeof businessPhone !== "string" || !businessPhone.trim()) {
      return NextResponse.json({ error: "Missing businessPhone" }, { status: 400 })
    }

    const dbUser = await db.user.findUnique({
      where: { id: user.id },
      select: { termsAcceptedAt: true },
    })
    if (!hasAcceptedTerms(dbUser)) {
      return NextResponse.json(
        {
          error:
            "Please agree to the Terms of Service and Privacy Policy when creating your account before starting a trial.",
        },
        { status: 403 }
      )
    }

    const existing = user.businessId
      ? await db.business.findUnique({
          where: { id: user.businessId },
          select: { stripeSubscriptionId: true, subscriptionStatus: true },
        })
      : null
    if (
      existing?.stripeSubscriptionId &&
      (existing.subscriptionStatus === "ACTIVE" || existing.subscriptionStatus === "PAST_DUE")
    ) {
      return NextResponse.json(
        { error: "You already have an active subscription. Manage it from Billing." },
        { status: 400 }
      )
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const funnelIndustry =
      typeof body?.funnelIndustry === "string" ? body.funnelIndustry.trim().toLowerCase() : ""
    const contactName = typeof body?.contactName === "string" ? body.contactName.trim() : ""
    const contactEmail = typeof body?.contactEmail === "string" ? body.contactEmail.trim() : ""

    const prepared = await prepareBusinessForTrial(
      {
        userId: user.id,
        businessPhone: businessPhone.trim(),
        funnelIndustry: funnelIndustry || undefined,
        contactName: contactName || undefined,
        contactEmail: contactEmail || undefined,
        smsConsent: body?.smsConsent === true,
        skipInternalTrial: true,
      },
      appUrl
    )

    if (prepared.ok === false) {
      return NextResponse.json({ error: prepared.error }, { status: prepared.status })
    }

    const session = await createSubscriptionTrialCheckoutSession(prepared.businessId, planType, appUrl)
    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error("Card trial start error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to start card trial" },
      { status: 500 }
    )
  }
}
