import { NextRequest, NextResponse } from "next/server"
import { getAuthUserFromRequest } from "@/lib/auth"
import {
  ensureAgencyProfile,
  getAgencyForUser,
  getAgencyInviteLink,
  getAgencyStats,
} from "@/lib/agency"
import { getPlanDisplayName } from "@/lib/plan-labels"
import { db } from "@/lib/db"

/** GET /api/agency — Partner dashboard data */
export async function GET(req: NextRequest) {
  const user = await getAuthUserFromRequest(req)
  if (!user?.businessId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const agency = await getAgencyForUser(user.id)
  if (!agency) {
    return NextResponse.json({ agency: null })
  }

  const stats = await getAgencyStats(agency.id)

  return NextResponse.json({
    agency: {
      id: agency.id,
      name: agency.name,
      inviteCode: agency.inviteCode,
      inviteLink: getAgencyInviteLink(agency.inviteCode),
      commissionRate: agency.commissionRate,
      commissionPercent: Math.round(agency.commissionRate * 100),
      clients: agency.clients.map((c) => ({
        id: c.id,
        businessId: c.businessId,
        name: c.business.name,
        industry: c.business.industry,
        plan: c.business.planType ? getPlanDisplayName(c.business.planType) : null,
        subscriptionStatus: c.business.subscriptionStatus,
        status: c.status,
        commissionCentsTotal: c.commissionCentsTotal,
        joinedAt: c.joinedAt,
      })),
      recentCommissions: agency.commissions.map((c) => ({
        id: c.id,
        businessId: c.businessId,
        amountCents: c.amountCents,
        periodStart: c.periodStart,
        periodEnd: c.periodEnd,
        createdAt: c.createdAt,
      })),
      stats,
    },
  })
}

/** POST /api/agency — Create or update agency profile */
export async function POST(req: NextRequest) {
  const user = await getAuthUserFromRequest(req)
  if (!user?.businessId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const name = typeof body.name === "string" ? body.name.trim() : ""
  if (!name) {
    return NextResponse.json({ error: "Agency name is required" }, { status: 400 })
  }

  const agency = await ensureAgencyProfile(user.businessId, name)

  await db.user.update({
    where: { id: user.id },
    data: { role: "PARTNER" },
  })

  return NextResponse.json({
    success: true,
    agency: {
      id: agency.id,
      name: agency.name,
      inviteCode: agency.inviteCode,
      inviteLink: getAgencyInviteLink(agency.inviteCode),
      commissionRate: agency.commissionRate,
    },
  })
}
