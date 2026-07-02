import { NextRequest, NextResponse } from "next/server"
import { getAuthUserFromRequest } from "@/lib/auth"
import { prepareBusinessForTrial } from "@/lib/trial-start-business"
import { hasAcceptedTerms } from "@/lib/user-legal"
import { db } from "@/lib/db"

/**
 * POST /api/trial/start
 * No card required. Creates or updates business, starts trial, redirects to onboarding.
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json().catch(() => ({}))
    const businessPhone = body?.businessPhone
    const smsConsent = body?.smsConsent === true
    const funnelIndustry =
      typeof body?.funnelIndustry === "string" ? body.funnelIndustry.trim().toLowerCase() : ""
    const contactName =
      typeof body?.contactName === "string" ? body.contactName.trim() : ""
    const contactEmail =
      typeof body?.contactEmail === "string" ? body.contactEmail.trim() : ""

    if (typeof businessPhone !== "string" || !businessPhone.trim()) {
      return NextResponse.json({ error: "Missing businessPhone" }, { status: 400 })
    }

    const dbUser = await db.user.findUnique({
      where: { id: user.id },
      select: { termsAcceptedAt: true },
    })
    if (!hasAcceptedTerms(dbUser)) {
      return NextResponse.json(
        {
          error:
            "Please agree to the Terms of Service and Privacy Policy when creating your account before starting a trial.",
        },
        { status: 403 }
      )
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const prepared = await prepareBusinessForTrial(
      {
        userId: user.id,
        businessPhone: businessPhone.trim(),
        funnelIndustry: funnelIndustry || undefined,
        contactName: contactName || undefined,
        contactEmail: contactEmail || undefined,
        smsConsent,
      },
      appUrl
    )

    if (prepared.ok === false) {
      return NextResponse.json({ error: prepared.error }, { status: prepared.status })
    }

    return NextResponse.json({ url: prepared.onboardingUrl })
  } catch (error) {
    console.error("Trial start error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to start trial" },
      { status: 500 }
    )
  }
}
