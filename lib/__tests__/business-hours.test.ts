import { describe, it, expect } from "vitest"
import { isWithinBusinessHours } from "../business-hours"
import type { AvailabilitySettings } from "../business-settings"

const baseAvailability: AvailabilitySettings = {
  businessHours: {
    open: "09:00",
    close: "17:00",
    days: ["monday", "tuesday", "wednesday", "thursday", "friday"],
  },
  holidayOverrides: [],
  afterHoursBehavior: "take_message",
}

describe("isWithinBusinessHours", () => {
  it("returns true on a weekday inside open hours", () => {
    const at = new Date("2026-06-29T14:30:00") // Monday
    expect(isWithinBusinessHours(baseAvailability, at)).toBe(true)
  })

  it("returns false before open", () => {
    const at = new Date("2026-06-29T08:30:00")
    expect(isWithinBusinessHours(baseAvailability, at)).toBe(false)
  })

  it("returns false on weekends", () => {
    const at = new Date("2026-06-28T12:00:00") // Sunday
    expect(isWithinBusinessHours(baseAvailability, at)).toBe(false)
  })

  it("returns false on configured holidays", () => {
    const at = new Date("2026-07-04T12:00:00")
    const availability: AvailabilitySettings = {
      ...baseAvailability,
      holidayOverrides: [{ date: "2026-07-04", closed: true }],
    }
    expect(isWithinBusinessHours(availability, at)).toBe(false)
  })
})
