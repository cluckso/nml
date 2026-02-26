import { NextRequest, NextResponse } from "next/server"
import { getAuthUserFromRequest } from "@/lib/auth"
import { db } from "@/lib/db"
import { getEffectivePlanType } from "@/lib/plans"
import { isSectionAllowed } from "@/lib/business-settings"

/** PATCH /api/appointments/[id] — update appointment (status, notes, etc.) */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthUserFromRequest(req)
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    if (!user.businessId) return NextResponse.json({ error: "No business" }, { status: 400 })

    const { id } = await params
    const existing = await db.appointment.findFirst({
      where: { id, businessId: user.businessId },
    })
    if (!existing) return NextResponse.json({ error: "Appointment not found" }, { status: 404 })

    const business = await db.business.findUnique({
      where: { id: user.businessId },
      select: { planType: true },
    })
    if (!business || !isSectionAllowed("booking", getEffectivePlanType(business.planType))) {
      return NextResponse.json({ error: "Booking requires Pro plan" }, { status: 403 })
    }

    const body = await req.json()
    const updateData: Record<string, unknown> = {}
    if (body.status && ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"].includes(body.status)) {
      updateData.status = body.status
    }
    if (body.notes !== undefined) updateData.notes = body.notes?.trim() || null
    if (body.scheduledAt) {
      const d = new Date(body.scheduledAt)
      if (!isNaN(d.getTime())) updateData.scheduledAt = d
    }
    if (body.durationMinutes !== undefined) {
      const m = Math.min(240, Math.max(15, parseInt(body.durationMinutes, 10) || 60))
      updateData.durationMinutes = m
    }

    const appointment = await db.appointment.update({
      where: { id },
      data: updateData as any,
    })

    return NextResponse.json({ appointment })
  } catch (error) {
    console.error("Appointment PATCH error:", error)
    return NextResponse.json({ error: "Failed to update appointment" }, { status: 500 })
  }
}

/** DELETE /api/appointments/[id] — cancel appointment (set status to CANCELLED) */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthUserFromRequest(req)
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    if (!user.businessId) return NextResponse.json({ error: "No business" }, { status: 400 })

    const { id } = await params
    const existing = await db.appointment.findFirst({
      where: { id, businessId: user.businessId },
    })
    if (!existing) return NextResponse.json({ error: "Appointment not found" }, { status: 404 })

    const appointment = await db.appointment.update({
      where: { id },
      data: { status: "CANCELLED" },
    })

    return NextResponse.json({ appointment })
  } catch (error) {
    console.error("Appointment DELETE error:", error)
    return NextResponse.json({ error: "Failed to cancel appointment" }, { status: 500 })
  }
}
