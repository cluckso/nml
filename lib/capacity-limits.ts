import { AppointmentStatus } from "@prisma/client"
import { db } from "./db"
import type { AvailabilitySettings, BusinessSettings, CapacitySettings } from "./business-settings"
import { getZonedDayUtcBounds, getZonedWallClock, normalizeBusinessTimezone } from "./business-timezone"

export type CapacityEvaluation = {
  overLimit: boolean
  reason: string | null
  mode: "normal" | "intake_only" | "decline"
  leadCount: number
  appointmentCount: number
}

export async function getDailyLeadCount(
  businessId: string,
  at: Date,
  availability: AvailabilitySettings
): Promise<number> {
  const tz = normalizeBusinessTimezone(availability.timezone)
  const { start, end } = getZonedDayUtcBounds(at, tz)
  return db.call.count({
    where: {
      businessId,
      createdAt: { gte: start, lt: end },
      OR: [
        { callerName: { not: null } },
        { callerPhone: { not: null } },
        { issueDescription: { not: null } },
      ],
    },
  })
}

export async function getDailyAppointmentCount(
  businessId: string,
  at: Date,
  availability: AvailabilitySettings
): Promise<number> {
  const tz = normalizeBusinessTimezone(availability.timezone)
  const { start, end } = getZonedDayUtcBounds(at, tz)
  return db.appointment.count({
    where: {
      businessId,
      status: { not: AppointmentStatus.CANCELLED },
      scheduledAt: { gte: start, lt: end },
    },
  })
}

export async function evaluateCapacity(
  settings: BusinessSettings,
  businessId: string,
  at: Date = new Date()
): Promise<CapacityEvaluation> {
  const capacity = settings.capacity
  if (!capacity?.enabled) {
    return { overLimit: false, reason: null, mode: "normal", leadCount: 0, appointmentCount: 0 }
  }

  const [leadCount, appointmentCount] = await Promise.all([
    getDailyLeadCount(businessId, at, settings.availability),
    getDailyAppointmentCount(businessId, at, settings.availability),
  ])

  const leadOver = capacity.maxLeadsPerDay != null && leadCount >= capacity.maxLeadsPerDay
  const apptOver =
    capacity.maxAppointmentsPerDay != null && appointmentCount >= capacity.maxAppointmentsPerDay

  if (!leadOver && !apptOver) {
    return { overLimit: false, reason: null, mode: "normal", leadCount, appointmentCount }
  }

  const reasons: string[] = []
  if (leadOver) reasons.push(`daily lead limit (${leadCount}/${capacity.maxLeadsPerDay})`)
  if (apptOver) reasons.push(`daily appointment limit (${appointmentCount}/${capacity.maxAppointmentsPerDay})`)

  return {
    overLimit: true,
    reason: reasons.join("; "),
    mode: capacity.overLimitMode,
    leadCount,
    appointmentCount,
  }
}

export function resolveCapacityGreeting(
  capacity: CapacitySettings,
  businessName: string,
  mode: "intake_only" | "decline"
): string {
  const replaceBusiness = (text: string | null | undefined, fallback: string) =>
    (text ?? fallback).replace(/\[business\]/gi, businessName)

  if (mode === "decline") {
    return replaceBusiness(
      capacity.declineGreeting,
      `Thanks for calling ${businessName}. We're at capacity for new jobs today.`
    )
  }
  return replaceBusiness(
    capacity.highVolumeGreeting,
    `Thanks for calling ${businessName}. We're busy right now, but I can still take your information.`
  )
}

export function getCapacityDateLabel(at: Date, availability: AvailabilitySettings): string {
  return getZonedWallClock(at, normalizeBusinessTimezone(availability.timezone)).dateKey
}
