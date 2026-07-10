import type { CallRoutingSettings, RingDelayProfile } from "./call-routing"
import { formatScheduledRingDelaySummary, formatRingDelayLabel } from "./call-routing"

export type CallRoutingPresetId = "daytime-delay" | "always-delay" | "always-answer" | "custom"

export type CallRoutingPreset = {
  id: Exclude<CallRoutingPresetId, "custom">
  title: string
  summary: string
  detail: string
  recommended?: boolean
}

const TEN_SECOND_DELAY: RingDelayProfile = {
  answerAllCalls: false,
  ringDelayMode: "seconds",
  ringBeforeAnswerSeconds: 10,
  ringBeforeAnswerRings: 4,
}

const ANSWER_IMMEDIATELY: RingDelayProfile = {
  answerAllCalls: true,
  ringDelayMode: "seconds",
  ringBeforeAnswerSeconds: 10,
  ringBeforeAnswerRings: 4,
}

export const CALL_ROUTING_PRESETS: CallRoutingPreset[] = [
  {
    id: "daytime-delay",
    title: "Ring 10s during business hours",
    summary: "You get a chance to answer first on open days; assistant picks up right away after hours.",
    detail: "Best for owners who want to catch daytime calls themselves but never miss after-hours emergencies.",
    recommended: true,
  },
  {
    id: "always-delay",
    title: "Ring 10s on every call",
    summary: "Same 10-second delay around the clock before your assistant answers.",
    detail: "Use when you want a consistent window to pick up, any time of day.",
  },
  {
    id: "always-answer",
    title: "Answer every call immediately",
    summary: "Your assistant picks up as soon as the call reaches CallGrabbr — no ring delay.",
    detail: "Use when you always want maximum coverage and are not trying to answer the line yourself first.",
  },
]

function profilesMatch(a: RingDelayProfile, b: RingDelayProfile): boolean {
  if (a.answerAllCalls !== b.answerAllCalls) return false
  if (a.answerAllCalls) return true
  return (
    a.ringDelayMode === b.ringDelayMode &&
    a.ringBeforeAnswerSeconds === b.ringBeforeAnswerSeconds &&
    a.ringBeforeAnswerRings === b.ringBeforeAnswerRings
  )
}

/** Detect whether current routing matches a quick-setup preset (else custom). */
export function detectCallRoutingPreset(routing: CallRoutingSettings): CallRoutingPresetId {
  if (
    routing.scheduleByBusinessHours &&
    profilesMatch(routing.duringHours, TEN_SECOND_DELAY) &&
    profilesMatch(routing.afterHours, ANSWER_IMMEDIATELY)
  ) {
    return "daytime-delay"
  }

  if (
    !routing.scheduleByBusinessHours &&
    profilesMatch(routing, TEN_SECOND_DELAY) &&
    profilesMatch(routing.duringHours, TEN_SECOND_DELAY) &&
    profilesMatch(routing.afterHours, TEN_SECOND_DELAY)
  ) {
    return "always-delay"
  }

  if (
    !routing.scheduleByBusinessHours &&
    profilesMatch(routing, ANSWER_IMMEDIATELY) &&
    profilesMatch(routing.duringHours, ANSWER_IMMEDIATELY) &&
    profilesMatch(routing.afterHours, ANSWER_IMMEDIATELY)
  ) {
    return "always-answer"
  }

  return "custom"
}

/** Apply a quick-setup preset; preserves emergency/spam/vip settings on the routing object. */
export function applyCallRoutingPreset(
  presetId: Exclude<CallRoutingPresetId, "custom">,
  current: CallRoutingSettings
): CallRoutingSettings {
  const base = { ...current }

  switch (presetId) {
    case "daytime-delay":
      return {
        ...base,
        scheduleByBusinessHours: true,
        answerAllCalls: false,
        ringDelayMode: "seconds",
        ringBeforeAnswerSeconds: 10,
        ringBeforeAnswerRings: 4,
        duringHours: { ...TEN_SECOND_DELAY },
        afterHours: { ...ANSWER_IMMEDIATELY },
      }
    case "always-delay":
      return {
        ...base,
        scheduleByBusinessHours: false,
        answerAllCalls: false,
        ringDelayMode: "seconds",
        ringBeforeAnswerSeconds: 10,
        ringBeforeAnswerRings: 4,
        duringHours: { ...TEN_SECOND_DELAY },
        afterHours: { ...TEN_SECOND_DELAY },
      }
    case "always-answer":
      return {
        ...base,
        scheduleByBusinessHours: false,
        answerAllCalls: true,
        ringDelayMode: "seconds",
        ringBeforeAnswerSeconds: 10,
        ringBeforeAnswerRings: 4,
        duringHours: { ...ANSWER_IMMEDIATELY },
        afterHours: { ...ANSWER_IMMEDIATELY },
      }
  }
}

/** Plain-language summary of how calls are handled right now. */
export function describeCallRoutingBehavior(routing: CallRoutingSettings): string {
  const preset = detectCallRoutingPreset(routing)
  const presetMeta = CALL_ROUTING_PRESETS.find((p) => p.id === preset)
  if (presetMeta) return presetMeta.summary
  return formatScheduledRingDelaySummary(routing)
}

export function describeCallRoutingBehaviorDetail(routing: CallRoutingSettings): string {
  if (!routing.scheduleByBusinessHours) {
    if (routing.answerAllCalls) {
      return "Every forwarded call is answered by your assistant right away."
    }
    return `Every forwarded call rings for ${formatRingDelayLabel(routing).toLowerCase()} before your assistant answers.`
  }
  return `During your business hours: ${formatRingDelayLabel(routing.duringHours).toLowerCase()}. After hours and closed days: ${formatRingDelayLabel(routing.afterHours).toLowerCase()}.`
}
