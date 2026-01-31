import { NextRequest, NextResponse } from "next/server"
import { getAuthUserFromRequest } from "@/lib/auth"
import { db } from "@/lib/db"
import { getIntakeNumberForIndustry } from "@/lib/intake-routing"

/**
 * POST /api/agents
 * Returns the intake number this business should forward to (by industry):
 * CHILDCARE → NML_INTAKE_NUMBER_CHILDCARE / RETELL_INTAKE_CHILDCARE;
 * service industries → NML_INTAKE_NUMBER_SERVICE / RETELL_INTAKE_SERVICE (or legacy shared).
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(req)
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    if (!user.businessId) {
      return NextResponse.json({ error: "Business not found" }, { status: 400 })
    }

    const business = await db.business.findUnique({
      where: { id: user.businessId },
      select: { industry: true },
    })
    const phoneNumber = getIntakeNumberForIndustry(business?.industry ?? null)

    return NextResponse.json({
      success: true,
      phoneNumber,
      message:
        phoneNumber == null
          ? "Intake number not configured. Set NML_INTAKE_NUMBER_SERVICE / NML_INTAKE_NUMBER_CHILDCARE (or NML_SHARED_INTAKE_NUMBER)."
          : "Forward your missed calls to the number below.",
    })
  } catch (error) {
    console.error("Agents API error:", error)
    return NextResponse.json({ error: "Failed to get intake number" }, { status: 500 })
  }
}
