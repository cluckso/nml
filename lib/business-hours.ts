import type { AvailabilitySettings } from "./business-settings"
import { DEFAULT_BUSINESS_TIMEZONE, getZonedWallClock, normalizeBusinessTimezone } from "./business-timezone"

function parseTimeToMinutes(time: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(time.trim())
  if (!match) return null
  const hours = Number(match[1])
  const minutes = Number(match[2])
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null
  return hours * 60 + minutes
}

/** Whether `at` falls inside configured business hours (business timezone). */
export function isWithinBusinessHours(
  availability: AvailabilitySettings,
  at: Date = new Date()
): boolean {
  const { businessHours, holidayOverrides } = availability
  const timeZone = normalizeBusinessTimezone(availability.timezone ?? DEFAULT_BUSINESS_TIMEZONE)
  const { dateKey, dayName, minutesSinceMidnight } = getZonedWallClock(at, timeZone)

  const holiday = holidayOverrides.find((h) => h.date === dateKey)
  if (holiday?.closed) return false

  if (!businessHours.days.includes(dayName)) return false

  const openMinutes = parseTimeToMinutes(businessHours.open)
  const closeMinutes = parseTimeToMinutes(businessHours.close)
  if (openMinutes == null || closeMinutes == null || closeMinutes <= openMinutes) {
    return false
  }

  return minutesSinceMidnight >= openMinutes && minutesSinceMidnight < closeMinutes
}
