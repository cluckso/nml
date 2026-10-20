import { NextRequest, NextResponse } from "next/server"
import { getAuthUserFromRequest } from "@/lib/auth"
import { db } from "@/lib/db"
import { mergeWithDefaults, type BusinessSettings } from "@/lib/business-settings"
import { captureRouteError } from "@/lib/capture-error"

/**
 * POST /api/activation/greeting-previewed
 * Marks greeting preview heard for trial activation checklist — no Retell sync.
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(req)
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    if (!user.businessId) return NextResponse.json({ error: "No business" }, { status: 400 })

    const business = await db.business.findUnique({
      where: { id: user.businessId },
      select: { settings: true },
    })
    if (!business) return NextResponse.json({ error: "Business not found" }, { status: 404 })

    const settings = mergeWithDefaults(business.settings as Partial<BusinessSettings> | null)
    if (settings.greeting.greetingPreviewedAt) {
      return NextResponse.json({ ok: true, alreadyMarked: true })
    }

    const next: BusinessSettings = {
      ...settings,
      greeting: {
        ...settings.greeting,
        greetingPreviewedAt: new Date().toISOString(),
      },
    }

    await db.business.update({
      where: { id: user.businessId },
      data: { settings: next as object },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("greeting-previewed error:", error)
    captureRouteError(error, { route: "activation/greeting-previewed" })
    return NextResponse.json({ error: "Failed to mark greeting preview" }, { status: 500 })
  }
}
