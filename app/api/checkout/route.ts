import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { createCheckoutSession } from "@/lib/stripe"
import { db } from "@/lib/db"
import { PlanType } from "@prisma/client"
import { Industry } from "@prisma/client"
import { SETUP_FEES } from "@/lib/plans"

/** Plan-first flow: create minimal business so user can checkout before onboarding. */
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth()
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
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    )
  }
}
