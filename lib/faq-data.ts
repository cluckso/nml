import type { FaqItem } from "@/lib/structured-data"
import { PLAN_BASIC, PLAN_GROWTH, PLAN_PLATINUM } from "@/lib/plan-labels"
import { MONTHLY_PRICES, getIncludedMinutes, TRIAL_DAYS, FREE_TRIAL_MINUTES } from "@/lib/plans"
import { approxCallsPerMonth } from "@/lib/plan-usage"
import { PlanType } from "@prisma/client"
import { formatJobValuePromptLine, HUMAN_RECEPTIONIST_FROM_MONTHLY } from "@/lib/pricing-catalog"
import { productDefinitionSentence } from "@/lib/marketing/positioning"

const basicCalls = approxCallsPerMonth(getIncludedMinutes(PlanType.STARTER))
const growthCalls = approxCallsPerMonth(getIncludedMinutes(PlanType.PRO))
const platinumCalls = approxCallsPerMonth(getIncludedMinutes(PlanType.ELITE))

/** General product FAQ — used on Help page and FAQPage JSON-LD. */
export const PRODUCT_FAQ: FaqItem[] = [
  {
    question: "What is CallGrabbr?",
    answer: productDefinitionSentence(),
  },
  {
    question: "Do I need to change my business phone number?",
    answer:
      "No. You keep your existing business number. Set up call forwarding from your carrier so unanswered calls route to your CallGrabbr number shown in your dashboard.",
  },
  {
    question: "How does the free trial work?",
    answer: `You get a ${TRIAL_DAYS}-day free trial with ${FREE_TRIAL_MINUTES} included call minutes. No credit card is required to start. One trial per business phone number.`,
  },
  {
    question: "What information does CallGrabbr capture from callers?",
    answer:
      "Typical lead details include caller name, callback number, reason for the call, service address, vehicle info (for auto shops), urgency, and preferred appointment time—based on your industry and settings. Review and edit exactly what we capture in Settings → What we capture.",
  },
  {
    question: "Which industries does CallGrabbr support?",
    answer:
      "CallGrabbr is built for HVAC, plumbing, electrical, auto repair, handyman, cleaning, landscaping, childcare, and other local service businesses.",
  },
  {
    question: "Can CallGrabbr pick up only when I miss a call?",
    answer:
      "Yes. In Settings → Call Routing you can capture all calls immediately or set a delay (seconds or rings) so your line rings first and CallGrabbr picks up when you don't. New trials default to ringing your phone first during business hours — that's the lead-insurance mode most one-truck shops want.",
  },
  {
    question: "How do I cancel?",
    answer:
      "Cancel anytime from Billing → Manage billing & cancel. That opens the Stripe customer portal where you can cancel your subscription, update your card, or download invoices. No need to delete your account.",
  },
  {
    question: "How much does CallGrabbr cost after the trial?",
    answer: `${PLAN_BASIC} is $${MONTHLY_PRICES[PlanType.STARTER]}/month (~${basicCalls} captured calls) for missed and after-hours lead insurance. ${PLAN_GROWTH} is $${MONTHLY_PRICES[PlanType.PRO]}/month (~${growthCalls} calls) for shops that want most inbound calls captured. ${PLAN_PLATINUM} is $${MONTHLY_PRICES[PlanType.ELITE]}/month (~${platinumCalls} calls) for busy multi-crew operations. Estimates assume ~3 minutes per call. Additional usage is $0.22/min. ${formatJobValuePromptLine()} Capture one you'd have lost and the plan often pays for itself for months.`,
  },
  {
    question: "Which plan should I choose?",
    answer: `Start with ${PLAN_BASIC} lead insurance if you're a one-truck shop and mainly need missed and after-hours jobs captured while you're on a job. Choose ${PLAN_GROWTH} when you want full front-desk coverage on most inbound calls. ${PLAN_PLATINUM} fits busy shops with multiple crews or departments. Upgrade anytime as volume grows.`,
  },
  {
    question: "Is CallGrabbr worth $99/month?",
    answer: `For most service businesses, yes — if it captures even one job you'd have lost to voicemail. ${formatJobValuePromptLine()} ${PLAN_BASIC} costs $${MONTHLY_PRICES[PlanType.STARTER]}/month (~$0.99 per captured call at included volume). That's far less than a human answering service ($${HUMAN_RECEPTIONIST_FROM_MONTHLY}+/month) and usually cheaper than one missed emergency call.`,
  },
  {
    question: "Does it work with ServiceTitan or Housecall Pro?",
    answer:
      "Yes. Growth and Platinum send captured leads to ServiceTitan, Housecall Pro, Jobber, or any CRM through a webhook or Zapier. You keep the software you already run — there is no new dashboard to learn.",
  },
  {
    question: "Do callers get a text-back?",
    answer:
      "On Growth and Platinum, callers can get a confirmation text and a follow-up so they do not dial the next shop while you are still on a job.",
  },
  {
    question: "Is it AI?",
    answer:
      "Yes — an automated system picks up when you can't, runs trade-tuned intake, and texts you the lead. It sounds natural in conversation and identifies as automated if a caller asks directly. Calls may be recorded for quality; you control those settings. The product is missed-call lead capture — answering the phone is the mechanism, not the category.",
  },
]
