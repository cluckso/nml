/**
 * Steve Steinhoff personal missed-call agent — EDIT THESE VALUES.
 * Used by lib/flows/steve-personal-flow.ts and Retell setup scripts.
 */

export type SteveGreetingArbys = "never" | "if_asked" | "yes"
export type SteveGreetingStyle = "professional" | "casual"

export const STEVE_PERSONAL_AGENT_CONFIG = {
  /** Display name for prompts (first name is fine for callers). */
  ownerFirstName: "Steve",
  ownerFullName: "Steve Steinhoff",
  title: "General Manager",
  brandName: "Arby's",
  city: "Platteville",
  state: "WI",

  /** Retell post-call summary email — set yours in Retell Dashboard too. */
  summaryEmail: "", // e.g. "steve@example.com"

  /** Store hours for after-hours messaging (spoken naturally, not read as a list). */
  storeHoursSummary:
    "Monday through Sunday, typical restaurant hours — if unsure, say Steve will follow up on the next business day.",

  greetingStyle: "professional" as SteveGreetingStyle,
  /** Whether to say Arby's in the opening greeting. */
  mentionArbysInGreeting: "if_asked" as SteveGreetingArbys,

  /** Static welcome line (Arby's not required in opener). */
  welcomeMessage:
    "Hi, you've reached Steve's line. He's not available right now — I can take a message and make sure he gets it. Who am I speaking with?",

  /** Job applicants — optional official hiring channel. */
  hiringMessage:
    "For most openings, apply through the official Arby's careers site; Steve can also follow up about hiring questions.",
  hiringUrl: "https://careers.arbys.com",

  /** Optional E.164 number for urgent store transfers; leave empty for message-only. */
  urgentTransferNumber: null as string | null,

  /** Agent display name in Retell. */
  retellAgentName: "Steve Steinhoff — Personal",
}

/** Build global prompt additions from config (hours, hiring, Arby's mention rules). */
export function buildStevePersonalPromptContext(): string {
  const c = STEVE_PERSONAL_AGENT_CONFIG
  const lines: string[] = []

  lines.push(`You are answering missed calls for ${c.ownerFirstName} ${c.ownerFullName}, ${c.title} at ${c.brandName} in ${c.city}, ${c.state}.`)
  lines.push("Callers should not hear your internal role details unless they ask or context requires it.")

  if (c.greetingStyle === "professional") {
    lines.push("Tone: warm, professional, calm — like a trusted assistant at a restaurant.")
  } else {
    lines.push("Tone: friendly and casual — still respectful and clear.")
  }

  if (c.mentionArbysInGreeting === "never") {
    lines.push("Do NOT mention Arby's unless the caller brings it up.")
  } else if (c.mentionArbysInGreeting === "if_asked") {
    lines.push("Only mention Arby's or the Platteville location if the caller asks where Steve works or context requires it.")
  } else {
    lines.push("You may mention Arby's in Platteville naturally when relevant.")
  }

  lines.push(`Store hours (reference only): ${c.storeHoursSummary}`)
  lines.push("If the call seems outside operating hours, briefly note Steve will follow up on the next business day, then continue intake.")

  if (c.hiringUrl) {
    lines.push(`Job applicants: ${c.hiringMessage} (${c.hiringUrl}). Do not promise an interview or hiring decision.`)
  } else {
    lines.push(`Job applicants: ${c.hiringMessage}`)
  }

  if (c.urgentTransferNumber) {
    lines.push(
      `For urgent store issues (equipment failure before open, safety hazard, cannot staff opening), mark priority and offer that ${c.ownerFirstName} will be notified immediately. Transfer number on file: ${c.urgentTransferNumber} — only mention transfer if caller insists on speaking to someone now.`
    )
  } else {
    lines.push(
      "For urgent store issues (equipment, safety, opening/staffing emergencies), mark the message as priority and assure the caller Steve will be notified as soon as possible. Do not promise an exact callback time."
    )
  }

  if (c.summaryEmail) {
    lines.push(`Post-call summaries go to ${c.summaryEmail} (configured in Retell).`)
  }

  return lines.join("\n")
}
