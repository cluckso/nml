import { NextRequest, NextResponse } from "next/server"
import { getAuthUserFromRequest } from "@/lib/auth"
import { db } from "@/lib/db"
import { createRetellAgent } from "@/lib/retell"
import { getTrialStatus } from "@/lib/trial"

export async function POST(req: NextRequest) {
  try {
    if (!process.env.RETELL_API_KEY) {
      return NextResponse.json(
        { error: "Call assistant is not configured. Set RETELL_API_KEY in your environment." },
        { status: 503 }
      )
    }

    const user = await getAuthUserFromRequest(req)
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    
    if (!user.businessId) {
      return NextResponse.json(
        { error: "Business not found" },
        { status: 400 }
      )
    }

    const business = await db.business.findUnique({
      where: { id: user.businessId },
      include: { subscription: true },
    })

    if (!business) {
      return NextResponse.json(
        { error: "Business not found" },
        { status: 404 }
      )
    }

    if (business.retellAgentId) {
      return NextResponse.json(
        { error: "Agent already exists", agentId: business.retellAgentId },
        { status: 400 }
      )
    }

    // Free trial: allow creation only if trial not exhausted
    const trial = await getTrialStatus(business.id)
    if (trial.isExhausted) {
      return NextResponse.json(
        { error: "Free trial minutes used. Upgrade to a plan to continue.", code: "TRIAL_EXHAUSTED" },
        { status: 403 }
      )
    }

    // Create Retell agent (with plan-based features; in dev all features enabled for testing)
    const { getEffectivePlanType } = await import("@/lib/plans")
    const { agent_id, phone_number } = await createRetellAgent({
      businessName: business.name,
      industry: business.industry,
      serviceAreas: business.serviceAreas,
      phoneNumber: business.phoneNumber || undefined,
      planType: getEffectivePlanType(business.subscription?.planType ?? null),
      businessHours: (business.businessHours as { open?: string; close?: string; days?: string[] } | null) ?? undefined,
      departments: business.departments?.length ? business.departments : undefined,
      afterHoursEmergencyPhone: business.afterHoursEmergencyPhone ?? undefined,
    })

    // Update business with agent ID
    await db.business.update({
      where: { id: business.id },
      data: {
        retellAgentId: agent_id,
        phoneNumber: phone_number || business.phoneNumber,
      },
    })

    return NextResponse.json({
      success: true,
      agentId: agent_id,
      phoneNumber: phone_number,
    })
  } catch (error) {
    console.error("Agent creation error:", error)
    const message =
      error instanceof Error
        ? error.message
        : "Failed to create agent"
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}
