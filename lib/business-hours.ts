import type { AvailabilitySettings } from "./business-settings"

const DAY_NAMES = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const

function localDateKey(at: Date): string {
  const y = at.getFullYear()
  const m = String(at.getMonth() + 1).padStart(2, "0")
  const d = String(at.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

function parseTimeToMinutes(time: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(time.trim())
  if (!match) return null
  const hours = Number(match[1])
  const minutes = Number(match[2])
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null
  return hours * 60 + minutes
}

/** Whether `at` falls inside configured business hours (local timezone). */
export function isWithinBusinessHours(
  availability: AvailabilitySettings,
  at: Date = new Date()
): boolean {
  const { businessHours, holidayOverrides } = availability
  const dateKey = localDateKey(at)

  const holiday = holidayOverrides.find((h) => h.date === dateKey)
  if (holiday?.closed) return false

  const dayName = DAY_NAMES[at.getDay()]
  if (!businessHours.days.includes(dayName)) return false

  const openMinutes = parseTimeToMinutes(businessHours.open)
  const closeMinutes = parseTimeToMinutes(businessHours.close)
  if (openMinutes == null || closeMinutes == null || closeMinutes <= openMinutes) {
    return false
  }

  const nowMinutes = at.getHours() * 60 + at.getMinutes()
  return nowMinutes >= openMinutes && nowMinutes < closeMinutes
}
