import { PlanType } from "@prisma/client"
import { stripe } from "./stripe"

export type PurchaseSuccessContext = {
  planType: PlanType
  source: "checkout_session" | "in_place_upgrade" | "subscription"
}

/** Verify a completed Stripe Checkout session belongs to this business. */
export async function getPurchaseFromCheckoutSession(
  sessionId: string,
  businessId: string
): Promise<PurchaseSuccessContext | null> {
  if (!stripe) return null

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    if (session.status !== "complete") return null
    if (session.metadata?.businessId !== businessId) return null

    const planType = session.metadata?.planType as PlanType | undefined
    if (!planType || !Object.values(PlanType).includes(planType)) return null

    return {
      planType,
      source: "checkout_session",
    }
  } catch (error) {
    console.error("Failed to verify checkout session:", error)
    return null
  }
}
