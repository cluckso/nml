import { PlanType } from "@prisma/client"

export type PricingIntent = "paid" | "trial"

export function pricingUrl(options?: {
  intent?: PricingIntent
  plan?: PlanType
  billing?: "monthly" | "annual"
  ref?: string
  industry?: string
}): string {
  const params = new URLSearchParams()
  if (options?.intent) params.set("intent", options.intent)
  if (options?.plan) params.set("plan", options.plan)
  if (options?.billing) params.set("billing", options.billing)
  if (options?.ref) params.set("ref", options.ref)
  if (options?.industry) params.set("industry", options.industry)
  const query = params.toString()
  return query ? `/pricing?${query}` : "/pricing"
}

export function trialStartUrl(options?: { mode?: "card" | "free"; plan?: PlanType; fromFunnel?: boolean; industry?: string }): string {
  const params = new URLSearchParams()
  if (options?.mode === "card") params.set("mode", "card")
  if (options?.plan) params.set("plan", options.plan)
  if (options?.fromFunnel) params.set("from", "funnel")
  if (options?.industry) params.set("industry", options.industry)
  const query = params.toString()
  return query ? `/trial/start?${query}` : "/trial/start"
}

export function funnelSubscribeUrl(industrySlug: string): string {
  return pricingUrl({
    intent: "paid",
    plan: PlanType.PRO,
    ref: "funnel",
    industry: industrySlug,
  })
}
