import { describe, it, expect } from "vitest"
import { isWithinBusinessHours } from "../business-hours"
import type { AvailabilitySettings } from "../business-settings"

const TZ = "America/Chicago"

const baseAvailability: AvailabilitySettings = {
  timezone: TZ,
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
    // Mon Jun 29 2026 14:30 CDT
    const at = new Date("2026-06-29T19:30:00.000Z")
    expect(isWithinBusinessHours(baseAvailability, at)).toBe(true)
  })

  it("returns false before open", () => {
    // Mon Jun 29 2026 08:30 CDT
    const at = new Date("2026-06-29T13:30:00.000Z")
    expect(isWithinBusinessHours(baseAvailability, at)).toBe(false)
  })

  it("returns false on weekends", () => {
    // Sun Jun 28 2026 12:00 CDT
    const at = new Date("2026-06-28T17:00:00.000Z")
    expect(isWithinBusinessHours(baseAvailability, at)).toBe(false)
  })

  it("returns false on configured holidays", () => {
    // Sat Jul 4 2026 12:00 CDT
    const at = new Date("2026-07-04T17:00:00.000Z")
    const availability: AvailabilitySettings = {
      ...baseAvailability,
      holidayOverrides: [{ date: "2026-07-04", closed: true }],
    }
    expect(isWithinBusinessHours(availability, at)).toBe(false)
  })

  it("uses business timezone not server local time", () => {
    const availability: AvailabilitySettings = {
      ...baseAvailability,
      timezone: "America/Los_Angeles",
      businessHours: { open: "09:00", close: "17:00", days: ["monday"] },
    }
    // Mon Jun 29 2026 10:00 Pacific = 17:00 UTC (inside hours in LA)
    const inside = new Date("2026-06-29T17:00:00.000Z")
    expect(isWithinBusinessHours(availability, inside)).toBe(true)
    // Same instant is 12:00 Central — still inside if we wrongly used Chicago, but Monday OK;
    // 08:00 Pacific Mon = 15:00 UTC — before open in LA
    const beforeOpenPacific = new Date("2026-06-29T15:00:00.000Z")
    expect(isWithinBusinessHours(availability, beforeOpenPacific)).toBe(false)
  })
})
