import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

/**
 * Simple debug endpoint - no auth required. Shows general system status.
 * DELETE THIS FILE after debugging is complete.
 */
export async function GET(req: NextRequest) {
  try {
    // Test database connection
    const dbTest = await db.$queryRaw`SELECT 1 as test`
    
    // Count businesses and calls
    const [businessCount, callCount, activeBusinesses] = await Promise.all([
      db.business.count(),
      db.call.count(),
      db.business.count({ where: { status: "ACTIVE" } }),
    ])
    
    // Get most recent call (if any)
    const recentCall = await db.call.findFirst({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        retellCallId: true,
        createdAt: true,
        businessId: true,
        forwardedFromNumber: true,
      },
    })
    
    // Check env vars
    const envStatus = {
      RETELL_API_KEY: !!process.env.RETELL_API_KEY,
      RETELL_WEBHOOK_SECRET: !!process.env.RETELL_WEBHOOK_SECRET,
      RETELL_AGENT_ID: !!process.env.RETELL_AGENT_ID,
      DATABASE_URL: !!process.env.DATABASE_URL,
    }

    return NextResponse.json({
      status: "ok",
      database: "connected",
      counts: {
        businesses: businessCount,
        activeBusinesses,
        calls: callCount,
      },
      mostRecentCall: recentCall ? {
        id: recentCall.id,
        retellCallId: recentCall.retellCallId,
        createdAt: recentCall.createdAt,
        forwardedFromNumber: recentCall.forwardedFromNumber,
      } : null,
      env: envStatus,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Debug status error:", error)
    return NextResponse.json({
      status: "error",
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    }, { status: 500 })
  }
}
