import { describe, expect, it } from "vitest"
import { formatUsPhoneInput, validateUsPhone } from "@/lib/utils"

describe("US phone input formatting", () => {
  it("formats partial numbers as the user types", () => {
    expect(formatUsPhoneInput("608")).toBe("608")
    expect(formatUsPhoneInput("608555")).toBe("(608) 555")
    expect(formatUsPhoneInput("6085551234")).toBe("(608) 555-1234")
  })

  it("formats pasted numbers with country code and punctuation", () => {
    expect(formatUsPhoneInput("+1 (608) 555-1234")).toBe("(608) 555-1234")
  })
})

describe("US phone validation", () => {
  it("returns E.164 for a valid US number", () => {
    expect(validateUsPhone("(608) 555-1234")).toEqual({
      ok: true,
      phone: "+16085551234",
    })
  })

  it("rejects incomplete or non-US-length numbers", () => {
    expect(validateUsPhone("(608) 555-123")).toEqual({
      ok: false,
      error: "Enter a valid 10-digit US phone number.",
    })
    expect(validateUsPhone("26085551234")).toEqual({
      ok: false,
      error: "Enter a valid 10-digit US phone number.",
    })
    expect(validateUsPhone("call me 6085551234").ok).toBe(false)
  })
})
