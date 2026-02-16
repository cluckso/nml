/**
 * Call filtering: skip notifications when no actionable info or likely spam.
 */

export interface IntakeForFilter {
  name?: string | null
  phone?: string | null
  address?: string | null
  city?: string | null
  issue_description?: string | null
  vehicle_year?: string | null
  vehicle_make?: string | null
  vehicle_model?: string | null
  year?: string | null
  make?: string | null
  model?: string | null
  appointment_preference?: string | null
  availability?: string | null
  preferred_time?: string | null
}

export interface CallForFilter {
  duration?: number
  callerPhone?: string | null
}

/** True if we have something actionable to report (phone to call back, name, issue, address, vehicle, appointment). */
export function hasActionableInfo(
  intake: IntakeForFilter,
  call?: CallForFilter | null
): boolean {
  const phone = intake.phone?.trim() || call?.callerPhone?.trim()
  const name = (intake.name || "").trim()
  const hasName = name && name.toLowerCase() !== "unknown" && name.length > 1
  const hasIssue = (intake.issue_description || "").trim().length > 0
  const hasAddress = (intake.address || intake.city || "").trim().length > 0
  const hasVehicle = [
    intake.vehicle_year,
    intake.vehicle_make,
    intake.vehicle_model,
    intake.year,
    intake.make,
    intake.model,
  ].some((v) => (v || "").trim().length > 0)
  const hasAppt = [
    intake.appointment_preference,
    intake.availability,
    intake.preferred_time,
  ].some((v) => (v || "").trim().length > 0)

  return !!(phone || hasName || hasIssue || hasAddress || hasVehicle || hasAppt)
}

/** Known test/fictitious NANP numbers and common spam patterns. */
const SPAM_PATTERNS: RegExp[] = [
  /^\+?1?55501\d{2}$/, // 555-01XX fictitious
  /^\+?1?5551212$/, // Directory assistance
  /^\+?1?0000000000$/,
  /^\+?1?1234567890$/,
  /^\+?1?1111111111$/,
  /^\+?1?(\d)\1{9}$/, // All same digit
  /^\+?1?0123456789$/,
]

function toDigits(phone: string | null | undefined): string {
  if (!phone) return ""
  return phone.replace(/\D/g, "")
}

/** True if phone matches known test/spam number patterns. */
export function isKnownSpamOrTestNumber(phone: string | null | undefined): boolean {
  const digits = toDigits(phone)
  if (digits.length < 10) return false
  const normalized = digits.length === 11 && digits.startsWith("1") ? digits : `1${digits}`
  return SPAM_PATTERNS.some((re) => re.test(normalized))
}

/** True if call looks like spam: very short with no info, or known spam/test number. */
export function isLikelySpam(
  intake: IntakeForFilter,
  call: CallForFilter | null | undefined
): boolean {
  const duration = call?.duration ?? 0
  const phone = intake.phone?.trim() || call?.callerPhone?.trim()

  if (isKnownSpamOrTestNumber(phone)) return true
  if (duration < 5 && !hasActionableInfo(intake, call)) return true

  return false
}
