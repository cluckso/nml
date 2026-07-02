import { NextRequest, NextResponse } from "next/server"
import { sendAllWeeklyReports } from "@/lib/reports"
import { captureRouteError } from "@/lib/capture-error"

/** Cron: email weekly usage & lead reports to Pro businesses */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization")
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const result = await sendAllWeeklyReports()
    return NextResponse.json({ ok: true, ...result })
  } catch (error) {
    console.error("[Cron weekly-reports] Failed:", error)
    captureRouteError(error, { route: "cron/weekly-reports" })
    return NextResponse.json({ error: "Cron failed" }, { status: 500 })
  }
}
