import { describe, expect, it } from "vitest"
import { formatBlogDate } from "@/lib/blog-date"

describe("formatBlogDate", () => {
  it("formats Date instances and serialized date strings", () => {
    expect(formatBlogDate(new Date("2026-10-27T12:00:00.000Z"))).toBe("Oct 27, 2026")
    expect(formatBlogDate("2026-10-27T12:00:00.000Z")).toBe("Oct 27, 2026")
  })

  it("supports long month names for article pages", () => {
    expect(formatBlogDate("2026-10-27T12:00:00.000Z", "long")).toBe("October 27, 2026")
  })

  it("omits missing and invalid dates", () => {
    expect(formatBlogDate(null)).toBeNull()
    expect(formatBlogDate(undefined)).toBeNull()
    expect(formatBlogDate("not-a-date")).toBeNull()
  })
})
