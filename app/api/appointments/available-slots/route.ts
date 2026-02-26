import { NextRequest, NextResponse } from "next/server"
import { getAuthUserFromRequest } from "@/lib/auth"
import { getAvailableSlots } from "@/lib/appointments"
import { mergeWithDefaults, type BusinessSettings } from "@/lib/business-settings"
import { db } from "@/lib/db"
import { getEffectivePlanType } from "@/lib/plans"
import { isSectionAllowed } from "@/lib/business-settings"

/** GET /api/appointments/available-slots?date=YYYY-MM-DD&duration=60 — get available slots for a date */
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(req)
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    if (!user.businessId) return NextResponse.json({ error: "No business" }, { status: 400 })

    const business = await db.business.findUnique({
      where: { id: user.businessId },
      select: { planType: true, settings: true },
    })
    if (!business) return NextResponse.json({ error: "Business not found" }, { status: 404 })
    if (!isSectionAllowed("booking", getEffectivePlanType(business.planType))) {
      return NextResponse.json({ error: "Booking requires Pro plan" }, { status: 403 })
    }

    const settings = mergeWithDefaults(business.settings as Partial<BusinessSettings> | null)
    const dateStr = req.nextUrl.searchParams.get("date")
    const duration = Math.min(240, Math.max(15, parseInt(req.nextUrl.searchParams.get("duration") || "60", 10) || 60))

    const date = dateStr ? new Date(dateStr + "T12:00:00") : new Date()
    if (isNaN(date.getTime())) {
      return NextResponse.json({ error: "Invalid date" }, { status: 400 })
    }

    const slots = await getAvailableSlots(user.businessId, date, duration)

    return NextResponse.json({ slots })
  } catch (error) {
    console.error("Available slots error:", error)
    return NextResponse.json({ error: "Failed to get slots" }, { status: 500 })
  }
}
