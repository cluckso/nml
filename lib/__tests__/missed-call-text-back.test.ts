import { describe, expect, it } from "vitest"
import { shouldSendMissedCallTextBack } from "../missed-call-text-back"

const base = {
  isDemoCall: false,
  callerPhone: "+15551234567",
  textBackSent: false,
  notificationSent: false,
  capacityDeclineSmsSent: false,
  capacityMode: undefined as string | undefined,
  missedCallRecoveryEnabled: true,
  hasAnalysis: true,
  hasInfo: false,
}

describe("shouldSendMissedCallTextBack", () => {
  it("sends when analysis is complete but intake is not", () => {
    expect(shouldSendMissedCallTextBack(base)).toBe(true)
  })

  it("does not send on call_ended before analysis (regression)", () => {
    expect(
      shouldSendMissedCallTextBack({
        ...base,
        hasAnalysis: false,
        hasInfo: false,
      })
    ).toBe(false)
  })

  it("does not send when actionable info was captured", () => {
    expect(
      shouldSendMissedCallTextBack({
        ...base,
        hasInfo: true,
      })
    ).toBe(false)
  })

  it("does not send when lead notification already went out", () => {
    expect(
      shouldSendMissedCallTextBack({
        ...base,
        notificationSent: true,
      })
    ).toBe(false)
  })

  it("does not send when text-back was already sent", () => {
    expect(
      shouldSendMissedCallTextBack({
        ...base,
        textBackSent: true,
      })
    ).toBe(false)
  })

  it("does not send for demo calls", () => {
    expect(
      shouldSendMissedCallTextBack({
        ...base,
        isDemoCall: true,
      })
    ).toBe(false)
  })

  it("does not send when capacity decline SMS was sent", () => {
    expect(
      shouldSendMissedCallTextBack({
        ...base,
        capacityDeclineSmsSent: true,
      })
    ).toBe(false)
  })

  it("does not send when feature is disabled", () => {
    expect(
      shouldSendMissedCallTextBack({
        ...base,
        missedCallRecoveryEnabled: false,
      })
    ).toBe(false)
  })
})
