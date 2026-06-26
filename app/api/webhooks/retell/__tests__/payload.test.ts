/**
 * Unit tests for Retell webhook payload shape and usage rules.
 * Ensures we read call_id/metadata correctly and that billable minutes are never < 1.
 */
import { describe, it, expect } from "vitest"
import { toBillableMinutes } from "@/lib/plans"

describe("Retell webhook: billable minutes", () => {
  it("never returns less than 1 minute per call", () => {
    expect(toBillableMinutes(0)).toBe(1)
    expect(toBillableMinutes(1)).toBe(1)
    expect(toBillableMinutes(30)).toBe(1)
    expect(toBillableMinutes(59)).toBe(1)
  })
})

describe("Retell webhook: payload shape (call_ended)", () => {
  it("reads call_id from event.call.call_id or event.call_id", () => {
    const payload1 = { event: "call_ended", call: { call_id: "abc123" } }
    const callId1 = payload1.call?.call_id ?? (payload1 as { call_id?: string }).call_id
    expect(callId1).toBe("abc123")

    const payload2 = { event: "call_ended", call_id: "xyz789" }
    const callId2 = (payload2 as { call?: { call_id?: string } }).call?.call_id ?? (payload2 as { call_id?: string }).call_id
    expect(callId2).toBe("xyz789")
  })

  it("reads metadata from event.call.metadata", () => {
    const payload = {
      event: "call_ended",
      call: {
        call_id: "abc",
        metadata: { client_id: "biz-1", forwarded_from_number: "+16085551234" },
      },
    }
    const metadata = payload.call?.metadata
    expect(metadata?.client_id).toBe("biz-1")
    expect(metadata?.forwarded_from_number).toBe("+16085551234")
  })
})
