import { NextRequest, NextResponse } from "next/server"
import { sendWeeklyReportForBusiness, sendAllWeeklyReports } from "@/lib/reports"
import { db } from "@/lib/db"

/**
 * POST /api/reports/weekly
 * - Called by Vercel Cron (send cron secret in Authorization header) to send weekly reports to all Local Plus businesses.
 * - Or ?businessId=xxx to send for one business (requires cron secret, or in dev use ?test=1 to bypass auth and plan check).
 *
 * Test mode (development only):
 *   POST /api/reports/weekly?businessId=YOUR_BUSINESS_ID&test=1
 *   No Authorization header needed. Sends report to the business owner email; subject is prefixed with [TEST].
 *   Set RESEND_API_KEY and optionally RESEND_FROM_EMAIL (e.g. onboarding@resend.dev) in .env.local.
 */
export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const businessId = searchParams.get("businessId")
    const testMode = searchParams.get("test") === "1"

    const authHeader = req.headers.get("authorization")
    const cronSecret = process.env.CRON_SECRET
    const isCron = cronSecret && authHeader === `Bearer ${cronSecret}`

    const isDevTest = process.env.NODE_ENV === "development" && testMode && !!businessId

    if (testMode && !businessId) {
      return NextResponse.json(
        { error: "In test mode provide ?businessId=xxx (a business ID that has an owner with an email)" },
        { status: 400 }
      )
    }

    if (!isCron && !isDevTest) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (businessId) {
      const testToEmail = process.env.RESEND_TEST_TO?.trim() || undefined
      const ok = await sendWeeklyReportForBusiness(businessId, {
        test: testMode || undefined,
        testToEmail: isDevTest ? testToEmail : undefined,
      })
      if (isDevTest) {
        const owner = await db.user.findFirst({
          where: { businessId },
          select: { email: true },
        })
        const actualTo = testToEmail || (owner?.email ?? null)
        return NextResponse.json({
          sent: ok,
          test: true,
          to: actualTo,
          hint: ok
            ? "Check inbox for [TEST] Weekly report"
            : "Send failed (check server logs; without a verified domain set RESEND_TEST_TO to your Resend account email)",
        })
      }
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
