/**
 * Programmatic tests for the values the UI uses to display usage
 * (dashboard TrialCard, billing "Usage This Month" / "Trial usage").
 */
import { describe, it, expect } from "vitest"
import { FREE_TRIAL_MINUTES, getIncludedMinutes, getOverageMinutes } from "../plans"
import { PlanType } from "@prisma/client"

describe("Usage display values (TrialCard, Billing)", () => {
  it("trial display: minutesUsed and minutesRemaining match UI formula", () => {
    const minutesUsed = 12.5
    const minutesRemaining = Math.max(0, FREE_TRIAL_MINUTES - minutesUsed)
    expect(minutesRemaining).toBe(37.5)
    // UI shows Math.ceil(minutesUsed) / FREE_TRIAL_MINUTES
    const displayUsed = Math.ceil(minutesUsed)
    expect(displayUsed).toBe(13)
    expect(FREE_TRIAL_MINUTES).toBe(50)
  })

  it("trial progress bar percent is 0–100", () => {
    const minutesUsed = 25
    const percentUsed = FREE_TRIAL_MINUTES > 0 ? (minutesUsed / FREE_TRIAL_MINUTES) * 100 : 0
    expect(percentUsed).toBe(50)
    expect(percentUsed).toBeGreaterThanOrEqual(0)
    expect(percentUsed).toBeLessThanOrEqual(100)
  })

  it("billing: paid plan minutesUsed and overage match UI formula", () => {
    const minutesUsed = 350
    const planType = PlanType.STARTER
    const minutesIncluded = getIncludedMinutes(planType)
    const overageMinutes = Math.max(0, minutesUsed - minutesIncluded)
    expect(minutesIncluded).toBe(300)
    expect(overageMinutes).toBe(50)
    // UI overage cost
    const overageCost = overageMinutes * 0.2
    expect(overageCost).toBe(10)
  })

  it("billing: usage bar width percent is 0–100", () => {
    const minutesUsed = 150
    const minutesIncluded = 300
    const percent = minutesIncluded > 0 ? (minutesUsed / minutesIncluded) * 100 : 0
    expect(percent).toBe(50)
    expect(Math.min(100, percent)).toBe(50)
  })
})
