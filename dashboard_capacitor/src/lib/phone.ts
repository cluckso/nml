/** Build a `tel:` href for click-to-call. Returns null when no usable number. */
export function toTelHref(raw: string | null | undefined): string | null {
  if (raw == null || !raw.trim()) return null
  const digits = raw.replace(/\D/g, "")
  if (digits.length === 10) return `tel:+1${digits}`
  if (digits.length === 11 && digits.startsWith("1")) return `tel:+${digits}`
  const cleaned = raw.replace(/[^\d+]/g, "")
  if (cleaned.replace(/\D/g, "").length < 7) return null
  return `tel:${cleaned}`
}

/** Format a US phone number for display. */
export function formatPhoneForDisplay(raw: string | null | undefined): string {
  if (raw == null || raw === "") return ""
  const digits = raw.replace(/\D/g, "")
  if (digits.length === 11 && digits.startsWith("1")) {
    return `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
  }
  return raw
}
