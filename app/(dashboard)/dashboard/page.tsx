import { requireAuth } from "@/lib/auth"
import { db } from "@/lib/db"
import { getTrialStatus, type TrialStatus } from "@/lib/trial"
import { getIntakeNumberForIndustry, hasIntakeNumberConfigured } from "@/lib/intake-routing"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CallLog } from "@/components/calls/CallLog"
import { SetupAICard } from "@/components/dashboard/SetupAICard"
import { TrialCard } from "@/components/dashboard/TrialCard"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function DashboardPage() {
  const user = await requireAuth()

  if (!user.businessId) {
    return <div>Please complete onboarding</div>
  }

  const defaultTrial: TrialStatus = {
    isOnTrial: false,
    minutesUsed: 0,
    minutesRemaining: 50,
    isExhausted: false,
    isExpired: false,
    trialEndsAt: null,
    daysRemaining: 0,
  }
  let business: Awaited<ReturnType<typeof db.business.findUnique>> = null
  let recentCalls: Awaited<ReturnType<typeof db.call.findMany>> = []
  let stats: { _count: number; _sum: { minutes: number | null } } = { _count: 0, _sum: { minutes: 0 } }
  let trial: TrialStatus = defaultTrial

  try {
    ;[business, recentCalls, stats, trial] = await Promise.all([
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

  const emergencyCalls = recentCalls.filter((c) => c.emergencyFlag).length
  const totalMinutes = stats._sum.minutes || 0
  // Prefer business's dedicated Retell number, fall back to shared intake number
  const phoneNumber = business?.retellPhoneNumber || getIntakeNumberForIndustry(business?.industry ?? null)
  const hasAgent = !!(business?.retellPhoneNumber || hasIntakeNumberConfigured())
  const ownerPhone = user.phoneNumber ?? null

  return (
    <div className="container mx-auto max-w-7xl py-4 px-4">
      {/* Control board header: one line */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <h1 className="text-xl font-bold">
          Dashboard <span className="text-muted-foreground font-normal">— {business?.name}</span>
        </h1>
        <div className="flex items-center gap-2">
          <Link href="/calls">
            <Button variant="ghost" size="sm">Calls</Button>
          </Link>
          <Link href="/billing">
            <Button variant="ghost" size="sm">Billing</Button>
          </Link>
          <Link href="/settings">
            <Button variant="ghost" size="sm">Settings</Button>
          </Link>
        </div>
      </div>

      {/* Top row: Trial (if on trial) + Setup — side by side to fit one screen */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4" id="trial">
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

      {/* Stats row: 3 compact cards */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <Card className="py-3 px-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Calls</p>
          <p className="text-2xl font-bold">{stats._count}</p>
        </Card>
        <Card className="py-3 px-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Minutes</p>
          <p className="text-2xl font-bold">{Math.ceil(totalMinutes)}</p>
        </Card>
        <Card className="py-3 px-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Urgent</p>
          <p className="text-2xl font-bold text-destructive">{emergencyCalls}</p>
        </Card>
      </div>

      {/* Recent calls: compact strip */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Recent Calls</h2>
        <Link href="/calls">
          <Button variant="ghost" size="sm">View all</Button>
        </Link>
      </div>
      <CallLog calls={recentCalls} />
    </div>
  )
}
