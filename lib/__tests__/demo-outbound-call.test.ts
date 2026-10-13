import { describe, expect, it } from "vitest"
import {
  buildOutboundDemoSummarySms,
  isOutboundDemoCall,
  resolveDemoResultSmsPhone,
} from "../demo-outbound-call"

describe("resolveDemoResultSmsPhone", () => {
  it("texts the tagged visitor on an outbound demo call", () => {
    expect(
      resolveDemoResultSmsPhone({
        fromNumber: "+12029526890",
        toNumber: "+14155551212",
        metadata: { demo_phone: "+14155551212", source: "demo-landing" },
        demoNumber: "+12029526890",
      })
    ).toBe("+14155551212")
  })

  it("texts to_number when the demo line placed the call and metadata is missing", () => {
    expect(
      resolveDemoResultSmsPhone({
        fromNumber: "+1 (202) 952-6890",
        toNumber: "4155551212",
        metadata: null,
        demoNumber: "+12029526890",
      })
    ).toBe("+14155551212")
  })

  it("texts from_number when the visitor called the demo line", () => {
    expect(
      resolveDemoResultSmsPhone({
        fromNumber: "+14155551212",
        toNumber: "+12029526890",
        metadata: { demo_call: true },
        demoNumber: "+12029526890",
      })
    ).toBe("+14155551212")
  })
})

describe("isOutboundDemoCall", () => {
  it("recognizes the landing-page metadata", () => {
    expect(isOutboundDemoCall({ source: "demo-landing", demo_phone: "+14155551212" })).toBe(true)
    expect(isOutboundDemoCall({ demo_call: true })).toBe(false)
    expect(isOutboundDemoCall(null)).toBe(false)
  })
})

describe("buildOutboundDemoSummarySms", () => {
  it("includes the call summary and a trial link", () => {
    const text = buildOutboundDemoSummarySms("Kitchen sink leak, callback 415-555-1212.")
    expect(text).toContain("CallGrabbr demo summary:")
    expect(text).toContain("Kitchen sink leak")
    expect(text).toContain("14-day free trial")
    expect(text).toContain("https://www.callgrabbr.com/")
  })

  it("uses a fallback when the summary is blank", () => {
    expect(buildOutboundDemoSummarySms("  ")).toContain("Thanks for trying the CallGrabbr demo!")
  })
})
