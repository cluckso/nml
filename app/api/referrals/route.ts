import { NextRequest, NextResponse } from "next/server"
import { getAuthUserFromRequest } from "@/lib/auth"
import { db } from "@/lib/db"
import { ensureReferralCode, getReferralLink } from "@/lib/referrals"

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(req)
    if (!user?.businessId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const code = await ensureReferralCode(user.businessId)
    const referrals = await db.referral.findMany({
      where: { referrerBusinessId: user.businessId },
      orderBy: { createdAt: "desc" },
    })

    const converted = referrals.filter((r) => r.status === "CONVERTED")
    const earnedCents = converted.reduce((sum, r) => sum + (r.rewardCredited ? r.rewardAmountCents : 0), 0)

    return NextResponse.json({
      referralCode: code,
      referralLink: getReferralLink(code),
      total: referrals.length,
      converted: converted.length,
      earnedCents,
      referrals: referrals.map((r) => ({
        id: r.id,
        status: r.status,
        referredEmail: r.referredEmail,
        createdAt: r.createdAt,
        convertedAt: r.convertedAt,
        rewardCredited: r.rewardCredited,
      })),
    })
  } catch (error) {
    console.error("Referrals GET error:", error)
    return NextResponse.json({ error: "Failed to load referrals" }, { status: 500 })
  }
}
