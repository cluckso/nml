import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { db } from "@/lib/db"
import { Industry } from "@prisma/client"
import { isComplexSetup } from "@/lib/industries"

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await req.json()

    const { industry, businessInfo } = body

    if (!industry || !businessInfo) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Check if complex setup is needed
    const requiresManualSetup = isComplexSetup({
      industry: industry as Industry,
      serviceAreas: businessInfo.city ? [businessInfo.city] : [],
    })

    // Create or update business
    const business = await db.business.upsert({
      where: { id: user.businessId || "new" },
      create: {
        name: businessInfo.name,
        industry: industry as Industry,
        address: businessInfo.address,
        city: businessInfo.city,
        state: businessInfo.state,
        zipCode: businessInfo.zipCode,
        onboardingComplete: !requiresManualSetup,
        requiresManualSetup,
        users: {
          connect: { id: user.id },
        },
      },
      update: {
        name: businessInfo.name,
        industry: industry as Industry,
        address: businessInfo.address,
        city: businessInfo.city,
        state: businessInfo.state,
        zipCode: businessInfo.zipCode,
        onboardingComplete: !requiresManualSetup,
        requiresManualSetup,
      },
    })

    // Update user's businessId
    await db.user.update({
      where: { id: user.id },
      data: { businessId: business.id },
    })

    return NextResponse.json({ success: true, business })
  } catch (error) {
    console.error("Onboarding error:", error)
    return NextResponse.json(
      { error: "Failed to save onboarding data" },
      { status: 500 }
    )
  }
}
