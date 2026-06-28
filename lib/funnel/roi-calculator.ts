/** ROI math for funnel missed-call revenue estimates. */

export const DEFAULT_CAPTURE_RATE = 0.85

export interface FunnelRoiInput {
  callsPerWeek: number
  averageSale: number
  missedCallRate: number
  captureRate?: number
}

export interface FunnelRoiResult {
  missedCallsPerWeek: number
  missedRevenuePerMonth: number
  recoveredRevenuePerMonth: number
  annualRecovered: number
}

export function calculateFunnelRoi(input: FunnelRoiInput): FunnelRoiResult {
  const captureRate = input.captureRate ?? DEFAULT_CAPTURE_RATE
  const missedCallsPerWeek = input.callsPerWeek * input.missedCallRate
  const missedRevenuePerMonth = missedCallsPerWeek * 4.33 * input.averageSale
  const recoveredRevenuePerMonth = missedRevenuePerMonth * captureRate
  const annualRecovered = recoveredRevenuePerMonth * 12

  return {
    missedCallsPerWeek,
    missedRevenuePerMonth,
    recoveredRevenuePerMonth,
    annualRecovered,
  }
}
