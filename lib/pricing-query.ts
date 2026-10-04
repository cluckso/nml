import type { BillingInterval } from "@/lib/stripe-billing"

/** URL ?plan= values — string literals so client code need not import @prisma/client. */
export type PricingPlanParam = "STARTER" | "PRO" | "ELITE" | "LOCAL_PLUS"

const PLAN_PARAM_SET = new Set<string>(["STARTER", "PRO", "ELITE", "LOCAL_PLUS"])

export function parseHighlightPlanParam(
  raw: string | string[] | null | undefined
): PricingPlanParam | null {
  const value = Array.isArray(raw) ? raw[0] : raw
  if (!value) return null
  const upper = value.toUpperCase()
  return PLAN_PARAM_SET.has(upper) ? (upper as PricingPlanParam) : null
}

export function parseBillingParam(
  raw: string | string[] | null | undefined
): BillingInterval {
  const value = Array.isArray(raw) ? raw[0] : raw
  return value === "annual" ? "annual" : "monthly"
}

export function parsePaidIntent(
  raw: string | string[] | null | undefined
): boolean {
  const value = Array.isArray(raw) ? raw[0] : raw
  return value === "paid"
}
