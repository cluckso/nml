import { NextRequest, NextResponse } from "next/server"
import { getAuthUserFromRequest } from "@/lib/auth"
import { db } from "@/lib/db"

/** POST /api/push-token — Save FCM push token for mobile app notifications */
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(req)
    if (!user?.businessId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const token = typeof body.token === "string" ? body.token.trim() : ""
    const platform = typeof body.platform === "string" ? body.platform.trim() : "android"

    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 })
    }

    await db.user.update({
      where: { id: user.id },
      data: { pushToken: token, pushPlatform: platform },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Push token save error:", error)
    return NextResponse.json({ error: "Failed to save token" }, { status: 500 })
  }
}
