import { describe, it, expect } from "vitest"
import {
  crossedUsageSoftAlertThreshold,
  usageSoftAlertThreshold,
} from "@/lib/usage-soft-alert"

describe("usage soft alert threshold", () => {
  it("uses the shared 80% product threshold", () => {
    expect(usageSoftAlertThreshold()).toBe(0.8)
  })

  it("fires only when crossing 80% for the first time", () => {
    expect(crossedUsageSoftAlertThreshold(70, 85, 100)).toBe(true)
    expect(crossedUsageSoftAlertThreshold(85, 90, 100)).toBe(false)
    expect(crossedUsageSoftAlertThreshold(50, 70, 100)).toBe(false)
    expect(crossedUsageSoftAlertThreshold(79, 80, 100)).toBe(true)
  })
})
