import { describe, it, expect } from "vitest"
import {
  toBillableMinutes,
  getIncludedMinutes,
  getOverageMinutes,
  FREE_TRIAL_MINUTES,
  MAX_CALL_DURATION_SECONDS,
} from "./plans"
import { PlanType } from "@prisma/client"

describe("toBillableMinutes", () => {
  it("returns 1 minute for 0 seconds (minimum per call)", () => {
    expect(toBillableMinutes(0)).toBe(1)
  })

  it("returns 1 minute for 1 second", () => {
    expect(toBillableMinutes(1)).toBe(1)
  })

  it("returns 1 minute for 59 seconds", () => {
    expect(toBillableMinutes(59)).toBe(1)
  })

  it("returns 1 minute for 60 seconds", () => {
    expect(toBillableMinutes(60)).toBe(1)
  })

  it("returns 2 minutes for 61 seconds", () => {
    expect(toBillableMinutes(61)).toBe(2)
  })

  it("returns 2 minutes for 120 seconds", () => {
    expect(toBillableMinutes(120)).toBe(2)
  })

  it("returns 5 minutes for 300 seconds", () => {
    expect(toBillableMinutes(300)).toBe(5)
  })

  it("rounds up partial minutes", () => {
    expect(toBillableMinutes(90)).toBe(2)   // 1.5 → 2
    expect(toBillableMinutes(150)).toBe(3) // 2.5 → 3
  })

  it("clamps duration to MAX_CALL_DURATION_SECONDS", () => {
    const overMax = MAX_CALL_DURATION_SECONDS + 3600
    const expectedMinutes = Math.ceil(MAX_CALL_DURATION_SECONDS / 60)
    expect(toBillableMinutes(overMax)).toBe(expectedMinutes)
  })

  it("handles negative as 0 then 1 min", () => {
    expect(toBillableMinutes(-100)).toBe(1)
  })
})

describe("getIncludedMinutes", () => {
  it("returns plan included minutes", () => {
    expect(getIncludedMinutes(PlanType.STARTER)).toBe(300)
    expect(getIncludedMinutes(PlanType.PRO)).toBe(900)
    expect(getIncludedMinutes(PlanType.LOCAL_PLUS)).toBe(1800)
  })
})

describe("getOverageMinutes", () => {
  it("returns 0 when used <= included", () => {
    expect(getOverageMinutes(PlanType.STARTER, 0)).toBe(0)
    expect(getOverageMinutes(PlanType.STARTER, 300)).toBe(0)
    expect(getOverageMinutes(PlanType.PRO, 900)).toBe(0)
  })

  it("returns used - included when over", () => {
    expect(getOverageMinutes(PlanType.STARTER, 400)).toBe(100)
    expect(getOverageMinutes(PlanType.PRO, 1000)).toBe(100)
  })
})

describe("FREE_TRIAL_MINUTES", () => {
  it("is 50", () => {
    expect(FREE_TRIAL_MINUTES).toBe(50)
  })
})
