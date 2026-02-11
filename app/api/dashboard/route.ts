import { NextRequest, NextResponse } from "next/server"
import { getAuthUserFromRequest } from "@/lib/auth"
import { db } from "@/lib/db"
import { getTrialStatus } from "@/lib/trial"

/** Dashboard summary for Flutter (and other API clients). Requires Bearer token or cookie. */
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(req)
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    if (!user.businessId) {
      return NextResponse.json(
        { error: "Complete onboarding first", business: null, recentCalls: [], stats: null, trial: null },
        { status: 200 }
      )
    }

    const [business, recentCalls, stats, trial] = await Promise.all([
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
      getTrialStatus(user.businessId),
    ])

    const emergencyCount = recentCalls.filter((c) => c.emergencyFlag).length

    return NextResponse.json({
      business: business
        ? {
            id: business.id,
            name: business.name,
            primaryForwardingNumber: business.primaryForwardingNumber,
          }
        : null,
      recentCalls,
      stats: {
        totalCalls: stats._count,
        totalMinutes: stats._sum.minutes ?? 0,
        emergencyInRecent: emergencyCount,
      },
      hasAgent: !!business?.primaryForwardingNumber && business.primaryForwardingNumber !== "" && !business.primaryForwardingNumber.startsWith("pending-"),
      trial: trial
        ? {
            isOnTrial: trial.isOnTrial,
            minutesUsed: trial.minutesUsed,
            minutesRemaining: trial.minutesRemaining,
            isExhausted: trial.isExhausted,
            isExpired: trial.isExpired,
            trialEndsAt: trial.trialEndsAt?.toISOString() ?? null,
            daysRemaining: trial.daysRemaining,
          }
        : null,
    })
  } catch (error) {
    console.error("Dashboard API error:", error)
    const message = error instanceof Error ? error.message : "Failed to load dashboard"
    return NextResponse.json(
      {
        error: "Failed to load dashboard",
        ...(process.env.NODE_ENV === "development" && { detail: message }),
      },
      { status: 500 }
    )
  }
}
