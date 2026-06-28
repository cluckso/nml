import { NextResponse } from "next/server"
import { getAuthUserFromRequest } from "@/lib/auth"
import { db } from "@/lib/db"
import { hasAcceptedTerms } from "@/lib/user-legal"
import type { NextRequest } from "next/server"

/** POST /api/user/accept-terms — record one-time Terms + Privacy acceptance for the signed-in user. */
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const dbUser = await db.user.findUnique({
      where: { id: user.id },
      select: { termsAcceptedAt: true },
    })
    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (hasAcceptedTerms(dbUser)) {
      return NextResponse.json({ ok: true, alreadyAccepted: true })
    }

    const updated = await db.user.update({
      where: { id: user.id },
      data: { termsAcceptedAt: new Date() },
      select: { termsAcceptedAt: true },
    })

    return NextResponse.json({ ok: true, termsAcceptedAt: updated.termsAcceptedAt })
  } catch (error) {
    console.error("Accept terms error:", error)
    return NextResponse.json({ error: "Failed to record acceptance" }, { status: 500 })
  }
}
