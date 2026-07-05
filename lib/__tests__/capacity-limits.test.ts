import { describe, it, expect } from "vitest"
import { DEFAULT_SETTINGS } from "../business-settings"
import { resolveCapacityGreeting, getCapacityDateLabel } from "../capacity-limits"

describe("resolveCapacityGreeting", () => {
  const capacity = DEFAULT_SETTINGS.capacity

  it("replaces [business] in high-volume greeting", () => {
    const greeting = resolveCapacityGreeting(capacity, "Acme HVAC", "intake_only")
    expect(greeting).toContain("Acme HVAC")
    expect(greeting).not.toContain("[business]")
  })

  it("uses decline greeting in decline mode", () => {
    const greeting = resolveCapacityGreeting(capacity, "Acme HVAC", "decline")
    expect(greeting.toLowerCase()).toContain("capacity")
  })
})

describe("getCapacityDateLabel", () => {
  it("returns YYYY-MM-DD in business timezone", () => {
    const label = getCapacityDateLabel(
      new Date("2026-07-01T12:00:00.000Z"),
      { ...DEFAULT_SETTINGS.availability, timezone: "America/Chicago" }
    )
    expect(label).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})
