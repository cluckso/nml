import { describe, expect, it } from "vitest"
import {
  buildMetaFunnelUrl,
  buildMetaPrefillValues,
  getMetaIndustryFromParams,
  getMetaSkippedStepIds,
  hasCompleteMetaContact,
  parseMetaLeadPrefill,
  resolveMetaIndustrySlug,
} from "@/lib/meta-lead-routing"

describe("meta-lead-routing", () => {
  it("resolves Meta form labels and aliases to funnel slugs", () => {
    expect(resolveMetaIndustrySlug("HVAC")).toBe("hvac")
    expect(resolveMetaIndustrySlug("Law firm")).toBe("lawyers")
    expect(resolveMetaIndustrySlug("real-estate")).toBe("realtors")
    expect(resolveMetaIndustrySlug("auto repair")).toBe("auto-repair")
    expect(resolveMetaIndustrySlug("Other home or service business")).toBe("handyman")
    expect(resolveMetaIndustrySlug("unknown vertical")).toBeNull()
  })

  it("parses Meta prefill params from search params", () => {
    const prefill = parseMetaLeadPrefill({
      from: "meta",
      name: "Jane Doe",
      email: "jane@acme.com",
      phone: "+1 555 123 4567",
      company: "Acme HVAC",
    })

    expect(prefill).toEqual({
      source: "meta",
      contactName: "Jane Doe",
      contactEmail: "jane@acme.com",
      contactPhone: "+1 555 123 4567",
      businessName: "Acme HVAC",
    })
  })

  it("skips confirm and contact steps when Meta sent full contact info", () => {
    const prefill = parseMetaLeadPrefill({
      from: "meta",
      name: "Jane",
      email: "jane@acme.com",
      phone: "5551234567",
    })!

    expect(hasCompleteMetaContact(prefill)).toBe(true)
    expect(getMetaSkippedStepIds(prefill)).toEqual(["confirm", "contact"])
  })

  it("only skips confirm when contact fields are incomplete", () => {
    const prefill = parseMetaLeadPrefill({ from: "meta", industry: "hvac" })!

    expect(getMetaSkippedStepIds(prefill)).toEqual(["confirm"])
  })

  it("builds funnel URLs and prefill field values", () => {
    const prefill = {
      source: "meta" as const,
      contactName: "Jane",
      contactEmail: "jane@acme.com",
      contactPhone: "5551234567",
      businessName: "Acme",
    }

    expect(buildMetaFunnelUrl("hvac", prefill)).toContain("/funnel/hvac?")
    expect(buildMetaFunnelUrl("hvac", prefill)).toContain("from=meta")
    expect(buildMetaFunnelUrl("hvac", prefill)).toContain("name=Jane")

    const values = buildMetaPrefillValues(prefill, "HVAC")
    expect(values.businessConfirm).toBe("yes")
    expect(values.businessName).toBe("Acme")
    expect(values.contactEmail).toBe("jane@acme.com")
  })

  it("reads industry from common query param names", () => {
    expect(getMetaIndustryFromParams({ industry: "plumbing" })).toBe("plumbing")
    expect(getMetaIndustryFromParams({ business_type: "Roofing" })).toBe("roofing")
  })
})
