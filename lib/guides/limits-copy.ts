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
    `${PLAN_BASIC} is $${basic.price} per month and includes ${basicCalls}. The card says lead insurance: missed calls, nights, and weekends — plus trade-tuned intake and text-back confirmation to callers. It does not answer every ring all day. At that included volume the math is ${basicPerCall}, using a 3-minute average call. A call under a minute still bills as 1 minute, and longer calls round up.`,
    `${PLAN_GROWTH} is $${growth.price} per month (${growthCalls}). It is the plan marked most popular. You get 24/7 inbound on every ring, appointment and emergency handling, follow-up texts to callers, and CRM email or webhook delivery. ${PLAN_PLATINUM} is $${platinum.price} per month (${platinumCalls}) and adds a branded voice, multi-department routing, after-hours emergency routing, weekly reports, and priority support.`,
    `Minutes past the included cap are ${formatOverageRate()}. Annual billing charges 10 months (a ${ANNUAL_FREE_MONTHS}-month break on a 12-month term). There is no setup fee. The trial is ${TRIAL_DAYS} days or ${FREE_TRIAL_MINUTES} real call minutes, whichever comes first, one trial per business number, and no card to start. The 30-day money-back guarantee covers the first paid subscription. Overage for minutes you already used may not be refunded.`,
    `Trade-tuned intake (HVAC, plumbing, electrical, auto repair, handyman, childcare) is included on ${PLAN_BASIC} and above. Cleaning and landscaping use the generic script. Spam filtering uses a lookup and fails open: if the lookup errors, the call is not blocked. The assistant says it is automated if the caller asks.`,
    `Worked example, labeled as an illustration, not a CallGrabbr measurement: three missed calls on a busy day, an industry hang-up range of about 80 percent, and a job you price at $300, $500, or $600. One job in that range covers more than one month of ${PLAN_BASIC}. Your ticket and your miss rate will differ. The 80–95 percent figure on the homepage is an industry rate for answered calls, not a count of CallGrabbr customers.`,
    `You can hear a 60-second sample at +1 (202) 952-6890 before you sign up. Forwarding stays on your carrier, so the shop number does not change. Basic can wait and pick up only the calls you miss. Growth can take every inbound call. Neither plan replaces you on a complicated insurance or warranty dispute: the lead is texted so you call back, and transfer rules can send that caller to your phone.`,
  ]
}

export function guideLimitsPlainText(): string {
  return guideLimitsParagraphs().join(" ")
}
