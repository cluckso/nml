import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getAuthUserFromRequest } from "@/lib/auth"

/**
 * Debug endpoint to check business status and recent calls.
 * Requires authentication. Use this to diagnose why calls aren't appearing.
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's business
    const business = user.businessId
      ? await db.business.findUnique({
          where: { id: user.businessId },
          select: {
            id: true,
            name: true,
            primaryForwardingNumber: true,
            status: true,
            subscriptionStatus: true,
            trialStartedAt: true,
            trialEndsAt: true,
            trialMinutesUsed: true,
            testCallVerifiedAt: true,
            onboardingComplete: true,
          },
        })
      : null

    // Get recent calls for this business
    const recentCalls = user.businessId
      ? await db.call.findMany({
          where: { businessId: user.businessId },
          orderBy: { createdAt: "desc" },
          take: 5,
          select: {
            id: true,
            retellCallId: true,
            callerPhone: true,
            aiNumberAnswered: true,
            duration: true,
            minutes: true,
            createdAt: true,
          },
        })
      : []

    // Get total call count
    const callCount = user.businessId
      ? await db.call.count({ where: { businessId: user.businessId } })
      : 0

    // Check environment variables (without revealing secrets)
    const envCheck = {
      RETELL_API_KEY: !!process.env.RETELL_API_KEY ? "SET" : "MISSING",
      RETELL_WEBHOOK_SECRET: !!process.env.RETELL_WEBHOOK_SECRET ? "SET" : "MISSING",
      RETELL_AGENT_ID: process.env.RETELL_AGENT_ID ? "SET" : "MISSING",
      NML_INTAKE_NUMBER_SERVICE: process.env.NML_INTAKE_NUMBER_SERVICE || process.env.RETELL_INTAKE_SERVICE || "NOT SET",
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        businessId: user.businessId,
      },
      business,
      calls: {
        total: callCount,
        recent: recentCalls,
      },
      env: envCheck,
      diagnosis: {
        hasBusinessId: !!user.businessId,
        businessFound: !!business,
        businessStatus: business?.status,
        isActive: business?.status === "ACTIVE",
        hasPrimaryForwardingNumber: !!business?.primaryForwardingNumber,
        onboardingComplete: business?.onboardingComplete,
        testCallVerified: !!business?.testCallVerifiedAt,
      },
      troubleshooting: business?.status !== "ACTIVE"
        ? "Business status is NOT ACTIVE. Calls won't be connected. Check if trial expired or was paused."
        : !business?.primaryForwardingNumber
        ? "No primaryForwardingNumber set. The webhook can't resolve this business from incoming calls."
        : callCount === 0
        ? "No calls recorded. Check: 1) Retell webhook URL is set correctly, 2) RETELL_WEBHOOK_SECRET matches, 3) Call forwarding is set up at your carrier."
        : "Business looks configured correctly. Calls should be recorded.",
    })
  } catch (error) {
    console.error("Debug endpoint error:", error)
    return NextResponse.json({ 
      error: "Failed to fetch debug info",
      details: error instanceof Error ? error.message : String(error),
    }, { status: 500 })
  }
}
