import { NextRequest, NextResponse } from "next/server"
import { getAuthUserFromRequest } from "@/lib/auth"
import { db } from "@/lib/db"
import { provisionAgentAndNumberForBusiness } from "@/lib/retell"

/**
 * POST /api/agents
 * Ensures this business has a dedicated Retell agent and number. If missing, provisions
 * one and saves to the business. Returns the business's AI number to forward to.
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(req)
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    if (!user.businessId) {
      return NextResponse.json({ error: "Business not found" }, { status: 400 })
    }

    const business = await db.business.findUnique({
      where: { id: user.businessId },
      select: {
        id: true,
        retellAgentId: true,
        retellPhoneNumber: true,
        name: true,
        industry: true,
        serviceAreas: true,
        planType: true,
        businessHours: true,
        departments: true,
        afterHoursEmergencyPhone: true,
      },
    })
    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 })
    }

    if (business.retellAgentId && business.retellPhoneNumber) {
      return NextResponse.json({
        success: true,
        phoneNumber: business.retellPhoneNumber,
        message: "Forward your business line to the number below.",
      })
    }

    const provisioned = await provisionAgentAndNumberForBusiness({
      name: business.name,
      industry: business.industry,
      serviceAreas: business.serviceAreas,
      planType: business.planType ?? undefined,
      businessHours: business.businessHours as { open?: string; close?: string; days?: string[] } | undefined,
      departments: business.departments ?? [],
      afterHoursEmergencyPhone: business.afterHoursEmergencyPhone ?? undefined,
    })

    if (!provisioned) {
      console.error("POST /api/agents: provisioning failed for business", business.id)
      return NextResponse.json(
        { error: "We couldn't set up your AI line right now. Please try again in a moment." },
        { status: 503 }
      )
    }

    await db.business.update({
      where: { id: user.businessId },
      data: { retellAgentId: provisioned.agent_id, retellPhoneNumber: provisioned.phone_number },
    })

    return NextResponse.json({
      success: true,
      phoneNumber: provisioned.phone_number,
      message: "Forward your business line to the number below.",
    })
  } catch (error) {
    console.error("Agents API error:", error)
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    )
  }
}
