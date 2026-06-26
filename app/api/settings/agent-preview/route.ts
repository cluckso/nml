import { NextRequest, NextResponse } from "next/server"
import { getAuthUserFromRequest } from "@/lib/auth"
import { db } from "@/lib/db"
import { mergeWithDefaults, type BusinessSettings } from "@/lib/business-settings"
import { buildAgentOverride } from "@/lib/agent-override"

/**
 * GET /api/settings/agent-preview
 * Returns the agent_override, dynamic_variables, and begin_message that would be sent
 * to Retell for an inbound call. Use this to verify your settings are applied correctly.
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(req)
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    if (!user.businessId) return NextResponse.json({ error: "No business" }, { status: 400 })

    const business = await db.business.findUnique({
      where: { id: user.businessId },
      select: { name: true, settings: true, serviceAreas: true },
    })
    if (!business) return NextResponse.json({ error: "Business not found" }, { status: 404 })

    const settings = mergeWithDefaults(business.settings as Partial<BusinessSettings> | null)
    const businessName = settings.greeting.businessNamePronunciation || String(business.name ?? "").trim() || "our office"
    const serviceAreas = Array.isArray(business.serviceAreas) ? business.serviceAreas : []

    const { agentOverride, dynamicVars, beginMessage, ringDurationMs } = buildAgentOverride(
      settings,
      businessName,
      serviceAreas
    )

    return NextResponse.json({
      agentOverride,
      dynamicVariables: dynamicVars,
      beginMessage,
      ringDurationMs,
      summary: {
        ringBeforeAnswerSeconds: settings.callRouting.ringBeforeAnswerSeconds ?? 0,
        voiceSpeed: agentOverride.agent?.voice_speed,
        maxCallDurationMs: agentOverride.agent?.max_call_duration_ms,
        tone: settings.greeting.tone,
        questionDepth: settings.questionDepth,
      },
    })
  } catch (error) {
    console.error("Agent preview error:", error)
    return NextResponse.json({ error: "Failed to build agent preview" }, { status: 500 })
  }
}
