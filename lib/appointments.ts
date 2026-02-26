import { AppointmentStatus } from "@prisma/client"
import { db } from "./db"
import { mergeWithDefaults, type BusinessSettings } from "./business-settings"

const DAY_NAMES = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"] as const

/** Parse appointmentRequest from Retell into a concrete scheduledAt. Returns null if unparseable. */
export function parseAppointmentRequest(
  apptReq: { preferredDays?: string; preferredTime?: string; notes?: string } | null | undefined,
  businessId: string
): { scheduledAt: Date; durationMinutes: number } | null {
  if (!apptReq || (typeof apptReq !== "object")) return null
  const daysStr = (apptReq.preferredDays ?? "").toLowerCase().trim()
  const timeStr = (apptReq.preferredTime ?? "").toLowerCase().trim()
  if (!daysStr && !timeStr) return null

  // Parse day: "monday", "tuesday", "mon", "tue", "monday or tuesday"
  const dayMatch = daysStr.match(/\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tue|wed|thu|fri|sat|sun)\b/)
  const dayMap: Record<string, number> = {
    sunday: 0, sun: 0, monday: 1, mon: 1, tuesday: 2, tue: 2, wednesday: 3, wed: 3,
    thursday: 4, thu: 4, friday: 5, fri: 5, saturday: 6, sat: 6,
  }
  const targetDay = dayMatch ? dayMap[dayMatch[1]] : null

  // Parse time: "morning" 9am, "afternoon" 1pm, "evening" 5pm, or "9" "10" "2pm"
  let hour = 9
  let minute = 0
  if (timeStr.includes("morning") || timeStr.includes("am")) {
    hour = 9
  } else if (timeStr.includes("afternoon") || timeStr.includes("pm")) {
    const pmMatch = timeStr.match(/(\d{1,2})\s*pm?/)
    hour = pmMatch ? parseInt(pmMatch[1], 10) : 14
    if (hour < 12) hour += 12
  } else {
    const numMatch = timeStr.match(/(\d{1,2})(?::(\d{2}))?/)
    if (numMatch) {
      hour = parseInt(numMatch[1], 10)
      minute = numMatch[2] ? parseInt(numMatch[2], 10) : 0
      if (hour < 8) hour += 12 // assume pm if small
    }
  }

  const now = new Date()
  let candidate = new Date(now)
  candidate.setHours(hour, minute, 0, 0)

  if (targetDay != null) {
    const currentDay = now.getDay()
    let daysAhead = (targetDay - currentDay + 7) % 7
    if (daysAhead === 0 && candidate <= now) daysAhead = 7
    candidate.setDate(candidate.getDate() + daysAhead)
  } else {
    if (candidate <= now) candidate.setDate(candidate.getDate() + 1)
  }

  return { scheduledAt: candidate, durationMinutes: 60 }
}

/** Get available time slots for a date. Uses business hours and slot duration from settings. */
export async function getAvailableSlots(
  businessId: string,
  date: Date,
  durationMinutes: number
): Promise<{ start: string; end: string }[]> {
  const business = await db.business.findUnique({
    where: { id: businessId },
    select: { settings: true },
  })
  const settings = mergeWithDefaults(business?.settings as Partial<BusinessSettings> | null)
  const availability = settings.availability
  const booking = settings.booking

  const open = availability.businessHours?.open ?? "08:00"
  const close = availability.businessHours?.close ?? "17:00"
  const days = availability.businessHours?.days ?? ["monday", "tuesday", "wednesday", "thursday", "friday"]
  const slotDuration = booking.slotDurationMinutes ?? 30
  const minNoticeHours = booking.minNoticeHours ?? 2
  const sameDayAllowed = booking.sameDayAllowed ?? true

  const dayName = DAY_NAMES[date.getDay()]
  if (!days.includes(dayName)) return []

  const now = new Date()
  const dateStr = date.toISOString().slice(0, 10)
  const isToday = dateStr === now.toISOString().slice(0, 10)
  if (isToday && !sameDayAllowed) return []

  const minStart = new Date(date)
  if (isToday) {
    minStart.setHours(now.getHours(), now.getMinutes() + minNoticeHours * 60, 0, 0)
  }

  const [openH, openM] = open.split(":").map(Number)
  const [closeH, closeM] = close.split(":").map(Number)
  const slotStart = new Date(date)
  slotStart.setHours(openH, openM, 0, 0)
  const slotEnd = new Date(date)
  slotEnd.setHours(closeH, closeM, 0, 0)

  const slots: { start: string; end: string }[] = []
  let current = new Date(slotStart)

  while (current.getTime() + durationMinutes * 60 * 1000 <= slotEnd.getTime()) {
    if (current >= minStart) {
      const end = new Date(current.getTime() + durationMinutes * 60 * 1000)
      slots.push({
        start: current.toISOString(),
        end: end.toISOString(),
      })
    }
    current.setMinutes(current.getMinutes() + slotDuration)
  }

  // Exclude slots that overlap with existing appointments
  const existing = await db.appointment.findMany({
    where: {
      businessId,
      status: { not: AppointmentStatus.CANCELLED },
      scheduledAt: { gte: slotStart, lt: new Date(slotEnd.getTime() + durationMinutes * 60 * 1000) },
    },
    select: { scheduledAt: true, durationMinutes: true },
  })

  return slots.filter((slot) => {
    const slotStartMs = new Date(slot.start).getTime()
    const slotEndMs = new Date(slot.end).getTime()
    for (const appt of existing) {
      const apptStart = appt.scheduledAt.getTime()
      const apptEnd = apptStart + appt.durationMinutes * 60 * 1000
      if (slotStartMs < apptEnd && slotEndMs > apptStart) return false
    }
    return true
  })
}
