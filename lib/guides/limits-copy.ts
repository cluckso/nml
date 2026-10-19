import { formatIncludedUsagePrimary, formatCostPerCapturedCall } from "@/lib/plan-usage"
import { PRICING_TIERS_BY_KEY, formatOverageRate } from "@/lib/pricing-catalog"
import { PLAN_BASIC, PLAN_GROWTH, PLAN_PLATINUM } from "@/lib/plan-labels"
import { FREE_TRIAL_MINUTES, TRIAL_DAYS, ANNUAL_FREE_MONTHS } from "@/lib/plans"

const basic = PRICING_TIERS_BY_KEY[PLAN_BASIC]
const growth = PRICING_TIERS_BY_KEY[PLAN_GROWTH]
const platinum = PRICING_TIERS_BY_KEY[PLAN_PLATINUM]

/**
 * Numbers, limits, and edge cases shared by the contractor guides.
 * Facts come from the pricing catalog, not from a customer study.
 */
export function guideLimitsParagraphs(): string[] {
  const basicCalls = formatIncludedUsagePrimary(basic.includedMinutes)
  const growthCalls = formatIncludedUsagePrimary(growth.includedMinutes)
  const platinumCalls = formatIncludedUsagePrimary(platinum.includedMinutes)
  const basicPerCall = formatCostPerCapturedCall(basic.price, basic.includedMinutes)

  return [
    `${PLAN_BASIC} is $${basic.price} per month and includes ${basicCalls}. It is the best place to start: trade-tuned intake and text-back confirmation to callers so they know you got the job. At that included volume the math is ${basicPerCall}, using a 3-minute average call. A call under a minute still bills as 1 minute, and longer calls round up.`,
    `${PLAN_GROWTH} is $${growth.price} per month (${growthCalls}). It is the plan marked most popular. You get more included minutes, appointment and emergency handling, follow-up texts to callers, and CRM email or webhook delivery into ServiceTitan, Housecall Pro, Jobber, or Zapier. ${PLAN_PLATINUM} is $${platinum.price} per month (${platinumCalls}) and adds a branded voice, multi-department routing, after-hours emergency routing, weekly reports, and priority support for busy multi-crew shops.`,
    `Minutes past the included cap are ${formatOverageRate()}. Annual billing charges 10 months (a ${ANNUAL_FREE_MONTHS}-month break on a 12-month term). There is no setup fee on any plan. The trial is ${TRIAL_DAYS} days or ${FREE_TRIAL_MINUTES} real call minutes, whichever comes first, one trial per business number, and no card to start. Paid plans include a 30-day money-back guarantee. Cancel anytime from billing — no long-term contract and no hassle.`,
    `Trade-tuned intake (HVAC, plumbing, electrical, auto repair, handyman, childcare) is included on ${PLAN_BASIC} and above, so callers get asked about the job the way your trade actually works — not a generic “how can I help.” Cleaning and landscaping use the generic script. Spam and robocalls are filtered so alerts focus on real leads. You control recording, escalation, and what fields we capture from Settings.`,
    `Three missed calls on a busy day, an 80% hang-up rate, and a job you price at $300, $500, or $600: one captured job in that range covers more than one month of ${PLAN_BASIC}. That walk-away cost is why shops stop relying on voicemail and start capturing the lead in a text they can tap to call back the same day.`,
    `You can hear a 60-second sample at +1 (202) 952-6890 before you sign up. Forwarding stays on your carrier, so the shop number customers already dial does not change. On any plan you can ring your phone first and catch what you miss, or answer every inbound call — you choose in settings. The lead is texted so you call back fast, and transfer rules can send urgent callers straight to your phone. Setup takes minutes — sign up, enter some details, attach your phone using our setup guide — and you keep the number customers already know.`,
  ]
}

export function guideLimitsPlainText(): string {
  return guideLimitsParagraphs().join(" ")
}
