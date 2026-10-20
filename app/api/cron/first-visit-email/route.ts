import { NextRequest, NextResponse } from "next/server"
import { sendPendingFirstVisitEmails } from "@/lib/first-visit-email"
import { captureRouteError } from "@/lib/capture-error"

/** Cron: send first-visit re-engagement emails that the client path missed. */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization")
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const result = await sendPendingFirstVisitEmails()
    return NextResponse.json({ ok: true, ...result })
  } catch (error) {
    console.error("[Cron first-visit-email] Failed:", error)
    captureRouteError(error, { route: "cron/first-visit-email" })
    return NextResponse.json({ error: "Cron failed" }, { status: 500 })
  }
}
