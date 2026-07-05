import { NextRequest, NextResponse } from "next/server"
import { getAuthUserFromRequest } from "@/lib/auth"
import { db } from "@/lib/db"
import { buildVoicePreview } from "@/lib/voice-preview"
import type { GreetingSettings, VoiceBrandSettings } from "@/lib/business-settings"

/**
 * POST /api/settings/voice-preview
 * Returns resolved greeting text and voice parameters for client-side preview playback.
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(req)
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    if (!user.businessId) return NextResponse.json({ error: "No business" }, { status: 400 })

    const business = await db.business.findUnique({
      where: { id: user.businessId },
      select: { name: true, planType: true },
    })
    if (!business) return NextResponse.json({ error: "Business not found" }, { status: 404 })

    const body = (await req.json()) as {
      greeting?: Partial<GreetingSettings>
      voiceBrand?: Partial<VoiceBrandSettings>
      sampleText?: string
      mode?: "greeting" | "voice"
    }

    const preview = buildVoicePreview({
      greeting: body.greeting,
      voiceBrand: body.voiceBrand,
      businessName: String(business.name ?? ""),
      planType: business.planType,
      sampleText:
        body.mode === "voice"
          ? body.sampleText ??
            `Thanks for calling ${business.name}. How can I help you today?`
          : undefined,
    })

    return NextResponse.json(preview)
  } catch (error) {
    console.error("Voice preview error:", error)
    return NextResponse.json({ error: "Failed to build voice preview" }, { status: 500 })
  }
}
