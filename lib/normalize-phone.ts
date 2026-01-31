/**
 * E.164 normalization for US numbers (and optional other countries).
 * Use everywhere before storing or looking up by phone (forwarding, caller, etc.).
 */

const US_COUNTRY = "1"

/**
 * Normalize a phone string to E.164 (e.g. +14155551234).
 * Accepts digits, spaces, dashes, parens, leading + or 1.
 * Returns null if input is empty or not plausibly a US number.
 */
export function normalizeE164(input: string | null | undefined): string | null {
  if (input == null || typeof input !== "string") return null
  const digits = input.replace(/\D/g, "")
  if (digits.length === 0) return null
  let normalized: string
  if (digits.length === 10 && !digits.startsWith("0")) {
    normalized = `+${US_COUNTRY}${digits}`
  } else if (digits.length === 11 && digits.startsWith(US_COUNTRY)) {
    normalized = `+${digits}`
  } else if (digits.length > 11 && digits.startsWith(US_COUNTRY)) {
    normalized = `+${digits.slice(0, 11)}`
  } else if (digits.length >= 10) {
    normalized = `+${US_COUNTRY}${digits.slice(-10)}`
  } else {
    return null
  }
  return normalized
}

/**
 * Validate that a string is non-empty and normalizes to E.164.
 */
export function isValidE164(input: string | null | undefined): boolean {
  return normalizeE164(input) != null
}
