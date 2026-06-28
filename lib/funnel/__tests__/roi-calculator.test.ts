import { describe, expect, it } from "vitest"
import { calculateFunnelRoi, DEFAULT_CAPTURE_RATE } from "../roi-calculator"

describe("calculateFunnelRoi", () => {
  it("computes missed and recovered revenue from inputs", () => {
    const result = calculateFunnelRoi({
      callsPerWeek: 40,
      averageSale: 400,
      missedCallRate: 0.25,
      captureRate: 0.85,
    })

    expect(result.missedCallsPerWeek).toBe(10)
    expect(result.missedRevenuePerMonth).toBeCloseTo(10 * 4.33 * 400, 0)
    expect(result.recoveredRevenuePerMonth).toBeCloseTo(result.missedRevenuePerMonth * 0.85, 0)
    expect(result.annualRecovered).toBeCloseTo(result.recoveredRevenuePerMonth * 12, 0)
  })

  it("uses default capture rate when omitted", () => {
    const result = calculateFunnelRoi({
      callsPerWeek: 20,
      averageSale: 500,
      missedCallRate: 0.3,
    })

    expect(result.recoveredRevenuePerMonth).toBeCloseTo(
      result.missedRevenuePerMonth * DEFAULT_CAPTURE_RATE,
      0
    )
  })

  it("returns zero revenue when no calls are missed", () => {
    const result = calculateFunnelRoi({
      callsPerWeek: 50,
      averageSale: 1000,
      missedCallRate: 0,
    })

    expect(result.missedCallsPerWeek).toBe(0)
    expect(result.missedRevenuePerMonth).toBe(0)
    expect(result.recoveredRevenuePerMonth).toBe(0)
  })
})
