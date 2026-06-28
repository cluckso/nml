import { isWithinBusinessHours } from "./business-hours"
import type { AvailabilitySettings } from "./business-settings"

/** Typical US carrier ring cycle (~5 seconds per ring). */
export const SECONDS_PER_RING = 5

export const RETELL_MIN_RING_MS = 5000
export const RETELL_MAX_RING_MS = 90000

export type RingDelayMode = "seconds" | "rings"

export type RingBeforeAnswerSeconds = 5 | 10 | 15 | 20 | 25 | 30
export type RingBeforeAnswerRings = 1 | 2 | 3 | 4 | 5 | 6

/** Ring delay profile — used for default routing and per-schedule windows. */
export interface RingDelayProfile {
  answerAllCalls: boolean
  ringDelayMode: RingDelayMode
  ringBeforeAnswerSeconds: RingBeforeAnswerSeconds
  ringBeforeAnswerRings: RingBeforeAnswerRings
}

/** Call routing rules */
export interface CallRoutingSettings extends RingDelayProfile {
  /** When true, use duringHours / afterHours based on business hours. */
  scheduleByBusinessHours: boolean
  /** Applied during configured business hours when scheduleByBusinessHours is true. */
  duringHours: RingDelayProfile
  /** Applied outside business hours when scheduleByBusinessHours is true. */
  afterHours: RingDelayProfile
  emergencyForward: boolean
  emergencyForwardNumber: string | null
  vipCallerList: string[]
  repeatCallerPriorityTag: boolean
  spamHandling: "block" | "short_response" | "voicemail"
}

export const DEFAULT_DURING_HOURS_PROFILE: RingDelayProfile = {
  answerAllCalls: false,
  ringDelayMode: "seconds",
  ringBeforeAnswerSeconds: 10,
  ringBeforeAnswerRings: 4,
}

export const DEFAULT_AFTER_HOURS_PROFILE: RingDelayProfile = {
  answerAllCalls: true,
  ringDelayMode: "seconds",
  ringBeforeAnswerSeconds: 10,
  ringBeforeAnswerRings: 4,
}

export const DEFAULT_CALL_ROUTING: CallRoutingSettings = {
  answerAllCalls: true,
  ringDelayMode: "seconds",
  ringBeforeAnswerSeconds: 10,
  ringBeforeAnswerRings: 4,
  scheduleByBusinessHours: false,
  duringHours: { ...DEFAULT_DURING_HOURS_PROFILE },
  afterHours: { ...DEFAULT_AFTER_HOURS_PROFILE },
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

function normalizeRingDelayProfile(
  saved: (Partial<RingDelayProfile> & { ringBeforeAnswerSeconds?: number }) | null | undefined,
  defaults: RingDelayProfile
): RingDelayProfile {
  const legacySeconds = saved?.ringBeforeAnswerSeconds as number | undefined
  const answerAllCalls =
    saved?.answerAllCalls ??
    (legacySeconds !== undefined ? legacySeconds === 0 : defaults.answerAllCalls)

  return {
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

/** Normalize saved/partial call routing (legacy ringBeforeAnswerSeconds=0 supported). */
export function normalizeCallRouting(
  saved: Partial<CallRoutingSettings> | null | undefined,
  defaults: CallRoutingSettings = DEFAULT_CALL_ROUTING
): CallRoutingSettings {
  const merged = { ...defaults, ...(saved ?? {}) }
  const baseProfile = normalizeRingDelayProfile(saved, defaults)

  return {
    ...merged,
    ...baseProfile,
    scheduleByBusinessHours: saved?.scheduleByBusinessHours === true,
    duringHours: normalizeRingDelayProfile(
      saved?.duringHours ?? baseProfile,
      defaults.duringHours
    ),
    afterHours: normalizeRingDelayProfile(saved?.afterHours, defaults.afterHours),
  }
}

/** Pick the ring-delay profile that applies right now. */
export function resolveEffectiveRingDelayProfile(
  routing: CallRoutingSettings,
  availability: AvailabilitySettings,
  at: Date = new Date()
): RingDelayProfile {
  if (!routing.scheduleByBusinessHours) {
    return {
      answerAllCalls: routing.answerAllCalls,
      ringDelayMode: routing.ringDelayMode,
      ringBeforeAnswerSeconds: routing.ringBeforeAnswerSeconds,
      ringBeforeAnswerRings: routing.ringBeforeAnswerRings,
    }
  }

  return isWithinBusinessHours(availability, at) ? routing.duringHours : routing.afterHours
}

/** Retell ring_duration_ms: 0 = answer immediately; otherwise clamped to [5000, 90000]. */
export function computeRingDurationMs(profile: RingDelayProfile): number {
  if (profile.answerAllCalls) return 0

  if (profile.ringDelayMode === "rings") {
    const rings = coerceRings(profile.ringBeforeAnswerRings)
    return clampRingMs(rings * SECONDS_PER_RING * 1000)
  }

  const seconds = coerceSeconds(profile.ringBeforeAnswerSeconds)
  return clampRingMs(seconds * 1000)
}

export function computeRingDurationMsForInbound(
  routing: CallRoutingSettings,
  availability: AvailabilitySettings,
  at: Date = new Date()
): number {
  return computeRingDurationMs(resolveEffectiveRingDelayProfile(routing, availability, at))
}

export function formatRingDelayLabel(profile: RingDelayProfile): string {
  if (profile.answerAllCalls) return "Answer immediately"
  if (profile.ringDelayMode === "rings") {
    const rings = coerceRings(profile.ringBeforeAnswerRings)
    const sec = rings * SECONDS_PER_RING
    return `${rings} ring${rings === 1 ? "" : "s"} (~${sec}s)`
  }
  const sec = coerceSeconds(profile.ringBeforeAnswerSeconds)
  return `${sec} seconds`
}

export function formatScheduledRingDelaySummary(routing: CallRoutingSettings): string {
  if (!routing.scheduleByBusinessHours) return formatRingDelayLabel(routing)
  return `During hours: ${formatRingDelayLabel(routing.duringHours)} · After hours: ${formatRingDelayLabel(routing.afterHours)}`
}

export function ringDurationMsForRetellAgent(ms: number): number | undefined {
  if (ms >= RETELL_MIN_RING_MS && ms <= RETELL_MAX_RING_MS) return Math.round(ms)
  return undefined
}
