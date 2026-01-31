import { requireAuth } from "@/lib/auth"
import { db } from "@/lib/db"
import { getTrialStatus } from "@/lib/trial"
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

  const [business, recentCalls, stats, trial] = await Promise.all([
    db.business.findUnique({
      where: { id: user.businessId },
    }),
    db.call.findMany({
      where: { businessId: user.businessId },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    db.call.aggregate({
      where: { businessId: user.businessId },
      _count: true,
      _sum: { minutes: true },
    }),
    getTrialStatus(user.businessId),
  ])

  const emergencyCalls = recentCalls.filter((c) => c.emergencyFlag).length
  const totalMinutes = stats._sum.minutes || 0
  const sharedNumber =
    process.env.NML_SHARED_INTAKE_NUMBER ?? process.env.RETELL_SHARED_NUMBER ?? null
  const hasAgent = !!sharedNumber
  const phoneNumber = sharedNumber
  const ownerPhone = user.phoneNumber ?? null

  return (
    <div className="container mx-auto max-w-7xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {business?.name}
        </p>
      </div>

      {trial.isOnTrial && (
        <div className="mb-8" id="trial">
          <TrialCard trial={trial} hasAgent={hasAgent} />
        </div>
      )}

      <div className="mb-8" id="setup">
        <SetupAICard
          hasAgent={hasAgent}
          phoneNumber={phoneNumber}
          businessName={business?.name ?? "your business"}
          ownerPhone={ownerPhone}
          trialStatus={trial}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Total Calls</CardTitle>
            <CardDescription>All time</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats._count}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Minutes</CardTitle>
            <CardDescription>All time</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{Math.ceil(totalMinutes)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Emergency Calls</CardTitle>
            <CardDescription>Recent calls</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-destructive">{emergencyCalls}</p>
          </CardContent>
        </Card>
      </div>

      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Recent Calls</h2>
        <Link href="/calls">
          <Button variant="outline">View All</Button>
        </Link>
      </div>

      <CallLog calls={recentCalls} />
    </div>
  )
}
