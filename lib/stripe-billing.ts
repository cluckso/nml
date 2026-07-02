import { PlanType } from "@prisma/client"

/** Client-safe Stripe billing helpers (no server SDK or DB imports). */

const PLACEHOLDER_IDS = ["price_starter", "price_pro", "price_local_plus", "price_elite", "price_usage"]

export type BillingInterval = "monthly" | "annual"

function getAnnualPriceIdForPlan(planType: PlanType): string | null {
  const priceIds: Record<PlanType, string | undefined> = {
    [PlanType.STARTER]: process.env.STRIPE_PRICE_STARTER_ANNUAL,
    [PlanType.PRO]: process.env.STRIPE_PRICE_PRO_ANNUAL,
    [PlanType.LOCAL_PLUS]: process.env.STRIPE_PRICE_LOCAL_PLUS_ANNUAL,
    [PlanType.ELITE]: process.env.STRIPE_PRICE_ELITE_ANNUAL,
  }
  const id = priceIds[planType]
  if (id && id.startsWith("price_") && !PLACEHOLDER_IDS.includes(id)) return id
  return null
}

/** Whether annual Stripe prices are configured for this plan. */
export function isAnnualBillingAvailable(planType: PlanType): boolean {
  return getAnnualPriceIdForPlan(planType) !== null
}

export function getAnnualStripePriceId(planType: PlanType): string | null {
  return getAnnualPriceIdForPlan(planType)
}
