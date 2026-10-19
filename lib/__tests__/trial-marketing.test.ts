import { describe, it, expect } from "vitest"
import {
  basicVsGrowthFitLine,
  moneyBackPaidOnlyLine,
  phoneDemoCtaLabel,
  plansFromAnchorLabel,
  trialCtaLabel,
  trialDisclosureLine,
  trialLimitsLine,
  trialNavCtaLabel,
  trialWhatHappensAtLimitLine,
} from "../trial-marketing"
import { FREE_TRIAL_MINUTES, TRIAL_DAYS, MONTHLY_PRICES } from "../plans"
import { PlanType } from "@prisma/client"

describe("trial disclosure copy", () => {
  it("states both limits and whichever-comes-first", () => {
    expect(trialLimitsLine()).toBe(
      `${TRIAL_DAYS} days or ${FREE_TRIAL_MINUTES} call minutes — whichever comes first`
    )
    expect(trialDisclosureLine()).toContain(trialLimitsLine())
    expect(trialDisclosureLine()).toMatch(/No card required/)
    expect(trialDisclosureLine()).toMatch(/One trial per business number/)
  })

  it("explains what happens at the limit and names Basic", () => {
    expect(trialWhatHappensAtLimitLine()).toMatch(/pauses/)
    expect(trialWhatHappensAtLimitLine()).toContain(`$${MONTHLY_PRICES[PlanType.STARTER]}/month`)
  })

  it("uses consistent trial and demo CTA labels", () => {
    expect(trialCtaLabel()).toBe(`Start the ${TRIAL_DAYS}-day trial`)
    expect(trialNavCtaLabel()).toBe(trialCtaLabel())
    expect(phoneDemoCtaLabel()).toMatch(/60-second phone demo/)
  })

  it("anchors plan price and Basic vs Growth fit by volume/features", () => {
    expect(plansFromAnchorLabel()).toBe(`Plans from $${MONTHLY_PRICES[PlanType.STARTER]}/month`)
    expect(basicVsGrowthFitLine()).toMatch(/to start/)
    expect(basicVsGrowthFitLine()).toMatch(/more minutes/)
    expect(basicVsGrowthFitLine()).not.toMatch(/every-call|after-hours lead insurance/)
  })

  it("states money-back on paid plans without hedging the trial", () => {
    expect(moneyBackPaidOnlyLine()).toMatch(/paid plans/)
    expect(moneyBackPaidOnlyLine()).not.toMatch(/not the free trial/)
  })
})
