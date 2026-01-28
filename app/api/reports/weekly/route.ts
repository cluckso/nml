import { NextRequest, NextResponse } from "next/server"
import { sendWeeklyReportForBusiness, sendAllWeeklyReports } from "@/lib/reports"

/**
 * POST /api/reports/weekly
 * - Called by Vercel Cron (send cron secret in Authorization header) to send weekly reports to all Local Plus businesses.
 * - Or ?businessId=xxx to send for one business (still requires cron secret or admin).
 */
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization")
    const cronSecret = process.env.CRON_SECRET
    const isCron = cronSecret && authHeader === `Bearer ${cronSecret}`

    if (!isCron) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const businessId = searchParams.get("businessId")

    if (businessId) {
      const ok = await sendWeeklyReportForBusiness(businessId)
      return NextResponse.json({ sent: ok })
    }

    const result = await sendAllWeeklyReports()
    return NextResponse.json(result)
  } catch (error) {
    console.error("Weekly report API error:", error)
    return NextResponse.json(
      { error: "Report failed" },
      { status: 500 }
    )
  }
}
