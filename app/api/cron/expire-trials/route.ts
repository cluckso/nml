import { NextRequest, NextResponse } from "next/server"
import { expireEndedTrials } from "@/lib/expire-trials"
import { captureRouteError } from "@/lib/capture-error"

/** Cron: pause trial businesses past their end date or minute cap */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization")
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const result = await expireEndedTrials()
    return NextResponse.json({ ok: true, ...result })
  } catch (error) {
    console.error("[Cron expire-trials] Failed:", error)
    captureRouteError(error, { route: "cron/expire-trials" })
    return NextResponse.json({ error: "Cron failed" }, { status: 500 })
  }
}
