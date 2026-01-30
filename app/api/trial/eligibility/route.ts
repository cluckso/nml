import { NextRequest, NextResponse } from "next/server"
import { getAuthUserFromRequest } from "@/lib/auth"
import { checkTrialEligibility } from "@/lib/trial"

/**
 * POST /api/trial/eligibility
 * Body: { businessPhone: string }
 * Returns { eligible: boolean, reason?: string, normalizedPhone?: string }
 * 403 if phone already used a trial.
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(req)
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await req.json().catch(() => ({}))
    const businessPhone = body?.businessPhone
    if (typeof businessPhone !== "string" || !businessPhone.trim()) {
      return NextResponse.json(
        { error: "Missing businessPhone", eligible: false, reason: "invalid_phone" },
        { status: 400 }
      )
    }

    const result = await checkTrialEligibility(businessPhone.trim())

    if (result.eligible === false) {
      const reason = result.reason
      return NextResponse.json(
        {
          eligible: false,
          reason,
          message:
            reason === "phone_already_used_trial"
              ? "This number has already been used for a trial. Upgrade or contact support."
              : "Invalid phone number. Use a valid US number.",
        },
        { status: 403 }
      )
    }

    return NextResponse.json({
      eligible: true,
      normalizedPhone: result.normalizedPhone,
    })
  } catch (error) {
    console.error("Trial eligibility error:", error)
    return NextResponse.json(
      { error: "Failed to check eligibility", eligible: false },
      { status: 500 }
    )
  }
}
