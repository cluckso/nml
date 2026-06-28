import { describe, it, expect } from "vitest"
import {
  computeRingDurationMs,
  computeRingDurationMsForInbound,
  normalizeCallRouting,
  resolveEffectiveRingDelayProfile,
  DEFAULT_CALL_ROUTING,
  DEFAULT_DURING_HOURS_PROFILE,
  DEFAULT_AFTER_HOURS_PROFILE,
} from "../call-routing"
import type { AvailabilitySettings } from "../business-settings"

describe("normalizeCallRouting", () => {
  it("defaults to answer all when legacy ringBeforeAnswerSeconds is 0", () => {
    const r = normalizeCallRouting({ ringBeforeAnswerSeconds: 0 }, DEFAULT_CALL_ROUTING)
    expect(r.answerAllCalls).toBe(true)
  })

  it("respects schedule profiles", () => {
    const r = normalizeCallRouting(
      {
        scheduleByBusinessHours: true,
        duringHours: { ...DEFAULT_DURING_HOURS_PROFILE, answerAllCalls: false, ringBeforeAnswerSeconds: 15 },
        afterHours: { ...DEFAULT_AFTER_HOURS_PROFILE, answerAllCalls: true },
      },
      DEFAULT_CALL_ROUTING
    )
    expect(r.scheduleByBusinessHours).toBe(true)
    expect(r.duringHours.ringBeforeAnswerSeconds).toBe(15)
    expect(r.afterHours.answerAllCalls).toBe(true)
  })
})

describe("resolveEffectiveRingDelayProfile", () => {
  const availability: AvailabilitySettings = {
    businessHours: {
      open: "09:00",
      close: "17:00",
      days: ["monday", "tuesday", "wednesday", "thursday", "friday"],
    },
    holidayOverrides: [],
    afterHoursBehavior: "take_message",
  }

  it("uses top-level routing when schedule is disabled", () => {
    const routing = normalizeCallRouting({ answerAllCalls: false, ringBeforeAnswerSeconds: 20 })
    const profile = resolveEffectiveRingDelayProfile(routing, availability)
    expect(profile.ringBeforeAnswerSeconds).toBe(20)
  })

  it("uses duringHours profile on weekday midday", () => {
    const routing = normalizeCallRouting({
      scheduleByBusinessHours: true,
      duringHours: { ...DEFAULT_DURING_HOURS_PROFILE, answerAllCalls: false, ringBeforeAnswerSeconds: 15 },
      afterHours: { ...DEFAULT_AFTER_HOURS_PROFILE, answerAllCalls: true },
    })
    const at = new Date("2026-06-29T12:00:00")
    const profile = resolveEffectiveRingDelayProfile(routing, availability, at)
    expect(profile.ringBeforeAnswerSeconds).toBe(15)
    expect(profile.answerAllCalls).toBe(false)
  })

  it("uses afterHours profile on Sunday", () => {
    const routing = normalizeCallRouting({
      scheduleByBusinessHours: true,
      duringHours: { ...DEFAULT_DURING_HOURS_PROFILE, answerAllCalls: false, ringBeforeAnswerSeconds: 15 },
      afterHours: { ...DEFAULT_AFTER_HOURS_PROFILE, answerAllCalls: true },
    })
    const at = new Date("2026-06-28T12:00:00")
    const profile = resolveEffectiveRingDelayProfile(routing, availability, at)
    expect(profile.answerAllCalls).toBe(true)
  })
})

describe("computeRingDurationMs", () => {
  it("returns 0 when answer all is enabled", () => {
    expect(computeRingDurationMs({ ...DEFAULT_CALL_ROUTING, answerAllCalls: true })).toBe(0)
  })

  it("converts seconds to ms", () => {
    expect(
      computeRingDurationMs({
        ...DEFAULT_CALL_ROUTING,
        answerAllCalls: false,
        ringDelayMode: "seconds",
        ringBeforeAnswerSeconds: 15,
      })
    ).toBe(15000)
  })
})

describe("computeRingDurationMsForInbound", () => {
  const availability: AvailabilitySettings = {
    businessHours: {
      open: "09:00",
      close: "17:00",
      days: ["monday", "tuesday", "wednesday", "thursday", "friday"],
    },
    holidayOverrides: [],
    afterHoursBehavior: "take_message",
  }

  it("returns 0 after hours when afterHours answers immediately", () => {
    const routing = normalizeCallRouting({
      scheduleByBusinessHours: true,
      duringHours: { ...DEFAULT_DURING_HOURS_PROFILE, answerAllCalls: false, ringBeforeAnswerSeconds: 10 },
      afterHours: { ...DEFAULT_AFTER_HOURS_PROFILE, answerAllCalls: true },
    })
    const at = new Date("2026-06-28T20:00:00")
    expect(computeRingDurationMsForInbound(routing, availability, at)).toBe(0)
  })
})
