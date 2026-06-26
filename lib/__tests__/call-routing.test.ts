import { describe, it, expect } from "vitest"
import {
  computeRingDurationMs,
  normalizeCallRouting,
  formatRingDelayLabel,
  ringDurationMsForRetellAgent,
} from "../call-routing"
import { DEFAULT_CALL_ROUTING } from "../call-routing"
import type { CallRoutingSettings } from "../business-settings"

describe("normalizeCallRouting", () => {
  it("defaults to answer all when legacy ringBeforeAnswerSeconds is 0", () => {
    const r = normalizeCallRouting({ ringBeforeAnswerSeconds: 0 }, DEFAULT_CALL_ROUTING)
    expect(r.answerAllCalls).toBe(true)
  })

  it("infers delay mode when legacy seconds > 0", () => {
    const r = normalizeCallRouting({ ringBeforeAnswerSeconds: 15 }, DEFAULT_CALL_ROUTING)
    expect(r.answerAllCalls).toBe(false)
    expect(r.ringBeforeAnswerSeconds).toBe(15)
  })

  it("respects explicit answerAllCalls", () => {
    const r = normalizeCallRouting(
      { answerAllCalls: false, ringDelayMode: "rings", ringBeforeAnswerRings: 3 },
      DEFAULT_CALL_ROUTING
    )
    expect(r.answerAllCalls).toBe(false)
    expect(r.ringDelayMode).toBe("rings")
    expect(r.ringBeforeAnswerRings).toBe(3)
  })
})

describe("computeRingDurationMs", () => {
  const base: CallRoutingSettings = { ...DEFAULT_CALL_ROUTING }

  it("returns 0 when answer all is enabled", () => {
    expect(computeRingDurationMs({ ...base, answerAllCalls: true })).toBe(0)
  })

  it("converts seconds to ms", () => {
    expect(
      computeRingDurationMs({
        ...base,
        answerAllCalls: false,
        ringDelayMode: "seconds",
        ringBeforeAnswerSeconds: 15,
      })
    ).toBe(15000)
  })

  it("converts rings to ms (~5s per ring)", () => {
    expect(
      computeRingDurationMs({
        ...base,
        answerAllCalls: false,
        ringDelayMode: "rings",
        ringBeforeAnswerRings: 4,
      })
    ).toBe(20000)
  })
})

describe("formatRingDelayLabel", () => {
  it("formats answer all", () => {
    expect(
      formatRingDelayLabel({ ...DEFAULT_CALL_ROUTING, answerAllCalls: true })
    ).toBe("Answer immediately")
  })
})

describe("ringDurationMsForRetellAgent", () => {
  it("omits values outside Retell range", () => {
    expect(ringDurationMsForRetellAgent(0)).toBeUndefined()
    expect(ringDurationMsForRetellAgent(5000)).toBe(5000)
    expect(ringDurationMsForRetellAgent(15000)).toBe(15000)
  })
})
