import { NextRequest, NextResponse } from "next/server"
import { expireEndedTrials } from "@/lib/expire-trials"

/** Cron: pause trial businesses past their end date or minute cap */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization")
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const result = await expireEndedTrials()
  return NextResponse.json({ ok: true, ...result })
}
