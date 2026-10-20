import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getAuthUserFromRequest } from "@/lib/auth"
import { maybeSendFirstVisitEmail } from "@/lib/first-visit-email"
import { captureRouteError } from "@/lib/capture-error"

/**
 * POST /api/user/first-visit-email
 * Fire-and-forget re-engagement email after signup/email confirmation.
 * Idempotent via User.firstVisitEmailSentAt.
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const result = await maybeSendFirstVisitEmail(user.id)
    return NextResponse.json({ ok: true, ...result })
  } catch (error) {
    console.error("First-visit email error:", error)
    captureRouteError(error, { route: "user/first-visit-email" })
    return NextResponse.json({ error: "Failed to queue re-engagement email" }, { status: 500 })
  }
}
