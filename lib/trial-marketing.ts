import { FREE_TRIAL_MINUTES, TRIAL_DAYS, ANNUAL_FREE_MONTHS, MONTHLY_PRICES } from "./plans"
import { PlanType } from "@prisma/client"
import { PLAN_BASIC, PLAN_GROWTH } from "./plan-labels"

/** Paid subscribers: full refund within this window (marketing / support policy). */
export const MONEY_BACK_GUARANTEE_DAYS = 30

/** Anchor for carrier forwarding steps on Help & FAQ. */
export const CARRIER_SETUP_HREF = "/docs/faq#call-forwarding"

export function trialDaysLabel(): string {
  return `${TRIAL_DAYS}-day`
}

export function trialHeadlineLabel(): string {
  return `${TRIAL_DAYS}-day free trial`
}

/** Canonical short limit — use everywhere the cap is named. */
export function trialLimitsLine(): string {
  return `${TRIAL_DAYS} days or ${FREE_TRIAL_MINUTES} call minutes — whichever comes first`
}

/**
 * Full disclosure beside every trial CTA (audit: consistent trial limit).
 * Prefer this over partial “14 days / no card” lines on public surfaces.
 */
export function trialDisclosureLine(): string {
  return `${trialLimitsLine()}. No card required. One trial per business number.`
}

/** What happens when the trial hits a limit — pair with trialDisclosureLine. */
export function trialWhatHappensAtLimitLine(): string {
  return `When either limit hits, answering pauses until you choose a paid plan. Most one-truck shops continue on ${PLAN_BASIC} at $${MONTHLY_PRICES[PlanType.STARTER]}/month.`
}

export function trialSummaryShort(): string {
  return `${trialLimitsLine()} · No card required`
}

export function trialSummaryWithMinutes(): string {
  return `${TRIAL_DAYS}-day free trial · ${FREE_TRIAL_MINUTES} call minutes · No card required`
}

export function trialWithNoCardSentence(): string {
  return `Start with a ${TRIAL_DAYS}-day free trial (${trialLimitsLine()}). No credit card required.`
}

export function trialCtaLabel(): string {
  return `Start the ${TRIAL_DAYS}-day trial`
}

/** Phone demo CTA — distinguishes sample from a sales call. */
export function phoneDemoCtaLabel(): string {
  return "Hear the 60-second phone demo"
}

/** Compact price anchor next to homepage trial CTAs. */
export function plansFromAnchorLabel(): string {
  return `Plans from $${MONTHLY_PRICES[PlanType.STARTER]}/month`
}

/** One-truck setup reassurance near trial CTAs. */
export function setupReassuranceLine(): string {
  return "Keep your number; your phone rings first, then unanswered calls forward."
}

/** Concise Basic vs Growth fit for the trial path. */
export function basicVsGrowthFitLine(): string {
  return `${PLAN_BASIC} = missed & after-hours lead insurance. ${PLAN_GROWTH} = every-call front-desk coverage.`
}

/** Money-back applies to paid subscriptions — keep short; avoid stacking near every CTA. */
export function moneyBackPaidOnlyLine(): string {
  return `${moneyBackGuaranteeLabel()} on paid plans`
}

export function trialOnboardingHint(): string {
  return `You're on the ${TRIAL_DAYS}-day free trial — finish setup below, then forward your line to catch your first real call.`
}

/** Dashboard header when user is on trial. */
export function trialDashboardSubtitle(): string {
  return "Forward your line, get your first call, then decide if one captured lead is worth keeping."
}

/** Goal line for trial activation checklist. */
export function trialActivationGoal(): string {
  return "Most owners upgrade after one captured lead. These steps get you there."
}

/** Onboarding welcome subtitle for trial users. */
export function onboardingWelcomeSubtitle(hasPlan: boolean): string {
  if (hasPlan) {
    return "You're subscribed — pick your trade, shop name, and service area so we know how to capture each job."
  }
  return `${TRIAL_DAYS}-day trial · ${FREE_TRIAL_MINUTES} call minutes (${trialLimitsLine()}). Setup takes under a minute.`
}

/** Shown after onboarding completes — pushes user to dashboard setup. */
export function onboardingCompleteNextStep(): string {
  return "Next: connect your line on the dashboard and forward your business number so we can grab missed-call leads."
}

export function trialBillingDescription(): string {
  return `${TRIAL_DAYS}-day free trial.`
}

export function trialBillingCardLabel(): string {
  return `Free trial — ${TRIAL_DAYS} days`
}

export function siteMetaDescription(): string {
  return `AI answering service for HVAC and plumbing. We grab missed-call leads and text you in seconds. ${trialLimitsLine()}. No card required.`
}

export function heroGuaranteeLine(): string {
  return `${trialTrustLine()} · ${moneyBackGuaranteeLabel()}`
}

export function authMetaDescription(): string {
  return `Sign in or sign up for CallGrabbr. Start your ${TRIAL_DAYS}-day free trial with no card required.`
}

export function trialStartMetaDescription(): string {
  return `Start a ${TRIAL_DAYS}-day CallGrabbr trial with ${FREE_TRIAL_MINUTES} real call minutes. No card required. One trial per business phone number.`
}

export function pricingSchemaTrialDescription(): string {
  return `${TRIAL_DAYS}-day free trial · Plans from $${MONTHLY_PRICES[PlanType.STARTER]}/mo · one captured job pays for months`
}

/** Short value prop for auth, trial, pricing, and hero. */
export function trialConversionLine(): string {
  return `Forward your line for ${TRIAL_DAYS} days with ${FREE_TRIAL_MINUTES} real call minutes. Your phone rings first — we pick up when you can't. Capture a lead you'd have lost, or don't pay.`
}

/** Hero / trust strip — includes minute cap for consistent expectations. */
export function trialTrustLine(): string {
  return `${trialLimitsLine()} · No card required · Cancel anytime`
}

/** Primary nav and signup CTA — consistent highest-intent language. */
export function trialNavCtaLabel(): string {
  return trialCtaLabel()
}

/** Loss-framed upgrade CTA — use instead of leading with price. */
export function upgradeKeepAnsweringLabel(): string {
  return "Keep capturing leads"
}

/** After trial ends or minutes exhausted. */
export function upgradeTrialEndedLabel(): string {
  return "Turn lead capture back on"
}

/** Mid-trial save — show around day 5 or when ~70% of minutes are used. */
export function midTrialUpgradeNudgeLine(): string {
  return `How much is one more captured job worth — $300? $500? $600+? Upgrade before the trial ends so the next after-hours call still gets answered.`
}

/** Sign-up page headline — trial-first, not account-first. */
export function signupPageTitle(): string {
  return "Start your free trial"
}

/** Sign-up page subtitle. */
export function signupPageDescription(): string {
  return `Create your account in under a minute. ${trialDisclosureLine()}`
}

/** Sign-in page for returning users who may not have finished setup. */
export function signInPageDescription(): string {
  return "Sign in to finish setup, view captured leads, and manage missed-call lead capture."
}

/** Onboarding completion — urgency without pricing. */
export function onboardingCompleteCelebration(): string {
  return "You're one forwarded call away from your first captured lead."
}

/** Email confirmation — restate value while they wait. */
export function confirmEmailValueLine(): string {
  return `After you sign in, you'll get ${FREE_TRIAL_MINUTES} minutes of real call coverage to test with your own line (${trialLimitsLine()}) — no card required.`
}

export function funnelTrialFeatureLabel(): string {
  return `No setup fee · ${trialLimitsLine()}`
}

export function defaultFunnelTrialCta(): { type: "trial"; label: string } {
  return { type: "trial", label: trialCtaLabel() }
}

export function moneyBackGuaranteeLabel(): string {
  return `${MONEY_BACK_GUARANTEE_DAYS}-day money-back guarantee`
}

export function annualSavingsLabel(): string {
  return `${ANNUAL_FREE_MONTHS} months free`
}
