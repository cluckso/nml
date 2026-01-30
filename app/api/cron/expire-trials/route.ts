import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

/**
 * GET /api/cron/expire-trials
 * Call daily (e.g. Vercel cron or Supabase pg_cron). Requires Authorization: Bearer CRON_SECRET.
 * Pauses businesses where trialEndsAt < now() and no active subscription.
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("Authorization")
  const secret = process.env.CRON_SECRET
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const now = new Date()
    const businesses = await db.business.findMany({
      where: {
        trialEndsAt: { lt: now },
        isActive: true,
        subscription: { is: null },
      },
      select: { id: true },
    })

    if (businesses.length === 0) {
      return NextResponse.json({ ok: true, paused: 0 })
    }

    await db.business.updateMany({
      where: {
        id: { in: businesses.map((b) => b.id) },
      },
      data: { isActive: false },
    })

    return NextResponse.json({ ok: true, paused: businesses.length })
  } catch (error) {
    console.error("Expire trials cron error:", error)
    return NextResponse.json(
      { error: "Failed to expire trials" },
      { status: 500 }
    )
  }
}
