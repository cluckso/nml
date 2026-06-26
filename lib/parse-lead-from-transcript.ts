/**
 * Parse name, address, reason for call from transcript or summary when Retell
 * doesn't send extracted_variables. Used so SMS shows clear breakdown:
 * Name / Phone / Address / Reason for call (and optionally vehicle, appointment pref).
 */

export interface ParsedLead {
  name?: string
  address?: string
  city?: string
  issue_description?: string
}

const STREET_SUFFIX =
  /\b(street|st|avenue|ave|road|rd|blvd|boulevard|lane|ln|drive|dr|way|court|ct|place|pl|circle|cir|trail|trl|parkway|pkwy|highway|hwy)\b/i

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
    /(?:caller(?:'s)? name|name is|this is|i'?m|speaking with|contact name)[:\s]+([A-Za-z][A-Za-z\s.-]{1,40})(?=[.,\n]|$)/i,
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

  // Reason for call: short-form OK (e.g. "AC leak", "furnace out")
  const reasonPatterns = [
    /(?:calling about|reason for call|reason|need[s]?|issue|problem|request)[:\s]+([^\n.]{3,200})/i,
    /(?:job|service)[:\s]+([^\n.]{3,150})/i,
    /(?:wanted to|asking about)[^\n.]{0,80}([^\n.]{3,150})/i,
  ]
  for (const re of reasonPatterns) {
    const m = t.match(re)
    if (m && m[1]) {
      const reason = m[1].trim().replace(/\s+/g, " ")
      if (reason.length >= 3) {
        out.issue_description = reason.length > 300 ? reason.slice(0, 297) + "…" : reason
        break
      }
    }
  }
  if (!out.issue_description && t.length >= 3) {
    const first = t.split(/[.\n]/)[0]?.trim() || t.slice(0, 300).trim()
    if (first.length >= 3) out.issue_description = first.length > 300 ? first.slice(0, 297) + "…" : first
  }

  return out
}
