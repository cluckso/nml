import { describe, it, expect } from "vitest"
import { PlanType } from "@prisma/client"
import {
  approxCallsPerMonth,
  formatIncludedUsageLabel,
  getCheaperUpgradePlan,
  getPlanUsageNudge,
  isUsageNudgeThreshold,
  TYPICAL_INTAKE_CALL_MINUTES,
  USAGE_NUDGE_THRESHOLD,
} from "../plan-usage"
import { INCLUDED_MINUTES } from "../plans"

describe("approxCallsPerMonth", () => {
  it("uses typical intake length", () => {
    expect(approxCallsPerMonth(300)).toBe(100)
    expect(approxCallsPerMonth(800)).toBe(266)
    expect(approxCallsPerMonth(1500)).toBe(500)
  })

  it("respects custom avg length", () => {
    expect(approxCallsPerMonth(300, 4)).toBe(75)
  })
})

describe("formatIncludedUsageLabel", () => {
  it("includes minutes and approximate calls", () => {
    expect(formatIncludedUsageLabel(300)).toMatch(/300.*≈100 calls.*~3 min/)
  })
})

describe("isUsageNudgeThreshold", () => {
  it("triggers at 80% of included minutes", () => {
    expect(USAGE_NUDGE_THRESHOLD).toBe(0.8)
    expect(isUsageNudgeThreshold(240, 300)).toBe(true)
    expect(isUsageNudgeThreshold(239, 300)).toBe(false)
  })
})

describe("getCheaperUpgradePlan", () => {
  it("suggests Mid when Solo overage exceeds Mid price", () => {
    expect(getCheaperUpgradePlan(PlanType.STARTER, 600)).toBe(PlanType.PRO)
  })

  it("returns null when Solo is still cheaper", () => {
    expect(getCheaperUpgradePlan(PlanType.STARTER, 350)).toBeNull()
  })
})

describe("getPlanUsageNudge", () => {
  it("nudges Solo users toward Mid at 80%", () => {
    const nudge = getPlanUsageNudge({
      planType: PlanType.STARTER,
      minutesUsed: 250,
      minutesIncluded: INCLUDED_MINUTES[PlanType.STARTER],
      isOnTrial: false,
    })
    expect(nudge?.show).toBe(true)
    expect(nudge?.upgradePlan).toBe(PlanType.PRO)
    expect(nudge?.message).toMatch(/missed and after-hours/i)
    expect(nudge?.message).toMatch(/24\/7/i)
  })

  it("warns on overage with cost", () => {
    const nudge = getPlanUsageNudge({
      planType: PlanType.STARTER,
      minutesUsed: 400,
      minutesIncluded: INCLUDED_MINUTES[PlanType.STARTER],
      isOnTrial: false,
    })
    expect(nudge?.severity).toBe("warning")
    expect(nudge?.message).toMatch(/overage/i)
  })

  it("nudges trial users near limit", () => {
    const nudge = getPlanUsageNudge({
      planType: null,
      minutesUsed: 33,
      minutesIncluded: 40,
      isOnTrial: true,
    })
    expect(nudge?.show).toBe(true)
    expect(nudge?.title).toMatch(/running low/i)
  })

  it("returns null below threshold", () => {
    expect(
      getPlanUsageNudge({
        planType: PlanType.STARTER,
        minutesUsed: 100,
        minutesIncluded: 300,
        isOnTrial: false,
      })
    ).toBeNull()
  })
})
