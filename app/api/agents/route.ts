import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { db } from "@/lib/db"
import { createRetellAgent } from "@/lib/retell"

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth()
    
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

    // Create Retell agent (with plan-based features: hours, departments, voice, appointment capture)
    const { agent_id, phone_number } = await createRetellAgent({
      businessName: business.name,
      industry: business.industry,
      serviceAreas: business.serviceAreas,
      phoneNumber: business.phoneNumber || undefined,
      planType: business.subscription?.planType,
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
    return NextResponse.json(
      { error: "Failed to create agent" },
      { status: 500 }
    )
  }
}
