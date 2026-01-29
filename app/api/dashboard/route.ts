import { NextRequest, NextResponse } from "next/server"
import { getAuthUserFromRequest } from "@/lib/auth"
import { db } from "@/lib/db"

/** Dashboard summary for Flutter (and other API clients). Requires Bearer token or cookie. */
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(req)
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    if (!user.businessId) {
      return NextResponse.json(
        { error: "Complete onboarding first", business: null, recentCalls: [], stats: null },
        { status: 200 }
      )
    }

    const [business, recentCalls, stats] = await Promise.all([
      db.business.findUnique({
        where: { id: user.businessId },
      }),
      db.call.findMany({
        where: { businessId: user.businessId },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      db.call.aggregate({
        where: { businessId: user.businessId },
        _count: true,
        _sum: { minutes: true },
      }),
    ])

    const emergencyCount = recentCalls.filter((c) => c.emergencyFlag).length

    return NextResponse.json({
      business: business
        ? {
            id: business.id,
            name: business.name,
            phoneNumber: business.phoneNumber,
            retellAgentId: business.retellAgentId,
          }
        : null,
      recentCalls,
      stats: {
        totalCalls: stats._count,
        totalMinutes: stats._sum.minutes ?? 0,
        emergencyInRecent: emergencyCount,
      },
      hasAgent: !!business?.retellAgentId,
    })
  } catch (error) {
    console.error("Dashboard API error:", error)
    return NextResponse.json(
      { error: "Failed to load dashboard" },
      { status: 500 }
    )
  }
}
