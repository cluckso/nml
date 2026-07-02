import { FREE_TRIAL_MINUTES, TRIAL_DAYS, ANNUAL_FREE_MONTHS } from "./plans"

/** Paid subscribers: full refund within this window (marketing / support policy). */
export const MONEY_BACK_GUARANTEE_DAYS = 30

export function trialDaysLabel(): string {
  return `${TRIAL_DAYS}-day`
}

export function trialSummaryShort(): string {
  return `${TRIAL_DAYS}-day free trial · No card required`
}

export function trialSummaryWithMinutes(): string {
  return `${TRIAL_DAYS}-day free trial · ${FREE_TRIAL_MINUTES} call minutes · No card required`
}

export function moneyBackGuaranteeLabel(): string {
  return `${MONEY_BACK_GUARANTEE_DAYS}-day money-back guarantee`
}

export function annualSavingsLabel(): string {
  return `${ANNUAL_FREE_MONTHS} months free`
}
