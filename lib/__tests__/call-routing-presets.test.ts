import { describe, it, expect } from "vitest"
import {
  applyCallRoutingPreset,
  detectCallRoutingPreset,
  describeCallRoutingBehavior,
} from "../call-routing-presets"
import { DEFAULT_CALL_ROUTING } from "../call-routing"

describe("applyCallRoutingPreset", () => {
  it("applies daytime delay preset", () => {
    const r = applyCallRoutingPreset("daytime-delay", DEFAULT_CALL_ROUTING)
    expect(r.scheduleByBusinessHours).toBe(true)
    expect(r.duringHours.answerAllCalls).toBe(false)
    expect(r.duringHours.ringBeforeAnswerSeconds).toBe(10)
    expect(r.afterHours.answerAllCalls).toBe(true)
  })

  it("applies always-delay preset", () => {
    const r = applyCallRoutingPreset("always-delay", DEFAULT_CALL_ROUTING)
    expect(r.scheduleByBusinessHours).toBe(false)
    expect(r.answerAllCalls).toBe(false)
    expect(r.ringBeforeAnswerSeconds).toBe(10)
  })

  it("applies always-answer preset", () => {
    const r = applyCallRoutingPreset("always-answer", DEFAULT_CALL_ROUTING)
    expect(r.scheduleByBusinessHours).toBe(false)
    expect(r.answerAllCalls).toBe(true)
  })

  it("preserves emergency and spam settings", () => {
    const current = {
      ...DEFAULT_CALL_ROUTING,
      emergencyForward: true,
      emergencyForwardNumber: "+15551234567",
      spamHandling: "block" as const,
    }
    const r = applyCallRoutingPreset("daytime-delay", current)
    expect(r.emergencyForward).toBe(true)
    expect(r.emergencyForwardNumber).toBe("+15551234567")
    expect(r.spamHandling).toBe("block")
  })
})

describe("detectCallRoutingPreset", () => {
  it("detects applied presets", () => {
    expect(detectCallRoutingPreset(applyCallRoutingPreset("daytime-delay", DEFAULT_CALL_ROUTING))).toBe(
      "daytime-delay"
    )
    expect(detectCallRoutingPreset(applyCallRoutingPreset("always-delay", DEFAULT_CALL_ROUTING))).toBe(
      "always-delay"
    )
    expect(detectCallRoutingPreset(applyCallRoutingPreset("always-answer", DEFAULT_CALL_ROUTING))).toBe(
      "always-answer"
    )
  })

  it("returns custom for non-preset configs", () => {
    const custom = applyCallRoutingPreset("always-delay", DEFAULT_CALL_ROUTING)
    custom.ringBeforeAnswerSeconds = 15
    expect(detectCallRoutingPreset(custom)).toBe("custom")
  })
})

describe("describeCallRoutingBehavior", () => {
  it("returns preset summary when matched", () => {
    const r = applyCallRoutingPreset("daytime-delay", DEFAULT_CALL_ROUTING)
    expect(describeCallRoutingBehavior(r)).toMatch(/open days/i)
  })
})
