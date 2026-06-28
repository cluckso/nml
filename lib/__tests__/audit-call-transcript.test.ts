import { describe, expect, it } from "vitest"
import { auditCallTranscript } from "../audit-call-transcript"

const GOOD_CALL = [
  "Agent: Thanks for calling ABC Plumbing. Who am I speaking with?",
  "User: This is Sarah Miller.",
  "Agent: Got it. What can we help you with today?",
  "User: My kitchen sink is clogged and water is backing up.",
  "Agent: I understand. What's the best number to reach you?",
  "User: 608-555-0142.",
  "Agent: Thanks. So I have Sarah at 608-555-0142 for a clogged kitchen sink. Does that sound right?",
  "User: Yes, that's correct.",
  "Agent: Perfect. Someone from ABC Plumbing will follow up soon. Have a great day.",
].join("\n")

const BAD_DOUBLE_CONFIRM = [
  "Agent: Thanks for calling. Who am I speaking with?",
  "User: Mike Johnson.",
  "Agent: What can we help with?",
  "User: Furnace won't turn on.",
  "Agent: Got it. Best callback number?",
  "User: 608-555-0199.",
  "Agent: So I have Mike at 608-555-0199 for a furnace that won't turn on. Does that sound right?",
  "User: Yes.",
  "Agent: Great. Just to confirm, Mike at 608-555-0199 for the furnace issue. Is that correct?",
  "User: Yes.",
  "Agent: Thanks, someone will follow up.",
].join("\n")

const BAD_MID_CALL_CONFIRM = [
  "Agent: Thanks for calling. What can we help with?",
  "User: Need a quote for a new water heater.",
  "Agent: Let me make sure I have this — you need a quote for a new water heater. Does that sound right?",
  "User: Yes.",
  "Agent: What's your name?",
  "User: Tom Lee.",
  "Agent: And your phone number?",
  "User: 608-555-0100.",
  "Agent: So I have Tom at 608-555-0100 for a water heater quote. Does that sound right?",
  "User: Yes.",
  "Agent: Someone will follow up soon.",
].join("\n")

const BAD_NAME_SPAM = [
  "Agent: Thanks for calling. Who am I speaking with?",
  "User: This is Lisa.",
  "Agent: Hi Lisa, what can we help with?",
  "User: AC not cooling.",
  "Agent: Thanks Lisa. What's your callback number?",
  "User: 608-555-0123.",
  "Agent: Got it Lisa. So Lisa at 608-555-0123 for AC not cooling. Does that sound right Lisa?",
  "User: Yes.",
  "Agent: Thanks Lisa, we'll follow up.",
].join("\n")

const BAD_REPEATED_RECAP = [
  "Agent: What can we help with?",
  "User: Garage door spring broke and the door won't open.",
  "Agent: I understand you have a garage door spring that broke and the door won't open.",
  "User: Yes.",
  "Agent: What's your phone number?",
  "User: 608-555-0188.",
  "Agent: So you have a garage door spring that broke and the door won't open. Best number 608-555-0188. Does that sound right?",
  "User: Yes.",
  "Agent: Someone will follow up about the garage door spring that broke and the door won't open.",
].join("\n")

describe("auditCallTranscript", () => {
  it("passes a clean call with one end-of-call confirmation", () => {
    const result = auditCallTranscript(GOOD_CALL)
    expect(result.ok).toBe(true)
    expect(result.issues).toHaveLength(0)
    expect(result.metrics.confirmationCount).toBe(1)
  })

  it("flags double confirmation at the end", () => {
    const result = auditCallTranscript(BAD_DOUBLE_CONFIRM)
    expect(result.ok).toBe(false)
    expect(result.issues.some((i) => i.code === "excessive_confirmations")).toBe(true)
    expect(result.metrics.confirmationCount).toBeGreaterThan(1)
  })

  it("flags confirmation mid-call and again at the end", () => {
    const result = auditCallTranscript(BAD_MID_CALL_CONFIRM)
    expect(result.issues.some((i) => i.code === "early_confirmation")).toBe(true)
    expect(result.issues.some((i) => i.code === "excessive_confirmations")).toBe(true)
  })

  it("flags excessive use of caller name", () => {
    const result = auditCallTranscript(BAD_NAME_SPAM)
    expect(result.issues.some((i) => i.code === "excessive_name_use")).toBe(true)
    expect(result.metrics.nameMentionCount).toBeGreaterThan(2)
  })

  it("flags repeated recap of the same issue phrasing", () => {
    const result = auditCallTranscript(BAD_REPEATED_RECAP)
    expect(result.issues.some((i) => i.code === "repeated_info")).toBe(true)
  })

  it("returns ok for empty or unlabeled transcripts", () => {
    expect(auditCallTranscript("").ok).toBe(true)
    expect(auditCallTranscript(null).ok).toBe(true)
  })
})
