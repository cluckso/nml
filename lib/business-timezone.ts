/** Default when a business has not set a timezone (US trades focus). */
export const DEFAULT_BUSINESS_TIMEZONE = "America/Chicago"

/** Curated IANA zones for US / Canada businesses (Settings picker). */
export const BUSINESS_TIMEZONE_OPTIONS: { value: string; label: string }[] = [
  { value: "America/New_York", label: "Eastern (New York)" },
  { value: "America/Chicago", label: "Central (Chicago)" },
  { value: "America/Denver", label: "Mountain (Denver)" },
  { value: "America/Phoenix", label: "Arizona (Phoenix, no DST)" },
  { value: "America/Los_Angeles", label: "Pacific (Los Angeles)" },
  { value: "America/Anchorage", label: "Alaska (Anchorage)" },
  { value: "Pacific/Honolulu", label: "Hawaii (Honolulu)" },
  { value: "America/Puerto_Rico", label: "Atlantic (Puerto Rico)" },
  { value: "America/Toronto", label: "Eastern (Toronto)" },
  { value: "America/Winnipeg", label: "Central (Winnipeg)" },
  { value: "America/Edmonton", label: "Mountain (Edmonton)" },
  { value: "America/Vancouver", label: "Pacific (Vancouver)" },
]

const ALLOWED = new Set(BUSINESS_TIMEZONE_OPTIONS.map((o) => o.value))

/** Validate and normalize stored timezone; fall back to default. */
export function normalizeBusinessTimezone(value: string | null | undefined): string {
  if (!value || typeof value !== "string") return DEFAULT_BUSINESS_TIMEZONE
  const trimmed = value.trim()
  if (!trimmed) return DEFAULT_BUSINESS_TIMEZONE
  if (ALLOWED.has(trimmed)) return trimmed
  try {
    Intl.DateTimeFormat(undefined, { timeZone: trimmed })
    return trimmed
  } catch {
    return DEFAULT_BUSINESS_TIMEZONE
  }
}

export type ZonedWallClock = {
  dateKey: string
  dayName: string
  minutesSinceMidnight: number
}

/** Wall-clock date/time in the business IANA timezone for `at` (UTC instant). */
export function getZonedWallClock(at: Date, timeZone: string): ZonedWallClock {
  const tz = normalizeBusinessTimezone(timeZone)
  const dateParts = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(at)
  const timeParts = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(at)
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    weekday: "long",
  })
    .format(at)
    .toLowerCase()

  const get = (parts: Intl.DateTimeFormatPart[], type: string) =>
    parts.find((p) => p.type === type)?.value ?? "00"

  const dateKey = `${get(dateParts, "year")}-${get(dateParts, "month")}-${get(dateParts, "day")}`
  const hour = Number(get(timeParts, "hour"))
  const minute = Number(get(timeParts, "minute"))

  return {
    dateKey,
    dayName: weekday,
    minutesSinceMidnight: hour * 60 + minute,
  }
}
