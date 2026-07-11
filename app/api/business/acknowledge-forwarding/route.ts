import { NextRequest, NextResponse } from "next/server"
import { getAuthUserFromRequest } from "@/lib/auth"
import { db } from "@/lib/db"
import { mergeWithDefaults, type BusinessSettings } from "@/lib/business-settings"
import { captureRouteError } from "@/lib/capture-error"

/**
 * POST /api/business/acknowledge-forwarding
 * Marks carrier forwarding as set so the trial checklist can advance without waiting for a live call.
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(req)
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    if (!user.businessId) {
      return NextResponse.json({ error: "No business" }, { status: 400 })
    }

    const business = await db.business.findUnique({
      where: { id: user.businessId },
      select: { settings: true },
    })
    if (!business) return NextResponse.json({ error: "Business not found" }, { status: 404 })

    const current = mergeWithDefaults(business.settings as Partial<BusinessSettings> | null)
    const next: BusinessSettings = {
      ...current,
      forwardingSetupComplete: true,
    }

    await db.business.update({
      where: { id: user.businessId },
      data: { settings: next as object },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    captureRouteError(error, { route: "POST /api/business/acknowledge-forwarding" })
    return NextResponse.json({ error: "Failed to save" }, { status: 500 })
  }
}
