import { describe, expect, it } from "vitest"
import {
  extractCallerReasonFromTranscript,
  isLikelyPhysicalAddress,
  looksLikeAgentSpeech,
  parseLeadFromSummaryOrTranscript,
  parseTranscriptTurns,
  resolveIssueDescription,
  sanitizeIssueDescription,
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

describe("parseTranscriptTurns", () => {
  it("splits Agent and User labeled lines", () => {
    const turns = parseTranscriptTurns(
      "Agent: Thank you for calling ABC Plumbing.\nUser: My water heater is leaking.\nAgent: Can I get your name?"
    )
    expect(turns).toHaveLength(3)
    expect(turns[0]).toMatchObject({ speaker: "agent" })
    expect(turns[1]).toMatchObject({ speaker: "user", text: "My water heater is leaking." })
  })
})

describe("looksLikeAgentSpeech", () => {
  it("flags agent greetings and prompts", () => {
    expect(looksLikeAgentSpeech("Thank you for calling ABC Plumbing. How can I help you today?")).toBe(true)
    expect(looksLikeAgentSpeech("Can I get your name and address?")).toBe(true)
  })

  it("does not flag caller problem statements", () => {
    expect(looksLikeAgentSpeech("My water heater is leaking in the basement")).toBe(false)
  })
})

describe("extractCallerReasonFromTranscript", () => {
  it("extracts reason from user lines, not agent greeting", () => {
    const transcript = [
      "Agent: Thank you for calling ABC Plumbing. How can I help you today?",
      "User: Hi, my water heater is leaking in the basement.",
      "Agent: I'm sorry to hear that. Can I get your name?",
      "User: John Smith",
    ].join("\n")
    expect(extractCallerReasonFromTranscript(transcript)).toMatch(/water heater is leaking/i)
  })

  it("skips short acknowledgments and name-only user lines", () => {
    const transcript = [
      "Agent: What seems to be the problem?",
      "User: Yes",
      "User: Mike Johnson",
      "User: The AC stopped working yesterday and it's getting hot inside.",
    ].join("\n")
    expect(extractCallerReasonFromTranscript(transcript)).toMatch(/AC stopped working/i)
  })
})

describe("sanitizeIssueDescription", () => {
  it("strips caller narrative prefixes and agent fragments", () => {
    expect(sanitizeIssueDescription("The caller stated that their furnace won't turn on")).toBe(
      "their furnace won't turn on"
    )
    expect(sanitizeIssueDescription("Thank you for calling. How can I help?")).toBeUndefined()
  })

  it("rejects incomplete trailing clauses", () => {
    expect(sanitizeIssueDescription("Water heater leak in the basement and")).toBe(
      "Water heater leak in the basement"
    )
  })
})

describe("resolveIssueDescription", () => {
  it("prefers transcript user speech over agent analysis", () => {
    const reason = resolveIssueDescription({
      fromAnalysis: "Thank you for calling. How can I help you today?",
      transcript: "Agent: Hi there.\nUser: I need a quote for a new furnace install.",
    })
    expect(reason).toMatch(/quote for a new furnace/i)
  })

  it("extracts from summary narrative when transcript is missing", () => {
    const reason = resolveIssueDescription({
      summary: "The customer called about a leaking kitchen sink that started last night.",
    })
    expect(reason).toMatch(/leaking kitchen sink/i)
  })

  it("returns undefined when only agent speech is available", () => {
    expect(
      resolveIssueDescription({
        fromAnalysis: "How can I help you today?",
        transcript: "Agent: Thank you for calling.\nUser: Hi.\nAgent: How can I help?",
      })
    ).toBeUndefined()
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

  it("uses user transcript lines for reason, not agent intro", () => {
    const parsed = parseLeadFromSummaryOrTranscript(
      "Agent: Thanks for calling.\nUser: My garage door spring broke and the door won't open."
    )
    expect(parsed.issue_description).toMatch(/garage door spring broke/i)
    expect(parsed.issue_description).not.toMatch(/thanks for calling/i)
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

  it("drops agent greeting from issue in SMS", () => {
    const bodies = buildLeadSummarySmsBodies(
      {
        name: "Jane Doe",
        phone: "+15551234567",
        issue_description: "Thank you for calling. How can I help you today?",
      },
      {}
    )
    expect(bodies[0]).toContain("Reason for call: —")
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
