import { describe, it, expect } from "vitest"
import { normalizeBusinessTimezone, getZonedWallClock, DEFAULT_BUSINESS_TIMEZONE } from "../business-timezone"

describe("normalizeBusinessTimezone", () => {
  it("returns default for empty values", () => {
    expect(normalizeBusinessTimezone(null)).toBe(DEFAULT_BUSINESS_TIMEZONE)
    expect(normalizeBusinessTimezone("")).toBe(DEFAULT_BUSINESS_TIMEZONE)
  })

  it("accepts curated and valid IANA zones", () => {
    expect(normalizeBusinessTimezone("America/New_York")).toBe("America/New_York")
    expect(normalizeBusinessTimezone("Europe/London")).toBe("Europe/London")
  })

  it("falls back for invalid zones", () => {
    expect(normalizeBusinessTimezone("Not/A_Zone")).toBe(DEFAULT_BUSINESS_TIMEZONE)
  })
})

describe("getZonedWallClock", () => {
  it("formats wall clock in the given timezone", () => {
    const clock = getZonedWallClock(new Date("2026-06-29T19:30:00.000Z"), "America/Chicago")
    expect(clock.dayName).toBe("monday")
    expect(clock.dateKey).toBe("2026-06-29")
    expect(clock.minutesSinceMidnight).toBe(14 * 60 + 30)
  })
})
