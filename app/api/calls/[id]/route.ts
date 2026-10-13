import { NextRequest, NextResponse } from "next/server"
import { getAuthUserFromRequest } from "@/lib/auth"
import { db } from "@/lib/db"

type RouteContext = { params: Promise<{ id: string }> }

/** GET /api/calls/[id] — single call detail for dashboard / mobile. */
export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const user = await getAuthUserFromRequest(req)
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    if (!user.businessId) {
      return NextResponse.json({ error: "Business not found" }, { status: 400 })
    }

    const { id } = await context.params
    if (!id) return NextResponse.json({ error: "Missing call id" }, { status: 400 })

    const call = await db.call.findFirst({
      where: { id, businessId: user.businessId },
    })

    if (!call) return NextResponse.json({ error: "Call not found" }, { status: 404 })

    return NextResponse.json({ call })
  } catch (error) {
    console.error("Get call error:", error)
    return NextResponse.json({ error: "Failed to fetch call" }, { status: 500 })
  }
}
