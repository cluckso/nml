import { describe, expect, it } from "vitest"
import { calculateLeadScore, scoreFromFieldOptions } from "../lead-scoring"

describe("calculateLeadScore", () => {
  const weights = {
    callVolume: { "20-50": 25, "100-plus": 50 },
    biggestPain: { "no-callback": 25 },
  }

  it("sums weights for matching responses", () => {
    const score = calculateLeadScore(
      { callVolume: "20-50", biggestPain: "no-callback", other: "ignored" },
      weights
    )
    expect(score).toBe(50)
  })

  it("returns 0 when no weights provided", () => {
    expect(calculateLeadScore({ callVolume: "20-50" })).toBe(0)
  })

  it("ignores unknown field values", () => {
    expect(calculateLeadScore({ callVolume: "unknown" }, weights)).toBe(0)
  })
})

describe("scoreFromFieldOptions", () => {
  it("scores from inline option score values", () => {
    const steps = [
      {
        fields: [
          {
            id: "callVolume",
            options: [
              { value: "20-50", score: 25 },
              { value: "100-plus", score: 50 },
            ],
          },
        ],
      },
    ]

    expect(scoreFromFieldOptions({ callVolume: "100-plus" }, steps)).toBe(50)
  })
})
