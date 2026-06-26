import { describe, expect, it } from "vitest"
import {
  isLikelyPhysicalAddress,
  parseLeadFromSummaryOrTranscript,
} from "../parse-lead-from-transcript"
import { buildLeadSummarySmsBodies } from "../notifications"

describe("isLikelyPhysicalAddress", () => {
  it("accepts numbered street addresses", () => {
    expect(isLikelyPhysicalAddress("123 Oak Lane")).toBe(true)
    expect(isLikelyPhysicalAddress("742 Evergreen Terrace, Springfield")).toBe(true)
  })

  it("rejects reason-like text without a street number", () => {
    expect(isLikelyPhysicalAddress("a leak under the kitchen sink")).toBe(false)
    expect(isLikelyPhysicalAddress("their water heater is broken")).toBe(false)
  })
})

describe("parseLeadFromSummaryOrTranscript", () => {
  it("does not treat conversational 'at' as an address", () => {
    const parsed = parseLeadFromSummaryOrTranscript(
      "John Smith called about a leak at the kitchen sink. Address is 456 Maple Drive."
    )
    expect(parsed.address).toBe("456 Maple Drive")
    expect(parsed.issue_description).toMatch(/leak/i)
  })

  it("allows short reason for call", () => {
    const parsed = parseLeadFromSummaryOrTranscript("Reason for call: AC leak")
    expect(parsed.issue_description).toBe("AC leak")
  })
})

describe("buildLeadSummarySmsBodies", () => {
  it("keeps short summaries in one message", () => {
    const bodies = buildLeadSummarySmsBodies(
      {
        name: "Jane Doe",
        phone: "+15551234567",
        address: "123 Main St",
        issue_description: "AC leak",
      },
      {}
    )
    expect(bodies).toHaveLength(1)
    expect(bodies[0]).toContain("Reason for call: AC leak")
    expect(bodies[0]).toContain("Address: 123 Main St")
  })

  it("splits long summaries into contact and details messages", () => {
    const bodies = buildLeadSummarySmsBodies(
      {
        name: "Jane Doe",
        phone: "+15551234567",
        address: "123 Main Street, Apartment 4B, Springfield, IL 62704",
        issue_description: "A".repeat(400),
        vehicle_year: "2019",
        vehicle_make: "Toyota",
        vehicle_model: "Camry",
        appointment_preference: "Tuesday morning before 10am",
      },
      {}
    )
    expect(bodies.length).toBeGreaterThanOrEqual(2)
    expect(bodies[0]).toContain("Name: Jane Doe")
    expect(bodies[1]).toContain("Reason for call:")
  })
})
