import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import {
  DEFAULT_FUNNEL_HIGH_SCORE_THRESHOLD,
  getFunnelHighScoreThreshold,
  isHighScoreFunnelLead,
} from "../lead-notifications"

describe("funnel high-score threshold", () => {
  const original = process.env.FUNNEL_LEAD_HIGH_SCORE_THRESHOLD

  afterEach(() => {
    if (original === undefined) delete process.env.FUNNEL_LEAD_HIGH_SCORE_THRESHOLD
    else process.env.FUNNEL_LEAD_HIGH_SCORE_THRESHOLD = original
  })

  it("defaults to 60", () => {
    delete process.env.FUNNEL_LEAD_HIGH_SCORE_THRESHOLD
    expect(getFunnelHighScoreThreshold()).toBe(DEFAULT_FUNNEL_HIGH_SCORE_THRESHOLD)
  })

  it("reads env override", () => {
    process.env.FUNNEL_LEAD_HIGH_SCORE_THRESHOLD = "70"
    expect(getFunnelHighScoreThreshold()).toBe(70)
  })

  it("classifies high-score leads", () => {
    expect(isHighScoreFunnelLead(59)).toBe(false)
    expect(isHighScoreFunnelLead(60)).toBe(true)
    expect(isHighScoreFunnelLead(85)).toBe(true)
  })
})

describe("notifyHighScoreFunnelLead", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("skips low-score leads", async () => {
    const { notifyHighScoreFunnelLead } = await import("../lead-notifications")
    const result = await notifyHighScoreFunnelLead({
      leadId: "x",
      industry: "hvac",
      score: 30,
      responses: {},
    })
    expect(result.skipped).toBe(true)
    expect(result.emailSent).toBe(false)
    expect(result.webhookSent).toBe(false)
  })
})
