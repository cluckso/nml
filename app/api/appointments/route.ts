import { NextRequest, NextResponse } from "next/server"
import { AppointmentStatus } from "@prisma/client"
import { getAuthUserFromRequest } from "@/lib/auth"
import { db } from "@/lib/db"
import { mergeWithDefaults, type BusinessSettings } from "@/lib/business-settings"
import { getAvailableSlots } from "@/lib/appointments"
import { getEffectivePlanType } from "@/lib/plans"
import { isSectionAllowed } from "@/lib/business-settings"

/** GET /api/appointments — list appointments. Query: from, to (ISO date), status */
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(req)
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    if (!user.businessId) return NextResponse.json({ error: "No business" }, { status: 400 })

    const searchParams = req.nextUrl.searchParams
    const fromStr = searchParams.get("from")
    const toStr = searchParams.get("to")
    const status = searchParams.get("status")

    const from = fromStr ? new Date(fromStr) : new Date()
    const to = toStr ? new Date(toStr) : new Date(from.getTime() + 30 * 24 * 60 * 60 * 1000)

    const where: { businessId: string; scheduledAt?: { gte?: Date; lte?: Date }; status?: AppointmentStatus } = {
      businessId: user.businessId,
      scheduledAt: { gte: from, lte: to },
    }
    if (status && ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"].includes(status)) {
      where.status = status as AppointmentStatus
    }

    const appointments = await db.appointment.findMany({
      where,
      orderBy: { scheduledAt: "asc" },
      include: { call: { select: { id: true, retellCallId: true } } },
    })

    return NextResponse.json({ appointments })
  } catch (error) {
    console.error("Appointments GET error:", error)
    return NextResponse.json({ error: "Failed to load appointments" }, { status: 500 })
  }
}

/** POST /api/appointments — create appointment. Body: callerName, callerPhone, scheduledAt, durationMinutes, issueDescription, notes */
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(req)
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    if (!user.businessId) return NextResponse.json({ error: "No business" }, { status: 400 })

    const business = await db.business.findUnique({
      where: { id: user.businessId },
      select: { planType: true },
    })
    if (!business) return NextResponse.json({ error: "Business not found" }, { status: 404 })
    if (!isSectionAllowed("booking", getEffectivePlanType(business.planType))) {
      return NextResponse.json({ error: "Booking requires Pro plan" }, { status: 403 })
    }

    const body = await req.json()
    const callerName = body.callerName?.trim() || null
    const callerPhone = body.callerPhone?.trim() || null
    const callerEmail = body.callerEmail?.trim() || null
    const scheduledAt = body.scheduledAt ? new Date(body.scheduledAt) : null
    const durationMinutes = Math.min(240, Math.max(15, parseInt(body.durationMinutes, 10) || 60))
    const issueDescription = body.issueDescription?.trim() || null
    const notes = body.notes?.trim() || null

    if (!scheduledAt || isNaN(scheduledAt.getTime())) {
      return NextResponse.json({ error: "scheduledAt is required" }, { status: 400 })
    }

    const appointment = await db.appointment.create({
      data: {
        businessId: user.businessId,
        callerName,
        callerPhone,
        callerEmail,
        scheduledAt,
        durationMinutes,
        issueDescription,
        notes,
        status: "PENDING",
      },
    })

    return NextResponse.json({ appointment })
  } catch (error) {
    console.error("Appointments POST error:", error)
    return NextResponse.json({ error: "Failed to create appointment" }, { status: 500 })
  }
}
