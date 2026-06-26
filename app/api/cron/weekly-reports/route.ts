import { NextRequest, NextResponse } from "next/server"
import { sendAllWeeklyReports } from "@/lib/reports"

/** Cron: email weekly usage & lead reports to Pro businesses */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization")
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const result = await sendAllWeeklyReports()
  return NextResponse.json({ ok: true, ...result })
}
