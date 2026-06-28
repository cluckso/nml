/**
 * Sanity checks for call transcripts: detect agent repetition and over-confirmation.
 * Used in tests and post-call logging — does not block webhooks.
 */

import { parseTranscriptTurns } from "@/lib/parse-lead-from-transcript"

export type CallTranscriptAuditIssue = {
  code: "excessive_confirmations" | "early_confirmation" | "repeated_info" | "excessive_name_use"
  message: string
  severity: "warning" | "error"
}

export type CallTranscriptAuditResult = {
  ok: boolean
  issues: CallTranscriptAuditIssue[]
  metrics: {
    agentTurnCount: number
    confirmationCount: number
    nameMentionCount: number
    repeatedPhraseCount: number
  }
}

const STOPWORDS = new Set([
  "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for", "of", "is", "are", "was", "were",
  "be", "been", "being", "have", "has", "had", "do", "does", "did", "will", "would", "could", "should",
  "may", "might", "must", "shall", "can", "need", "dare", "ought", "used", "i", "you", "he", "she", "it",
  "we", "they", "what", "which", "who", "whom", "this", "that", "these", "those", "am", "your", "our",
  "their", "my", "me", "him", "her", "us", "them", "with", "from", "by", "about", "into", "through",
  "during", "before", "after", "above", "below", "up", "down", "out", "off", "over", "under", "again",
  "further", "then", "once", "here", "there", "when", "where", "why", "how", "all", "each", "few",
  "more", "most", "other", "some", "such", "no", "nor", "not", "only", "own", "same", "so", "than",
  "too", "very", "just", "don", "now", "got", "thanks", "thank", "okay", "ok", "yes", "yeah", "sure",
  "right", "correct", "understand", "great", "perfect", "absolutely",
])

/** Agent turns that read back details or ask for confirmation. */
const CONFIRMATION_TURN =
  /\b(?:does that sound (?:right|correct|good)|is that (?:right|correct)|sound(?:s)? (?:right|good)|just to confirm|let me (?:confirm|repeat|make sure|read back)|to (?:recap|summarize|confirm)|so (?:to recap|i have|you(?:'re| are) calling)|i have (?:your|the)|make sure i have|read (?:that|this) back|did i get (?:that|everything)|anything (?:else|incorrect)|anything you(?:'d| would) like to (?:change|correct))\b/i

const BENIGN_NGRAMS = new Set([
  "got it thanks",
  "thanks got it",
  "one moment please",
  "someone will follow",
  "follow up soon",
  "thank you calling",
  "thanks for calling",
])

function normalize(text: string): string {
  return text.toLowerCase().replace(/[^\w\s]/g, " ").replace(/\s+/g, " ").trim()
}

function tokenize(text: string): string[] {
  return normalize(text)
    .split(" ")
    .filter((w) => w.length > 2 && !STOPWORDS.has(w))
}

function extractNGrams(text: string, n: number): string[] {
  const words = tokenize(text)
  if (words.length < n) return []
  const grams: string[] = []
  for (let i = 0; i <= words.length - n; i++) {
    grams.push(words.slice(i, i + n).join(" "))
  }
  return grams
}

function isConfirmationTurn(text: string): boolean {
  return CONFIRMATION_TURN.test(text)
}

/** Guess caller first name from user turns for name-overuse detection. */
function guessCallerFirstName(turns: ReturnType<typeof parseTranscriptTurns>): string | null {
  for (const turn of turns) {
    if (turn.speaker !== "user") continue
    const m =
      turn.text.match(/(?:^|\b)(?:hi,?\s*)?(?:this is|i'?m|i am|my name is)\s+([A-Za-z]{2,20})/i) ||
      turn.text.match(/^([A-Za-z]{2,20})(?:\s+[A-Za-z]{2,20})?$/)
    if (m?.[1] && !/^(yes|no|ok|okay|hi|hello|hey)$/i.test(m[1])) {
      return m[1]
    }
  }
  return null
}

function countNameMentions(agentTexts: string[], firstName: string): number {
  const pattern = new RegExp(`\\b${firstName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "gi")
  let count = 0
  for (const text of agentTexts) {
    const matches = text.match(pattern)
    if (matches) count += matches.length
  }
  return count
}

/** Count substantive n-grams repeated across separate agent turns. */
function countRepeatedAgentPhrases(agentTexts: string[]): number {
  const ngramTurns = new Map<string, Set<number>>()

  for (let i = 0; i < agentTexts.length; i++) {
    const grams = [
      ...extractNGrams(agentTexts[i], 5),
      ...extractNGrams(agentTexts[i], 6),
    ]
    for (const gram of grams) {
      if (gram.length < 20 || BENIGN_NGRAMS.has(gram)) continue
      if (!ngramTurns.has(gram)) ngramTurns.set(gram, new Set())
      ngramTurns.get(gram)!.add(i)
    }
  }

  let repeated = 0
  for (const [, turnSet] of ngramTurns) {
    if (turnSet.size >= 2) repeated++
  }
  return repeated
}

export type AuditCallTranscriptOptions = {
  /** Max confirmation-style agent turns before flagging (default 1). */
  maxConfirmations?: number
  /** Max times agent may say caller's first name (default 2). */
  maxNameMentions?: number
  /** Min repeated phrase hits before flagging (default 2). */
  minRepeatedPhrases?: number
}

/**
 * Audit a call transcript for agent repetition and over-confirmation.
 * Returns ok=true when no issues exceed thresholds.
 */
export function auditCallTranscript(
  transcript: string | null | undefined,
  options: AuditCallTranscriptOptions = {}
): CallTranscriptAuditResult {
  const maxConfirmations = options.maxConfirmations ?? 1
  const maxNameMentions = options.maxNameMentions ?? 2
  const minRepeatedPhrases = options.minRepeatedPhrases ?? 2

  const issues: CallTranscriptAuditIssue[] = []
  const turns = parseTranscriptTurns(transcript)
  const agentTurns = turns.filter((t) => t.speaker === "agent")
  const agentTexts = agentTurns.map((t) => t.text)

  if (agentTexts.length === 0) {
    return {
      ok: true,
      issues: [],
      metrics: {
        agentTurnCount: 0,
        confirmationCount: 0,
        nameMentionCount: 0,
        repeatedPhraseCount: 0,
      },
    }
  }

  const confirmationIndices = agentTexts
    .map((text, index) => (isConfirmationTurn(text) ? index : -1))
    .filter((i) => i >= 0)
  const confirmationCount = confirmationIndices.length

  if (confirmationCount > maxConfirmations) {
    issues.push({
      code: "excessive_confirmations",
      severity: "error",
      message: `Agent confirmed details ${confirmationCount} times (max ${maxConfirmations}). Confirm once at the end of the call.`,
    })
  }

  // Confirmation in the first half of the call when another appears later
  if (confirmationCount >= 2) {
    const midpoint = Math.floor(agentTexts.length / 2)
    const hasEarly = confirmationIndices.some((i) => i < midpoint)
    const hasLate = confirmationIndices.some((i) => i >= midpoint)
    if (hasEarly && hasLate) {
      issues.push({
        code: "early_confirmation",
        severity: "warning",
        message: "Agent confirmed details mid-call and again later. Save confirmation for the end.",
      })
    }
  }

  const repeatedPhraseCount = countRepeatedAgentPhrases(agentTexts)
  if (repeatedPhraseCount >= minRepeatedPhrases) {
    issues.push({
      code: "repeated_info",
      severity: "warning",
      message: `Agent repeated the same phrasing ${repeatedPhraseCount} times. Avoid reading back the same details.`,
    })
  }

  const firstName = guessCallerFirstName(turns)
  const nameMentionCount = firstName ? countNameMentions(agentTexts, firstName) : 0
  if (firstName && nameMentionCount > maxNameMentions) {
    issues.push({
      code: "excessive_name_use",
      severity: "warning",
      message: `Agent used caller name "${firstName}" ${nameMentionCount} times (max ${maxNameMentions}).`,
    })
  }

  const hasError = issues.some((i) => i.severity === "error")

  return {
    ok: !hasError,
    issues,
    metrics: {
      agentTurnCount: agentTexts.length,
      confirmationCount,
      nameMentionCount,
      repeatedPhraseCount,
    },
  }
}
