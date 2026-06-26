/** Typical US carrier ring cycle (~5 seconds per ring). */
export const SECONDS_PER_RING = 5

export const RETELL_MIN_RING_MS = 5000
export const RETELL_MAX_RING_MS = 90000

export type RingDelayMode = "seconds" | "rings"

export type RingBeforeAnswerSeconds = 5 | 10 | 15 | 20 | 25 | 30
export type RingBeforeAnswerRings = 1 | 2 | 3 | 4 | 5 | 6

/** Call routing rules */
export interface CallRoutingSettings {
  /** When true, AI answers every forwarded call immediately (no ring delay). */
  answerAllCalls: boolean
  /** Delay unit when answerAllCalls is false. */
  ringDelayMode: RingDelayMode
  /** Seconds before AI answers (when ringDelayMode is "seconds"). Retell min 5s. */
  ringBeforeAnswerSeconds: RingBeforeAnswerSeconds
  /** Number of rings before AI answers (when ringDelayMode is "rings", ~5s per ring). */
  ringBeforeAnswerRings: RingBeforeAnswerRings
  emergencyForward: boolean
  emergencyForwardNumber: string | null
  vipCallerList: string[]
  repeatCallerPriorityTag: boolean
  spamHandling: "block" | "short_response" | "voicemail"
}

export const DEFAULT_CALL_ROUTING: CallRoutingSettings = {
  answerAllCalls: true,
  ringDelayMode: "seconds",
  ringBeforeAnswerSeconds: 10,
  ringBeforeAnswerRings: 4,
  emergencyForward: false,
  emergencyForwardNumber: null,
  vipCallerList: [],
  repeatCallerPriorityTag: false,
  spamHandling: "short_response",
}

const VALID_SECONDS: RingBeforeAnswerSeconds[] = [5, 10, 15, 20, 25, 30]
const VALID_RINGS: RingBeforeAnswerRings[] = [1, 2, 3, 4, 5, 6]

function clampRingMs(ms: number): number {
  if (ms < RETELL_MIN_RING_MS) return RETELL_MIN_RING_MS
  if (ms > RETELL_MAX_RING_MS) return RETELL_MAX_RING_MS
  return ms
}

function coerceSeconds(value: unknown): RingBeforeAnswerSeconds {
  const n = Number(value)
  if (VALID_SECONDS.includes(n as RingBeforeAnswerSeconds)) return n as RingBeforeAnswerSeconds
  if (n === 0) return 10
  return 10
}

function coerceRings(value: unknown): RingBeforeAnswerRings {
  const n = Number(value)
  if (VALID_RINGS.includes(n as RingBeforeAnswerRings)) return n as RingBeforeAnswerRings
  return 4
}

/** Normalize saved/partial call routing (legacy ringBeforeAnswerSeconds=0 supported). */
export function normalizeCallRouting(
  saved: Partial<CallRoutingSettings> | null | undefined,
  defaults: CallRoutingSettings = DEFAULT_CALL_ROUTING
): CallRoutingSettings {
  const merged = { ...defaults, ...(saved ?? {}) }
  const legacySeconds = saved?.ringBeforeAnswerSeconds
  const answerAllCalls =
    saved?.answerAllCalls ??
    (legacySeconds !== undefined ? legacySeconds === 0 : defaults.answerAllCalls)

  return {
    ...merged,
    answerAllCalls,
    ringDelayMode: saved?.ringDelayMode === "rings" ? "rings" : "seconds",
    ringBeforeAnswerSeconds: coerceSeconds(
      saved?.ringBeforeAnswerSeconds ?? defaults.ringBeforeAnswerSeconds
    ),
    ringBeforeAnswerRings: coerceRings(
      saved?.ringBeforeAnswerRings ?? defaults.ringBeforeAnswerRings
    ),
  }
}

/** Retell ring_duration_ms: 0 = answer immediately; otherwise clamped to [5000, 90000]. */
export function computeRingDurationMs(routing: CallRoutingSettings): number {
  if (routing.answerAllCalls) return 0

  if (routing.ringDelayMode === "rings") {
    const rings = coerceRings(routing.ringBeforeAnswerRings)
    return clampRingMs(rings * SECONDS_PER_RING * 1000)
  }

  const seconds = coerceSeconds(routing.ringBeforeAnswerSeconds)
  return clampRingMs(seconds * 1000)
}

export function formatRingDelayLabel(routing: CallRoutingSettings): string {
  if (routing.answerAllCalls) return "Answer immediately"
  if (routing.ringDelayMode === "rings") {
    const rings = coerceRings(routing.ringBeforeAnswerRings)
    const sec = rings * SECONDS_PER_RING
    return `${rings} ring${rings === 1 ? "" : "s"} (~${sec}s)`
  }
  const sec = coerceSeconds(routing.ringBeforeAnswerSeconds)
  return `${sec} seconds`
}

export function ringDurationMsForRetellAgent(ms: number): number | undefined {
  if (ms >= RETELL_MIN_RING_MS && ms <= RETELL_MAX_RING_MS) return Math.round(ms)
  return undefined
}
