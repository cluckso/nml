import { requireAdmin } from "@/lib/auth"
import { db } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PlanType, SubscriptionStatus } from "@prisma/client"

export default async function AdminPage() {
  await requireAdmin()

  const [businesses, stats] = await Promise.all([
    db.business.findMany({
      include: {
        users: true,
        subscription: true,
        _count: {
          select: { calls: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    db.business.aggregate({
      _count: true,
    }),
  ])

  const totalRevenue = businesses
    .filter((b) => b.subscription?.status === "ACTIVE")
    .reduce((sum, b) => {
      const planPrice = b.subscription?.planType === PlanType.STARTER ? 99
        : b.subscription?.planType === PlanType.PRO ? 199
        : b.subscription?.planType === PlanType.LOCAL_PLUS ? 299
        : 0
      return sum + planPrice
    }, 0)

  return (
    <div className="container mx-auto max-w-7xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage all businesses and customers</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Total Businesses</CardTitle>
            <CardDescription>All customers</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats._count}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Subscriptions</CardTitle>
            <CardDescription>Currently active</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {businesses.filter((b) => b.subscription?.status === "ACTIVE").length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Revenue</CardTitle>
            <CardDescription>Estimated</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">${totalRevenue}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Businesses</CardTitle>
          <CardDescription>Recent customers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {businesses.map((business) => (
              <div
                key={business.id}
                className="flex justify-between items-center p-4 border rounded-lg"
              >
                <div>
                  <h3 className="font-semibold">{business.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {business.industry} • {business._count.calls} calls
                  </p>
                </div>
                <div className="flex gap-2 items-center">
                  {business.requiresManualSetup && (
                    <Badge variant="outline">Manual Setup</Badge>
                  )}
                  {business.subscription ? (
                    <Badge
                      variant={
                        business.subscription.status === "ACTIVE"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {business.subscription.status}
                    </Badge>
                  ) : (
                    <Badge variant="outline">No Subscription</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
