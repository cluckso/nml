import { redirect } from "next/navigation"
import { requireAuth } from "@/lib/auth"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

/** Dashboard: require business + onboarding. Trial (no subscription) or paid both allowed. */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireAuth()

  const business = user.businessId
    ? await db.business.findUnique({
        where: { id: user.businessId },
        include: { subscription: true },
      })
    : null

  // No business → start trial (creates business) or choose plan
  if (!user.businessId || !business) {
    redirect("/trial/start")
  }

  // Onboarding not complete → onboarding
  if (!business.onboardingComplete) {
    redirect("/onboarding")
  }

  return <>{children}</>
}
