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
  return `You're on the ${TRIAL_DAYS}-day free trial. Upgrade anytime from Billing.`
}

export function trialBillingDescription(): string {
  return `${TRIAL_DAYS}-day free trial.`
}

export function trialBillingCardLabel(): string {
  return `Free trial — ${TRIAL_DAYS} days`
}

export function siteMetaDescription(): string {
  return `80% of callers won't leave voicemail — they call the next business. CallGrabbr answers missed calls and texts you the lead in seconds. ${trialSummaryShort()}.`
}

export function authMetaDescription(): string {
  return `Sign in or sign up for CallGrabbr. Start your ${TRIAL_DAYS}-day free trial with no card required.`
}

export function trialStartMetaDescription(): string {
  return `Start your ${TRIAL_DAYS}-day free trial. No card required. Add your business phone to get your call assistant.`
}

export function pricingSchemaTrialDescription(): string {
  return `Plans from $99/month with a ${TRIAL_DAYS}-day free trial`
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
