import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { createCheckoutSession } from "@/lib/stripe"
import { PlanType } from "@prisma/client"
import { SETUP_FEES } from "@/lib/plans"

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

    const setupFee = SETUP_FEES[planType as PlanType]
    if (setupFee === undefined) {
      return NextResponse.json(
        { error: "Invalid plan" },
        { status: 400 }
      )
    }

    const session = await createCheckoutSession(
      user.businessId,
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
