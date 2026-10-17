import { describe, it, expect, vi, beforeEach } from "vitest"
import {
  getTrialStatus,
  checkTrialEligibility,
  isMultiTrialPhone,
  trialDaysRemaining,
} from "./trial"
import { FREE_TRIAL_MINUTES } from "./plans"

vi.mock("./db", () => ({
  db: {
    business: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
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
    const now = Date.now()
    vi.mocked(db.business.findUnique).mockResolvedValue({
      id: "b1",
      trialMinutesUsed: 10,
      trialStartedAt: new Date(now - 24 * 60 * 60 * 1000),
      trialEndsAt: new Date(now + 7 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
      subscriptionStatus: null,
    } as any)
    const result = await getTrialStatus("b1")
    expect(result.isOnTrial).toBe(true)
    expect(result.minutesUsed).toBe(10)
    expect(result.minutesRemaining).toBe(FREE_TRIAL_MINUTES - 10)
    expect(result.isExhausted).toBe(false)
    expect(result.daysRemaining).toBe(7)
  })

  it("is not on trial when there is no subscription and no trial clock", async () => {
    vi.mocked(db.business.findUnique).mockResolvedValue({
      id: "b0",
      trialMinutesUsed: 0,
      trialStartedAt: null,
      trialEndsAt: null,
      subscriptionStatus: null,
    } as any)
    const result = await getTrialStatus("b0")
    expect(result.isOnTrial).toBe(false)
    expect(result.isExhausted).toBe(false)
    expect(result.isExpired).toBe(false)
  })

  it("marks exhausted when trialMinutesUsed >= FREE_TRIAL_MINUTES", async () => {
    vi.mocked(db.business.findUnique).mockResolvedValue({
      id: "b2",
      trialMinutesUsed: 50,
      trialStartedAt: new Date(),
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
      trialStartedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
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
      trialStartedAt: new Date(),
      trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
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

describe("trialDaysRemaining", () => {
  it("uses floor so just under N days does not round up", () => {
    const now = new Date("2026-01-01T12:00:00Z")
    const ends = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000 - 60 * 60 * 1000)
    expect(trialDaysRemaining(ends, now)).toBe(13)
  })

  it("returns 0 when expired", () => {
    const now = new Date("2026-01-15T12:00:00Z")
    expect(trialDaysRemaining(new Date("2026-01-01T12:00:00Z"), now)).toBe(0)
  })
})

describe("checkTrialEligibility", () => {
  beforeEach(() => {
    vi.mocked(db.business.findUnique).mockReset()
  })

  it("allows allowlisted phone even when another business already uses it", async () => {
    vi.mocked(db.business.findUnique).mockResolvedValue({ id: "existing" } as any)
    const result = await checkTrialEligibility("6086421459")
    expect(result).toEqual({ eligible: true, normalizedPhone: "+16086421459" })
    expect(isMultiTrialPhone("+16086421459")).toBe(true)
  })

  it("blocks non-allowlisted phone when already used", async () => {
    vi.mocked(db.business.findUnique).mockResolvedValue({ id: "existing" } as any)
    const result = await checkTrialEligibility("6085551234")
    expect(result).toEqual({ eligible: false, reason: "phone_already_used_trial" })
  })

  it("allows unused non-allowlisted phone", async () => {
    vi.mocked(db.business.findUnique).mockResolvedValue(null)
    const result = await checkTrialEligibility("6085551234")
    expect(result).toEqual({ eligible: true, normalizedPhone: "+16085551234" })
  })
})
