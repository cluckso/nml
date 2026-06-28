/**
 * Parse name, address, and caller reason from transcript or summary when Retell
 * doesn't send complete extracted_variables. Prioritizes caller/user speech over agent lines.
 */

export interface ParsedLead {
  name?: string
  address?: string
  city?: string
  issue_description?: string
}

const STREET_SUFFIX =
  /\b(street|st|avenue|ave|road|rd|blvd|boulevard|lane|ln|drive|dr|way|court|ct|place|pl|circle|cir|trail|trl|parkway|pkwy|highway|hwy)\b/i

const AGENT_SPEAKER = /^(agent|assistant|ai|rep|receptionist|bot|system)\b/i
const USER_SPEAKER = /^(user|caller|customer|client|human|visitor)\b/i

const SERVICE_KEYWORDS =
  /\b(leak|leaking|broken|repair|fix|install|replace|not working|won't|wont|no heat|no ac|no cool|flood|flooding|clog|clogged|backup|smell|smoke|spark|outage|emergency|urgent|asap|quote|estimate|appointment|schedule|inspect|maintenance|tune.?up|water heater|furnace|ac unit|air condition|plumb|hvac|electric|toilet|sink|drain|roof|garage door|tow|brake|engine|tire|battery)\b/i

const AGENT_PHRASES =
  /\b(thank you for calling|thanks for calling|how can i help|how may i help|could you (?:please )?(?:provide|give|tell)|may i (?:have|get)|can i get your|what(?:'s| is) your (?:name|phone|address)|is there anything else|let me (?:transfer|connect)|our team will|i(?:'ll| will) (?:make sure|have someone|send|transfer)|one moment|please hold|this call may be recorded|before we (?:begin|start)|who am i speaking with)\b/i

const SUMMARY_CALLER_PATTERNS = [
  /\b(?:called|calling)\s+about\s+([^.!\n]{3,200})/i,
  /\b(?:the )?(?:caller|customer|client)\b[^.\n]{0,40}?\b(?:reported|stated|said|needs|requested|wanted|has|is having|experiencing)\s+(?:that\s+)?([^.!\n]{5,200})/i,
  /\b(?:issue|problem|concern)(?: is|:)\s*([^.!\n]{3,200})/i,
]

const REASON_LABEL_PATTERNS = [
  /\bcalled\s+about\s+([^.!\n]{3,200})/i,
  /\bcalling\s+about\s+([^.!\n]{3,200})/i,
  /\breason for call[:\s]+([^\n.]{3,200})/i,
  /\b(?:issue|problem|request)[:\s]+([^\n.]{3,200})/i,
  /\b(?:wanted to|asking about)\s+([^\n.]{3,150})/i,
]

const ACK_ONLY = /^(yes|yeah|yep|no|nope|ok(?:ay)?|sure|correct|right|uh.?huh|mm.?hm|thanks|thank you|hello|hi)\.?$/i
const NAME_ONLY = /^[A-Za-z][A-Za-z\s.'-]{1,40}$/
const PHONE_ONLY = /^[\d\s().+-]{7,20}$/

/** Reject reason/summary text that was mis-captured as an address. */
export function isLikelyPhysicalAddress(value: string | null | undefined): boolean {
  if (!value?.trim()) return false
  const v = value.trim().replace(/\s+/g, " ")
  if (v.length < 5 || v.length > 120) return false

  const hasNumber = /\d/.test(v)
  const hasStreetSuffix = STREET_SUFFIX.test(v)
  if (!hasNumber && !hasStreetSuffix) return false

  const reasonLike =
    /\b(leak|leaking|broken|repair|fix|install|replace|calling about|water heater|furnace|plumb|hvac|electric|appointment|schedule|need help|having (?:a |an )?problem)\b/i
  if (reasonLike.test(v) && !hasNumber) return false

  return true
}

export type TranscriptTurn = {
  speaker: "agent" | "user" | "unknown"
  text: string
}

/** Split Retell-style transcript into speaker turns. */
export function parseTranscriptTurns(text: string | null | undefined): TranscriptTurn[] {
  if (!text?.trim()) return []

  const turns: TranscriptTurn[] = []
  const lines = text.split(/\r?\n/)

  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (!line) continue

    const labeled = line.match(
      /^(?:\[\d{1,2}:\d{2}(?::\d{2})?\]\s*)?(Agent|Assistant|User|Caller|Customer|Client|Human|Rep|AI|Bot|System)\s*:\s*(.+)$/i
    )
    if (labeled) {
      const role = labeled[1].toLowerCase()
      const content = labeled[2].trim()
      if (!content) continue
      const speaker = USER_SPEAKER.test(role) ? "user" : AGENT_SPEAKER.test(role) ? "agent" : "unknown"
      turns.push({ speaker, text: content })
      continue
    }

    // Continuation of previous turn (wrapped line without label)
    if (turns.length > 0 && !line.includes(":")) {
      turns[turns.length - 1].text += " " + line
    }
  }

  return turns
}

function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, " ").trim()
}

function truncateAtSentence(text: string, maxLen: number): string {
  const t = normalizeWhitespace(text)
  if (t.length <= maxLen) return t
  const slice = t.slice(0, maxLen)
  const lastPeriod = slice.lastIndexOf(".")
  const lastQuestion = slice.lastIndexOf("?")
  const lastExclaim = slice.lastIndexOf("!")
  const breakAt = Math.max(lastPeriod, lastQuestion, lastExclaim)
  if (breakAt >= Math.floor(maxLen * 0.45)) {
    return slice.slice(0, breakAt + 1).trim()
  }
  return slice.trim() + "…"
}

/** True when text reads like the agent/script rather than the caller's problem. */
export function looksLikeAgentSpeech(text: string | null | undefined): boolean {
  if (!text?.trim()) return false
  const t = normalizeWhitespace(text).toLowerCase()
  if (t.length < 8) return false
  if (AGENT_PHRASES.test(t)) return true
  // Agent questions without a stated problem
  if (t.endsWith("?") && !SERVICE_KEYWORDS.test(t) && t.length < 120) return true
  if (/^thank you for calling\b/.test(t)) return true
  if (/^hi,?\s*(thanks|thank you) for calling\b/.test(t)) return true
  return false
}

function isLowValueUserUtterance(text: string): boolean {
  const t = normalizeWhitespace(text)
  if (t.length < 3) return true
  if (ACK_ONLY.test(t)) return true
  if (NAME_ONLY.test(t) && t.split(/\s+/).length <= 3) return true
  if (PHONE_ONLY.test(t)) return true
  if (isLikelyPhysicalAddress(t)) return true
  if (/^(my name is|i am|i'm|this is)\b/i.test(t) && !SERVICE_KEYWORDS.test(t) && t.length < 40) return true
  if (/^(it's|it is|the address is|address is)\b/i.test(t) && isLikelyPhysicalAddress(t.replace(/^.*?(?:is|at)\s+/i, ""))) {
    return true
  }
  return false
}

function scoreUserReasonCandidate(text: string): number {
  const t = normalizeWhitespace(text)
  if (isLowValueUserUtterance(t)) return 0
  let score = Math.min(t.length, 120) / 10
  if (SERVICE_KEYWORDS.test(t)) score += 8
  if (/\b(need|help|problem|issue|because)\b/i.test(t)) score += 3
  if (looksLikeAgentSpeech(t)) score -= 20
  if (t.length < 12) score -= 2
  return score
}

/** Pick the best caller reason from labeled user lines in a transcript. */
export function extractCallerReasonFromTranscript(transcript: string | null | undefined): string | undefined {
  const turns = parseTranscriptTurns(transcript)
  if (turns.length === 0) return undefined

  const userTexts = turns.filter((t) => t.speaker === "user").map((t) => t.text.trim()).filter(Boolean)
  if (userTexts.length === 0) return undefined

  let best: { text: string; score: number } | null = null
  for (const text of userTexts) {
    const score = scoreUserReasonCandidate(text)
    if (score <= 0) continue
    if (!best || score > best.score) best = { text, score }
  }

  if (best) return sanitizeIssueDescription(best.text)
  return undefined
}

function extractReasonFromSummaryNarrative(summary: string): string | undefined {
  const t = summary.trim()
  for (const re of SUMMARY_CALLER_PATTERNS) {
    const m = t.match(re)
    if (m?.[1]) {
      const candidate = sanitizeIssueDescription(m[1])
      if (candidate) return candidate
    }
  }
  return undefined
}

function extractReasonFromLabeledText(text: string): string | undefined {
  for (const re of REASON_LABEL_PATTERNS) {
    const m = text.match(re)
    if (m?.[1]) {
      const candidate = sanitizeIssueDescription(m[1])
      if (candidate) return candidate
    }
  }
  return undefined
}

/**
 * Clean and validate issue/reason text for reports and SMS.
 * Returns undefined if empty, agent speech, or too incomplete.
 */
export function sanitizeIssueDescription(text: string | null | undefined): string | undefined {
  if (!text?.trim()) return undefined

  let t = normalizeWhitespace(text)
    .replace(/^[-–—•*\s]+/, "")
    .replace(/^(?:hi|hello|hey)[,.]?\s+/i, "")
    .replace(/^(?:the )?(?:caller|customer|client)\s+(?:said|stated|reported|mentioned)\s+(?:that\s+)?/i, "")
    .replace(/^(?:they(?:'re| are)|he(?:'s| is)|she(?:'s| is))\s+/i, "")

  // Strip dangling agent/script fragments often appended to summaries
  t = t.replace(/\b(?:agent|assistant)\s+(?:said|asked|confirmed).*$/i, "").trim()
  t = t.replace(/\s+[,;]\s*$/, "").trim()

  if (t.length < 3) return undefined
  if (looksLikeAgentSpeech(t)) return undefined
  if (ACK_ONLY.test(t)) return undefined

  // Incomplete trailing clause
  if (/\b(and|but|so|because|with|for|to|the|a|an|my|your|their|our|is|are|was|were)$/i.test(t)) {
    t = t.replace(/\s+\S+$/, "").trim()
    if (t.length < 8) return undefined
  }

  return truncateAtSentence(t, 300)
}

/**
 * Resolve the best caller reason using analysis fields, transcript (user lines), then summary.
 */
export function resolveIssueDescription(options: {
  fromAnalysis?: string | null
  summary?: string | null
  transcript?: string | null
}): string | undefined {
  const { fromAnalysis, summary, transcript } = options

  const analysisClean = sanitizeIssueDescription(
    typeof fromAnalysis === "string" ? fromAnalysis : undefined
  )
  if (analysisClean) return analysisClean

  const fromTranscript = extractCallerReasonFromTranscript(transcript)
  if (fromTranscript) return fromTranscript

  if (typeof summary === "string" && summary.trim()) {
    const fromNarrative = extractReasonFromSummaryNarrative(summary)
    if (fromNarrative) return fromNarrative

    const fromLabels = extractReasonFromLabeledText(summary)
    if (fromLabels && !looksLikeAgentSpeech(fromLabels)) return fromLabels
  }

  if (typeof transcript === "string" && transcript.trim()) {
    const fromLabels = extractReasonFromLabeledText(transcript)
    if (fromLabels && !looksLikeAgentSpeech(fromLabels)) return fromLabels
  }

  return undefined
}

/**
 * Heuristic parse of transcript/summary text to extract lead fields.
 * Used as fallback when call_analysis.extracted_variables is empty or incomplete.
 */
export function parseLeadFromSummaryOrTranscript(text: string | null | undefined): ParsedLead {
  const out: ParsedLead = {}
  if (!text || typeof text !== "string") return out
  const t = text.trim()
  if (!t) return out

  // Name: common patterns (case-insensitive)
  const namePatterns = [
    /(?:caller(?:'s)? name|name is|this is|i'?m|speaking with|contact name)[:\s]+([A-Za-z][A-Za-z\s.'-]{1,40})(?=[.,\n]|$)/i,
    /(?:^|\n)([A-Z][a-z]+ [A-Z][a-z]+)(?:\s+called|called in|reached out)/,
    /(?:^|\n)([A-Z][a-z]+ [A-Z][a-z]+)\s+[\(\d]/,
  ]
  for (const re of namePatterns) {
    const m = t.match(re)
    if (m && m[1]) {
      const name = m[1].trim()
      if (name.length >= 2 && name.length <= 50 && !/^\d+$/.test(name)) {
        out.name = name
        break
      }
    }
  }

  // Prefer user lines for name when transcript is labeled
  const userTurns = parseTranscriptTurns(t).filter((turn) => turn.speaker === "user")
  for (const turn of userTurns) {
    const nameMatch = turn.text.match(/^(?:hi,?\s*)?(?:this is|i'?m|my name is)\s+([A-Za-z][A-Za-z\s.'-]{1,40})/i)
    if (nameMatch?.[1]) {
      out.name = nameMatch[1].trim()
      break
    }
  }

  // Address: explicit labels or numbered street — avoid bare "at" (captures reason text)
  const addressPatterns = [
    /(?:service address|property address|street address|mailing address|address is|address:?)\s*[:\s]+([^\n.]{5,120}?)(?=[.,\n]|$)/i,
    /(?:located at|property (?:is )?at)\s+(\d{1,6}[^\n.]{4,100})/i,
    /(\d{1,6}\s+[\w\s.'#-]{2,60}\b(?:street|st|avenue|ave|road|rd|blvd|boulevard|lane|ln|drive|dr|way|court|ct|place|pl|circle|cir|trail|trl|parkway|pkwy)\b\.?)/i,
  ]
  for (const re of addressPatterns) {
    const m = t.match(re)
    if (m && m[1]) {
      const addr = m[1].trim().replace(/\s+/g, " ")
      if (isLikelyPhysicalAddress(addr)) {
        out.address = addr
        break
      }
    }
  }

  // City: "city is X" or "in X" (short phrase)
  const cityMatch = t.match(/(?:city|located in)\s*[:\s]+([A-Za-z\s]{2,40})(?=[.,\n]|$)/i)
  if (cityMatch?.[1]) {
    const city = cityMatch[1].trim()
    if (city.length >= 2 && city.length <= 50) out.city = city
  }

  out.issue_description = resolveIssueDescription({ transcript: t, summary: t })

  return out
}
