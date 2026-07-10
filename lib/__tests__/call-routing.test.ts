import { describe, it, expect } from "vitest"
import {
  computeRingDurationMs,
  computeRingDurationMsForInbound,
  normalizeCallRouting,
  planInboundRingDelay,
  resolveEffectiveRingDelayProfile,
  DEFAULT_CALL_ROUTING,
  DEFAULT_DURING_HOURS_PROFILE,
  DEFAULT_AFTER_HOURS_PROFILE,
} from "../call-routing"
import type { AvailabilitySettings } from "../business-settings"

describe("normalizeCallRouting", () => {
  it("defaults to answer all when legacy ringBeforeAnswerSeconds is 0", () => {
    const r = normalizeCallRouting(
      { ringBeforeAnswerSeconds: 0 } as unknown as Parameters<typeof normalizeCallRouting>[0],
      DEFAULT_CALL_ROUTING
    )
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
    timezone: "America/Chicago",
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
    const at = new Date("2026-06-29T17:00:00.000Z")
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
    const at = new Date("2026-06-28T17:00:00.000Z")
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
    timezone: "America/Chicago",
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
    const at = new Date("2026-06-29T02:00:00.000Z")
    expect(computeRingDurationMsForInbound(routing, availability, at)).toBe(0)
  })
})

describe("planInboundRingDelay", () => {
  it("uses webhook sleep only for delays that fit within the Retell webhook timeout", () => {
    expect(planInboundRingDelay(5_000)).toEqual({
      webhookSleepMs: 5_000,
      retellRingDurationMs: undefined,
    })
    expect(planInboundRingDelay(10_000)).toEqual({
      webhookSleepMs: 9_200,
      retellRingDurationMs: undefined,
    })
  })

  it("returns no delay when answer immediately", () => {
    expect(planInboundRingDelay(0)).toEqual({
      webhookSleepMs: 0,
      retellRingDurationMs: undefined,
    })
  })

  it("splits long delays between webhook sleep and Retell ring_duration_ms", () => {
    const plan = planInboundRingDelay(30_000)
    expect(plan.webhookSleepMs).toBe(9200)
    expect(plan.retellRingDurationMs).toBe(20_800)
  })
})
