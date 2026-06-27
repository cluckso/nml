import { db } from "./db"
import { AgencyClientStatus, PlanType } from "@prisma/client"
import { MONTHLY_PRICES } from "./plans"
import { randomBytes } from "crypto"

const INVITE_CODE_LENGTH = 8

export function generateAgencyInviteCode(): string {
  return randomBytes(INVITE_CODE_LENGTH / 2).toString("hex").toUpperCase()
}

export async function getAgencyForUser(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      business: {
        include: {
          agencyProfile: {
            include: {
              clients: {
                include: {
                  business: {
                    select: {
                      id: true,
                      name: true,
                      industry: true,
                      planType: true,
                      subscriptionStatus: true,
                      status: true,
                      createdAt: true,
                    },
                  },
                },
                orderBy: { joinedAt: "desc" },
              },
              commissions: {
                orderBy: { createdAt: "desc" },
                take: 12,
              },
            },
          },
        },
      },
    },
  })

  return user?.business?.agencyProfile ?? null
}

export async function ensureAgencyProfile(businessId: string, agencyName: string) {
  const existing = await db.agency.findUnique({ where: { ownerBusinessId: businessId } })
  if (existing) return existing

  let inviteCode = generateAgencyInviteCode()
  for (let i = 0; i < 5; i++) {
    const collision = await db.agency.findUnique({ where: { inviteCode } })
    if (!collision) break
    inviteCode = generateAgencyInviteCode()
  }

  return db.agency.create({
    data: {
      name: agencyName,
      ownerBusinessId: businessId,
      inviteCode,
    },
  })
}

export async function linkBusinessToAgency(inviteCode: string, businessId: string) {
  const agency = await db.agency.findUnique({ where: { inviteCode: inviteCode.trim().toUpperCase() } })
  if (!agency) return null
  if (agency.ownerBusinessId === businessId) return null

  const existing = await db.agencyClient.findUnique({ where: { businessId } })
  if (existing) return existing

  await db.business.update({
    where: { id: businessId },
    data: { agencyId: agency.id },
  })

  return db.agencyClient.create({
    data: {
      agencyId: agency.id,
      businessId,
      status: AgencyClientStatus.ACTIVE,
    },
  })
}

export function getAgencyInviteLink(inviteCode: string, baseUrl?: string) {
  const base = (baseUrl ?? process.env.NEXT_PUBLIC_APP_URL ?? "https://callgrabbr.com").replace(/\/$/, "")
  return `${base}/sign-up?agency=${encodeURIComponent(inviteCode)}`
}

export async function getAgencyStats(agencyId: string) {
  const clients = await db.agencyClient.findMany({
    where: { agencyId, status: AgencyClientStatus.ACTIVE },
    include: {
      business: {
        select: {
          id: true,
          planType: true,
          subscriptionStatus: true,
        },
      },
    },
  })

  const businessIds = clients.map((c) => c.businessId)
  const monthStart = new Date()
  monthStart.setDate(1)
  monthStart.setHours(0, 0, 0, 0)

  const [callStats, leadCount, commissionTotal] = await Promise.all([
    businessIds.length
      ? db.call.aggregate({
          where: { businessId: { in: businessIds }, createdAt: { gte: monthStart } },
          _count: true,
          _sum: { minutes: true },
        })
      : Promise.resolve({ _count: 0, _sum: { minutes: 0 } }),
    businessIds.length
      ? db.call.count({
          where: {
            businessId: { in: businessIds },
            createdAt: { gte: monthStart },
            OR: [
              { callerName: { not: null } },
              { callerPhone: { not: null } },
              { issueDescription: { not: null } },
            ],
          },
        })
      : Promise.resolve(0),
    db.agencyCommission.aggregate({
      where: { agencyId },
      _sum: { amountCents: true },
    }),
  ])

  const activeSubscriptions = clients.filter(
    (c) => c.business.subscriptionStatus === "ACTIVE" && c.business.planType
  )

  const estimatedMonthlyRevenueCents = activeSubscriptions.reduce((sum, c) => {
    const plan = c.business.planType as PlanType
    return sum + (MONTHLY_PRICES[plan] ?? 0) * 100
  }, 0)

  const commissionRate = (await db.agency.findUnique({ where: { id: agencyId } }))?.commissionRate ?? 0.2

  return {
    totalClients: clients.length,
    activeSubscriptions: activeSubscriptions.length,
    callsThisMonth: callStats._count,
    minutesThisMonth: Math.ceil(callStats._sum.minutes ?? 0),
    leadsThisMonth: leadCount,
    totalCommissionCents: commissionTotal._sum.amountCents ?? 0,
    estimatedMonthlyRevenueCents,
    estimatedMonthlyCommissionCents: Math.round(estimatedMonthlyRevenueCents * commissionRate),
  }
}

export async function recordAgencyCommission(
  agencyId: string,
  businessId: string,
  amountCents: number,
  periodStart: Date,
  periodEnd: Date,
  stripeInvoiceId?: string
) {
  const commission = await db.agencyCommission.create({
    data: {
      agencyId,
      businessId,
      amountCents,
      periodStart,
      periodEnd,
      stripeInvoiceId: stripeInvoiceId ?? null,
    },
  })

  await db.agencyClient.update({
    where: { businessId },
    data: { commissionCentsTotal: { increment: amountCents } },
  })

  return commission
}

export async function processAgencyCommissionOnSubscription(businessId: string) {
  const client = await db.agencyClient.findUnique({
    where: { businessId },
    include: { agency: true, business: { select: { planType: true } } },
  })
  if (!client || !client.business.planType) return null

  const monthlyCents = (MONTHLY_PRICES[client.business.planType] ?? 0) * 100
  const commissionCents = Math.round(monthlyCents * client.agency.commissionRate)
  if (commissionCents <= 0) return null

  const now = new Date()
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  return recordAgencyCommission(client.agencyId, businessId, commissionCents, periodStart, periodEnd)
}
