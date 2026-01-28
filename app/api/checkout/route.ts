import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { createCheckoutSession } from "@/lib/stripe"
import { PlanType } from "@prisma/client"

const PLAN_DETAILS = {
  [PlanType.STARTER]: { setupFee: 99 },
  [PlanType.PRO]: { setupFee: 199 },
  [PlanType.LOCAL_PLUS]: { setupFee: 299 },
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth()
    const { planType } = await req.json()

    if (!user.businessId) {
      return NextResponse.json(
        { error: "Business not found" },
        { status: 400 }
      )
    }

    const plan = PLAN_DETAILS[planType as PlanType]
    if (!plan) {
      return NextResponse.json(
        { error: "Invalid plan" },
        { status: 400 }
      )
    }

    const session = await createCheckoutSession(
      user.businessId,
      planType as PlanType,
      plan.setupFee
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
