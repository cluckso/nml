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

    // Free trial: allow creation only if trial not exhausted and not expired
    const trial = await getTrialStatus(business.id)
    if (trial.isExhausted || trial.isExpired) {
      return NextResponse.json(
        { error: "Free trial used or expired. Upgrade to a plan to continue.", code: "TRIAL_EXHAUSTED" },
        { status: 403 }
      )
    }

    // Create Retell agent and purchase a new AI number (no user-provided number)
    const { getEffectivePlanType } = await import("@/lib/plans")
    const { agent_id, phone_number } = await createRetellAgent({
      businessName: business.name,
      industry: business.industry,
      serviceAreas: business.serviceAreas,
      planType: getEffectivePlanType(business.subscription?.planType ?? null),
      businessHours: (business.businessHours as { open?: string; close?: string; days?: string[] } | null) ?? undefined,
      departments: business.departments?.length ? business.departments : undefined,
      afterHoursEmergencyPhone: business.afterHoursEmergencyPhone ?? undefined,
    })

    // Update business with agent ID and Retell-assigned AI number when we have it
    await db.business.update({
      where: { id: business.id },
      data: {
        retellAgentId: agent_id,
        ...(phone_number != null && phone_number !== "" ? { phoneNumber: phone_number } : {}),
      },
    })

    return NextResponse.json({
      success: true,
      agentId: agent_id,
      phoneNumber: phone_number ?? null,
      ...(phone_number == null || phone_number === ""
        ? { warning: "Agent created but we couldn't purchase a phone number. Check Retell billing and RETELL_DEFAULT_AREA_CODE, or add a number in the Retell dashboard." }
        : {}),
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
