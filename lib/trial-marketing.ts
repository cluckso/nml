import { FREE_TRIAL_MINUTES, TRIAL_DAYS, ANNUAL_FREE_MONTHS } from "./plans"

/** Paid subscribers: full refund within this window (marketing / support policy). */
export const MONEY_BACK_GUARANTEE_DAYS = 30

export function trialDaysLabel(): string {
  return `${TRIAL_DAYS}-day`
}

export function trialHeadlineLabel(): string {
  return `${TRIAL_DAYS}-day free trial`
}

export function trialSummaryShort(): string {
  return `${TRIAL_DAYS}-day free trial · No card required`
}

export function trialSummaryWithMinutes(): string {
  return `${TRIAL_DAYS}-day free trial · ${FREE_TRIAL_MINUTES} call minutes · No card required`
}

export function trialWithNoCardSentence(): string {
  return `Start with a ${TRIAL_DAYS}-day free trial. No credit card required.`
}

export function trialCtaLabel(): string {
  return `Start free ${TRIAL_DAYS}-day trial`
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
    return "You're subscribed — add your business details so your call assistant knows how to answer."
  }
  return `${TRIAL_DAYS}-day trial · ${FREE_TRIAL_MINUTES} call minutes (${trialLimitsLine()}) · About 5 minutes to go live.`
}

/** Shown after onboarding completes — pushes user to dashboard setup. */
export function onboardingCompleteNextStep(): string {
  return "Next: connect your call assistant on the dashboard and forward your business line."
}

export function trialBillingDescription(): string {
  return `${TRIAL_DAYS}-day free trial.`
}

export function trialBillingCardLabel(): string {
  return `Free trial — ${TRIAL_DAYS} days`
}

export function siteMetaDescription(): string {
  return `When you miss a call, most callers hang up and dial your competitor. CallGrabbr answers and texts you the lead in seconds. One captured job pays for months. ${trialSummaryShort()}.`
}

export function authMetaDescription(): string {
  return `Sign in or sign up for CallGrabbr. Start your ${TRIAL_DAYS}-day free trial with no card required.`
}

export function trialStartMetaDescription(): string {
  return `Start your ${TRIAL_DAYS}-day free trial. No card required. Add your business phone to get your call assistant.`
}

export function pricingSchemaTrialDescription(): string {
  return `${TRIAL_DAYS}-day free trial · Plans from $99/mo · one captured job pays for months`
}

/** Short value prop for auth and trial pages. */
export function trialConversionLine(): string {
  return `Forward your line for ${TRIAL_DAYS} days with ${FREE_TRIAL_MINUTES} real call minutes. If it doesn't capture a lead you'd have lost, don't pay.`
}

/** Clarifies trial ends when either limit hits — use on trial start and onboarding. */
export function trialLimitsLine(): string {
  return `${TRIAL_DAYS} days or ${FREE_TRIAL_MINUTES} call minutes — whichever comes first`
}

/** Hero / trust strip — outcome only, no pricing. */
export function trialTrustLine(): string {
  return `${trialDaysLabel()} free trial · No card required · Cancel anytime`
}

/** Primary nav and signup CTA — consistent highest-intent language. */
export function trialNavCtaLabel(): string {
  return "Start free trial"
}

/** Loss-framed upgrade CTA — use instead of leading with price. */
export function upgradeKeepAnsweringLabel(): string {
  return "Keep answering calls"
}

/** After trial ends or minutes exhausted. */
export function upgradeTrialEndedLabel(): string {
  return "Turn your assistant back on"
}

/** Sign-up page headline — trial-first, not account-first. */
export function signupPageTitle(): string {
  return "Start your free trial"
}

/** Sign-up page subtitle. */
export function signupPageDescription(): string {
  return `Create your account in under a minute. ${trialLimitsLine()}. No credit card required.`
}

/** Sign-in page for returning users who may not have finished setup. */
export function signInPageDescription(): string {
  return "Sign in to finish setup, view captured leads, and manage your call assistant."
}

/** Onboarding completion — urgency without pricing. */
export function onboardingCompleteCelebration(): string {
  return "You're one forwarded call away from your first captured lead."
}

/** Email confirmation — restate value while they wait. */
export function confirmEmailValueLine(): string {
  return `After you sign in, you'll get ${FREE_TRIAL_MINUTES} minutes of real call coverage to test with your own line — no card required.`
}

export function funnelTrialFeatureLabel(): string {
  return `No setup fee · ${TRIAL_DAYS}-day trial`
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
