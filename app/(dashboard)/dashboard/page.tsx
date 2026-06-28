import { requireAuth } from "@/lib/auth"
import { db } from "@/lib/db"
import { getTrialStatus, type TrialStatus } from "@/lib/trial"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CallLog } from "@/components/calls/CallLog"
import { SetupAICard } from "@/components/dashboard/SetupAICard"
import { TrialCard } from "@/components/dashboard/TrialCard"
import { ROICard } from "@/components/dashboard/ROICard"
import { ReferralCard } from "@/components/dashboard/ReferralCard"
import { ReportingCard } from "@/components/dashboard/ReportingCard"
import { hasWeeklyReports, getEffectivePlanType, FREE_TRIAL_MINUTES, getIncludedMinutes } from "@/lib/plans"
import { getPlanUsageNudge } from "@/lib/plan-usage"
import { UsageUpgradeNudge } from "@/components/billing/UsageUpgradeNudge"
import { subDays } from "date-fns"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Phone, Clock, AlertTriangle, ChevronRight } from "lucide-react"
import { DashboardNav } from "@/components/dashboard/DashboardNav"
import {
  DashboardPageHeader,
  DashboardSection,
  DashboardStatCard,
} from "@/components/dashboard/DashboardShell"

export default async function DashboardPage() {
  const user = await requireAuth()

  if (!user.businessId) {
    return <div>Please complete onboarding</div>
  }

  const defaultTrial: TrialStatus = {
    isOnTrial: false,
    minutesUsed: 0,
    minutesRemaining: FREE_TRIAL_MINUTES,
    isExhausted: false,
    isExpired: false,
    trialEndsAt: null,
    daysRemaining: 0,
  }
  let business: Awaited<ReturnType<typeof db.business.findUnique>> = null
  let recentCalls: Awaited<ReturnType<typeof db.call.findMany>> = []
  let stats: { _count: number; _sum: { minutes: number | null } } = { _count: 0, _sum: { minutes: 0 } }
  let monthlyLeads = 0
  let trial: TrialStatus = defaultTrial
  let weekReporting: { weekCalls: number; weekMinutes: number; leadsByTag: { tag: string; count: number }[] } | null = null
  let monthlyMinutesUsed = 0

  const billingPeriod = new Date().toISOString().slice(0, 7)
  const monthStart = new Date()
  monthStart.setDate(1)
  monthStart.setHours(0, 0, 0, 0)

  try {
    ;[business, recentCalls, stats, trial, monthlyLeads, monthlyMinutesUsed] = await Promise.all([
      db.business.findUnique({
        where: { id: user.businessId },
      }),
      db.call.findMany({
        where: { businessId: user.businessId },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      db.call.aggregate({
        where: { businessId: user.businessId },
        _count: true,
        _sum: { minutes: true },
      }),
      getTrialStatus(user.businessId),
      db.call.count({
        where: {
          businessId: user.businessId,
          createdAt: { gte: monthStart },
          OR: [
            { callerName: { not: null } },
            { callerPhone: { not: null } },
            { issueDescription: { not: null } },
          ],
        },
      }),
      db.usage
        .findFirst({
          where: { businessId: user.businessId, billingPeriod },
          select: { minutesUsed: true },
        })
        .then((row) => row?.minutesUsed ?? 0),
    ])
  } catch (err) {
    console.error("Dashboard page data fetch error:", err)
    return (
      <div className="container mx-auto max-w-7xl py-4 px-4">
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle>Unable to load dashboard</CardTitle>
            <CardDescription>
              There was a problem loading your data. This is often due to a temporary database connection limit — try again in a moment. If it keeps happening, ensure your app uses the Transaction pooler (port 6543) for the database. See DATABASE.md.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard">
              <Button variant="outline">Retry</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (business && hasWeeklyReports(getEffectivePlanType(business.planType))) {
    const weekStart = subDays(new Date(), 7)
    const weekCalls = await db.call.findMany({
      where: { businessId: user.businessId, createdAt: { gte: weekStart } },
      select: { minutes: true, leadTag: true },
    })
    const tagMap = weekCalls.reduce(
      (acc, c) => {
        const tag = c.leadTag || "GENERAL"
        acc[tag] = (acc[tag] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )
    weekReporting = {
      weekCalls: weekCalls.length,
      weekMinutes: weekCalls.reduce((sum, c) => sum + c.minutes, 0),
      leadsByTag: Object.entries(tagMap)
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count),
    }
  }

  const emergencyCalls = recentCalls.filter((c) => c.emergencyFlag).length
  const totalMinutes = stats._sum.minutes || 0
  // Only "connected" when this business has its own dedicated agent + number
  const hasAgent = !!(business?.retellAgentId && business?.retellPhoneNumber)
  const phoneNumber = business?.retellPhoneNumber ?? null
  const ownerPhone = user.phoneNumber ?? null

  const effectivePlan = business?.planType ? getEffectivePlanType(business.planType) : null
  const minutesIncluded = trial.isOnTrial
    ? FREE_TRIAL_MINUTES
    : effectivePlan
      ? getIncludedMinutes(effectivePlan)
      : 0
  const minutesUsedForNudge = trial.isOnTrial ? trial.minutesUsed : monthlyMinutesUsed
  const usageNudge = getPlanUsageNudge({
    planType: effectivePlan,
    minutesUsed: minutesUsedForNudge,
    minutesIncluded,
    isOnTrial: trial.isOnTrial,
  })

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-background via-background to-muted/20">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <DashboardPageHeader title={business?.name ?? "Dashboard"} subtitle="Overview of calls, leads, and setup">
          <DashboardNav />
        </DashboardPageHeader>

        {usageNudge && (
          <div className="mb-8">
            <UsageUpgradeNudge nudge={usageNudge} />
          </div>
        )}

        {/* Top row: Trial (if on trial) + Setup */}
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2" id="trial">
          {trial.isOnTrial && (
            <div id="trial-card">
              <TrialCard trial={trial} hasAgent={hasAgent} />
            </div>
          )}
          <div className={trial.isOnTrial ? "" : "md:col-span-2"} id="setup">
            <SetupAICard
              hasAgent={hasAgent}
              phoneNumber={phoneNumber}
              businessName={business?.name ?? "your business"}
              ownerPhone={ownerPhone}
              trialStatus={trial}
              compact
            />
          </div>
        </div>

        {/* Stats row */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <DashboardStatCard label="Total calls" value={stats._count} icon={Phone} />
          <DashboardStatCard label="Minutes used" value={Math.ceil(totalMinutes)} icon={Clock} />
          <DashboardStatCard label="Urgent" value={emergencyCalls} icon={AlertTriangle} tone="danger" />
        </div>

        {business?.industry && (
          <div className="mb-8">
            <ROICard leadsThisMonth={monthlyLeads} industry={business.industry} />
          </div>
        )}

        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2">
          {weekReporting && (
            <ReportingCard
              weekCalls={weekReporting.weekCalls}
              weekMinutes={weekReporting.weekMinutes}
              leadsByTag={weekReporting.leadsByTag}
            />
          )}
          <ReferralCard />
        </div>

        <DashboardSection
          title="Recent calls"
          action={
            <Link href="/calls">
              <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground hover:text-foreground">
                View all
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          }
        >
          <div className="glass-card overflow-hidden rounded-xl">
            <CallLog calls={recentCalls} />
          </div>
        </DashboardSection>
      </div>
    </div>
  )
}
