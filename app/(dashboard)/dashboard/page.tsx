import { requireAuth } from "@/lib/auth"
import { db } from "@/lib/db"
import { getTrialStatus, type TrialStatus } from "@/lib/trial"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CallLog } from "@/components/calls/CallLog"
import { SetupAICard } from "@/components/dashboard/SetupAICard"
import { TrialCard } from "@/components/dashboard/TrialCard"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Phone, Clock, AlertTriangle, ChevronRight } from "lucide-react"

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
  // Only "connected" when this business has its own dedicated agent + number
  const hasAgent = !!(business?.retellAgentId && business?.retellPhoneNumber)
  const phoneNumber = business?.retellPhoneNumber ?? null
  const ownerPhone = user.phoneNumber ?? null

  return (
    <div className="container mx-auto max-w-7xl py-6 px-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{business?.name}</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Dashboard</p>
        </div>
        <nav className="flex items-center gap-1">
          <Link href="/calls">
            <Button variant="ghost" size="sm" className="gap-2">
              <Phone className="h-4 w-4" />
              Calls
            </Button>
          </Link>
          <Link href="/billing">
            <Button variant="ghost" size="sm">Billing</Button>
          </Link>
          <Link href="/settings">
            <Button variant="ghost" size="sm">Settings</Button>
          </Link>
        </nav>
      </div>

      {/* Top row: Trial (if on trial) + Setup */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6" id="trial">
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="border-border/80 bg-card">
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2.5">
                <Phone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total calls</p>
                <p className="text-2xl font-bold tracking-tight">{stats._count}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/80 bg-card">
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2.5">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Minutes used</p>
                <p className="text-2xl font-bold tracking-tight">{Math.ceil(totalMinutes)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/80 bg-card">
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-destructive/10 p-2.5">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Urgent</p>
                <p className="text-2xl font-bold tracking-tight text-destructive">{emergencyCalls}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent calls */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <h2 className="text-base font-semibold">Recent calls</h2>
        <Link href="/calls">
          <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground hover:text-foreground">
            View all
            <ChevronRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
      <CallLog calls={recentCalls} />
    </div>
  )
}
