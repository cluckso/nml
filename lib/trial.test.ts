import { describe, it, expect, vi, beforeEach } from "vitest"
import { getTrialStatus } from "./trial"
import { FREE_TRIAL_MINUTES } from "./plans"

vi.mock("./db", () => ({
  db: {
    business: {
      findUnique: vi.fn(),
    },
  },
}))

const { db } = await import("./db")

describe("getTrialStatus", () => {
  beforeEach(() => {
    vi.mocked(db.business.findUnique).mockReset()
  })

  it("returns no trial when business is null", async () => {
    vi.mocked(db.business.findUnique).mockResolvedValue(null)
    const result = await getTrialStatus("any-id")
    expect(result.isOnTrial).toBe(false)
    expect(result.minutesUsed).toBe(0)
    expect(result.minutesRemaining).toBe(FREE_TRIAL_MINUTES)
    expect(result.isExhausted).toBe(false)
    expect(result.isExpired).toBe(false)
  })

  it("returns trial status when business has no subscription and trial fields", async () => {
    vi.mocked(db.business.findUnique).mockResolvedValue({
      id: "b1",
      trialMinutesUsed: 10,
      trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      subscriptionStatus: null,
    } as any)
    const result = await getTrialStatus("b1")
    expect(result.isOnTrial).toBe(true)
    expect(result.minutesUsed).toBe(10)
    expect(result.minutesRemaining).toBe(40)
    expect(result.isExhausted).toBe(false)
    expect(result.daysRemaining).toBeGreaterThanOrEqual(6)
  })

  it("marks exhausted when trialMinutesUsed >= FREE_TRIAL_MINUTES", async () => {
    vi.mocked(db.business.findUnique).mockResolvedValue({
      id: "b2",
      trialMinutesUsed: 50,
      trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      subscription: null,
    } as any)
    const result = await getTrialStatus("b2")
    expect(result.isOnTrial).toBe(true)
    expect(result.minutesUsed).toBe(50)
    expect(result.minutesRemaining).toBe(0)
    expect(result.isExhausted).toBe(true)
  })

  it("marks expired when trialEndsAt is in the past", async () => {
    vi.mocked(db.business.findUnique).mockResolvedValue({
      id: "b3",
      trialMinutesUsed: 5,
      trialEndsAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      subscriptionStatus: null,
    } as any)
    const result = await getTrialStatus("b3")
    expect(result.isOnTrial).toBe(true)
    expect(result.isExpired).toBe(true)
    expect(result.daysRemaining).toBe(0)
  })

  it("treats null trialMinutesUsed as 0", async () => {
    vi.mocked(db.business.findUnique).mockResolvedValue({
      id: "b4",
      trialMinutesUsed: null,
      trialEndsAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      subscription: null,
    } as any)
    const result = await getTrialStatus("b4")
    expect(result.minutesUsed).toBe(0)
    expect(result.minutesRemaining).toBe(FREE_TRIAL_MINUTES)
  })

  it("is not on trial when subscription is active", async () => {
    vi.mocked(db.business.findUnique).mockResolvedValue({
      id: "b5",
      trialMinutesUsed: 10,
      trialEndsAt: null,
      subscriptionStatus: "ACTIVE",
      planType: "STARTER",
    } as any)
    const result = await getTrialStatus("b5")
    expect(result.isOnTrial).toBe(false)
  })
})
