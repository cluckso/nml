import { describe, it, expect } from "vitest"
import {
  canAnswerSignupInbound,
  isDemoInboundCall,
  metadataDemoFlag,
  resolveDemoInboundResponse,
} from "../inbound-call-routing"

describe("isDemoInboundCall", () => {
  it("matches E.164 demo number regardless of formatting", () => {
    expect(isDemoInboundCall("+12028738983", "+1 (202) 873-8983")).toBe(true)
    expect(isDemoInboundCall("+14159682320", "+14159682320")).toBe(true)
  })

  it("returns false when numbers differ or are missing", () => {
    expect(isDemoInboundCall("+12028738983", "+14159682320")).toBe(false)
    expect(isDemoInboundCall(undefined, "+12028738983")).toBe(false)
    expect(isDemoInboundCall("+12028738983", undefined)).toBe(false)
  })
})

describe("metadataDemoFlag", () => {
  it("detects demo_call metadata", () => {
    expect(metadataDemoFlag({ demo_call: true })).toBe(true)
    expect(metadataDemoFlag({ demo_call: "true" })).toBe(true)
    expect(metadataDemoFlag({ client_id: "x" })).toBe(false)
    expect(metadataDemoFlag(null)).toBe(false)
  })
})

describe("resolveDemoInboundResponse", () => {
  it("returns demo agent override when agent id is configured", () => {
    const response = resolveDemoInboundResponse({
      demoNumberRaw: "+12028738983",
      demoAgentId: "agent_demo123",
    })
    expect(response).toEqual({
      call_inbound: {
        override_agent_id: "agent_demo123",
        metadata: { demo_call: true },
      },
    })
  })

  it("returns null when demo agent id is missing", () => {
    expect(
      resolveDemoInboundResponse({
        demoNumberRaw: "+12028738983",
        demoAgentId: null,
      })
    ).toBeNull()
  })
})

describe("canAnswerSignupInbound", () => {
  it("allows ACTIVE businesses with a resolved agent id", () => {
    expect(
      canAnswerSignupInbound(
        { id: "biz-1", retellAgentId: "agent_abc", status: "ACTIVE" },
        "agent_abc"
      )
    ).toBe(true)
  })

  it("rejects when client or agent id is missing", () => {
    expect(canAnswerSignupInbound(null, "agent_abc")).toBe(false)
    expect(canAnswerSignupInbound({ id: "biz-1" }, null)).toBe(false)
    expect(canAnswerSignupInbound({ id: "biz-1" }, undefined)).toBe(false)
  })
})
