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

  // Address: street address pattern or "address is X" / "at X"
  const addressPatterns = [
    /(?:address|service address|located at|at)\s*[:\s]+([^\n.]{5,80})(?=[.,\n]|$)/i,
    /(\d+\s+[\w\s]+(?:street|st|avenue|ave|road|rd|blvd|lane|ln|drive|dr|way|court|ct|place|pl))[^\n]*/i,
    /(?:address|location)[:\s]+([^\n.]{5,80})/i,
  ]
  for (const re of addressPatterns) {
    const m = t.match(re)
    if (m && m[1]) {
      const addr = m[1].trim().replace(/\s+/g, " ")
      if (addr.length >= 5 && addr.length <= 120) {
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

  // Reason for call: "calling about", "reason for call", "need(s)", "issue", or first sentence
  const reasonPatterns = [
    /(?:calling about|reason for call|reason|need[s]?|issue|problem|request)[:\s]+([^\n.]{10,200})/i,
    /(?:job|service)[:\s]+([^\n.]{10,150})/i,
    /(?:wanted to|asking about)[^\n.]{0,80}([^\n.]{10,150})/i,
  ]
  for (const re of reasonPatterns) {
    const m = t.match(re)
    if (m && m[1]) {
      const reason = m[1].trim().replace(/\s+/g, " ")
      if (reason.length >= 10) {
        out.issue_description = reason.length > 200 ? reason.slice(0, 197) + "…" : reason
        break
      }
    }
  }
  if (!out.issue_description && t.length >= 10) {
    // Use first sentence or first 200 chars as reason
    const first = t.split(/[.\n]/)[0]?.trim() || t.slice(0, 200).trim()
    if (first.length >= 10) out.issue_description = first.length > 200 ? first.slice(0, 197) + "…" : first
  }

  return out
}
