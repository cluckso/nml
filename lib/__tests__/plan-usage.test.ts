import { describe, it, expect } from "vitest"
import { PlanType } from "@prisma/client"
import {
  approxCallsPerMonth,
  formatIncludedUsageLabel,
  formatIncludedUsageShort,
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
    expect(approxCallsPerMonth(500)).toBe(166)
    expect(approxCallsPerMonth(1200)).toBe(400)
  })

  it("respects custom avg length", () => {
    expect(approxCallsPerMonth(300, 4)).toBe(75)
  })
})

describe("formatIncludedUsageLabel", () => {
  it("leads with approximate calls for marketing", () => {
    expect(formatIncludedUsageLabel(250)).toMatch(/~83 captured calls\/mo \(250 min included/)
    expect(formatIncludedUsageLabel(300)).not.toMatch(/not guaranteed/)
  })
})

describe("formatIncludedUsageShort", () => {
  it("shows call volume and avg duration without a dollar sign", () => {
    expect(formatIncludedUsageShort(300)).toBe(
      `~100 calls/mo · about ${TYPICAL_INTAKE_CALL_MINUTES} min each`
    )
    expect(formatIncludedUsageShort(300)).not.toMatch(/\$\d+ min/)
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
  it("does not suggest Growth for Basic overage (same $/min; Growth is features-led)", () => {
    // With $99/250 + $0.29 vs $189/500 + $0.29, Basic stays cheaper at any usage.
    expect(getCheaperUpgradePlan(PlanType.STARTER, 600)).toBeNull()
    expect(getCheaperUpgradePlan(PlanType.STARTER, 1200)).toBeNull()
  })

  it("returns null at light Basic usage", () => {
    expect(getCheaperUpgradePlan(PlanType.STARTER, 200)).toBeNull()
  })
})

describe("getPlanUsageNudge", () => {
  it("nudges Basic users toward Growth at 80%", () => {
    const nudge = getPlanUsageNudge({
      planType: PlanType.STARTER,
      minutesUsed: 200,
      minutesIncluded: INCLUDED_MINUTES[PlanType.STARTER],
      isOnTrial: false,
    })
    expect(nudge?.show).toBe(true)
    expect(nudge?.upgradePlan).toBe(PlanType.PRO)
    expect(nudge?.message).toMatch(/one-truck/i)
    expect(nudge?.message).toMatch(/more room/i)
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
        minutesIncluded: INCLUDED_MINUTES[PlanType.STARTER],
        isOnTrial: false,
      })
    ).toBeNull()
  })
})
