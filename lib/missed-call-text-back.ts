/**
 * Decide whether to send the "incomplete call text-back" SMS to a caller.
 * Retell sends call_ended before call_analyzed — only evaluate after analysis is available.
 */

export interface MissedCallTextBackInput {
  isDemoCall: boolean
  callerPhone?: string | null
  textBackSent: boolean
  notificationSent: boolean
  capacityDeclineSmsSent: boolean
  capacityMode?: string | null
  missedCallRecoveryEnabled: boolean
  hasAnalysis: boolean
  hasInfo: boolean
}

export function shouldSendMissedCallTextBack(input: MissedCallTextBackInput): boolean {
  const {
    isDemoCall,
    callerPhone,
    textBackSent,
    notificationSent,
    capacityDeclineSmsSent,
    capacityMode,
    missedCallRecoveryEnabled,
    hasAnalysis,
    hasInfo,
  } = input

  if (isDemoCall || !callerPhone || textBackSent || notificationSent) return false
  if (capacityDeclineSmsSent || capacityMode === "decline") return false
  if (!missedCallRecoveryEnabled) return false
  if (!hasAnalysis || hasInfo) return false

  return true
}
