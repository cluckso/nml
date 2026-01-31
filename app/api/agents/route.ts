import { NextRequest, NextResponse } from "next/server"
import { getAuthUserFromRequest } from "@/lib/auth"

/**
 * POST /api/agents
 * Shared-agent model: no per-client agent creation. Returns the shared intake number
 * so the client can forward their missed calls to it. RETELL_AGENT_ID and the shared
 * number are configured once (env: NML_SHARED_INTAKE_NUMBER or RETELL_SHARED_NUMBER).
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(req)
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    if (!user.businessId) {
      return NextResponse.json({ error: "Business not found" }, { status: 400 })
    }

    const sharedNumber =
      process.env.NML_SHARED_INTAKE_NUMBER ?? process.env.RETELL_SHARED_NUMBER ?? null

    return NextResponse.json({
      success: true,
      phoneNumber: sharedNumber,
      message:
        sharedNumber == null
          ? "Shared intake number not configured. Set NML_SHARED_INTAKE_NUMBER or RETELL_SHARED_NUMBER."
          : "Forward your missed calls to the number below.",
    })
  } catch (error) {
    console.error("Agents API error:", error)
    return NextResponse.json({ error: "Failed to get shared number" }, { status: 500 })
  }
}
