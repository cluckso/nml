import { NextRequest, NextResponse } from "next/server"
import { trackReferralSignup } from "@/lib/referrals"

/** Public: track referral attribution when a business completes onboarding */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const referralCode = typeof body.referralCode === "string" ? body.referralCode.trim() : ""
    const businessId = typeof body.businessId === "string" ? body.businessId.trim() : ""
    const email = typeof body.email === "string" ? body.email.trim() : undefined

    if (!referralCode || !businessId) {
      return NextResponse.json({ error: "Missing referralCode or businessId" }, { status: 400 })
    }

    const referral = await trackReferralSignup(referralCode, businessId, email)
    return NextResponse.json({ success: true, referralId: referral?.id ?? null })
  } catch (error) {
    console.error("Referral track error:", error)
    return NextResponse.json({ error: "Failed to track referral" }, { status: 500 })
  }
}
