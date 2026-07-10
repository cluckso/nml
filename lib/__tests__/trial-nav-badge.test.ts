import { describe, expect, it } from "vitest"
import { getTrialNavBadge } from "../trial-nav-badge"

const activeTrial = {
  isOnTrial: true,
  hasAgent: true,
  minutesRemaining: 35,
  daysRemaining: 6,
  isExhausted: false,
  isExpired: false,
  minutesUsed: 5,
}

describe("getTrialNavBadge", () => {
  it("returns null when not on trial", () => {
    expect(getTrialNavBadge({ ...activeTrial, isOnTrial: false })).toBeNull()
  })

  it("prompts setup when agent is not connected", () => {
    const badge = getTrialNavBadge({ ...activeTrial, hasAgent: false })
    expect(badge?.label).toBe("Trial · Finish setup")
    expect(badge?.href).toBe("/dashboard#setup")
    expect(badge?.variant).toBe("warning")
  })

  it("shows urgent minutes when almost out", () => {
    const badge = getTrialNavBadge({ ...activeTrial, minutesRemaining: 4, minutesUsed: 36 })
    expect(badge?.label).toBe("Trial · 4 min left")
    expect(badge?.variant).toBe("urgent")
  })

  it("shows days left when time is running out", () => {
    const badge = getTrialNavBadge({ ...activeTrial, daysRemaining: 2, minutesRemaining: 30 })
    expect(badge?.label).toBe("Trial · 2 days left")
    expect(badge?.variant).toBe("warning")
  })

  it("shows ended state when trial is exhausted", () => {
    const badge = getTrialNavBadge({
      ...activeTrial,
      isExhausted: true,
      minutesRemaining: 0,
    })
    expect(badge?.label).toBe("Trial ended · Turn back on")
    expect(badge?.href).toBe("/billing")
    expect(badge?.variant).toBe("urgent")
  })
})
