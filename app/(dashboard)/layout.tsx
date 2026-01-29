import { redirect } from "next/navigation"
import { requireAuth } from "@/lib/auth"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

/** Plan-first: no subscription → pricing. Then onboarding, then dashboard. */
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

  // 1. No plan yet → choose plan first (pricing / checkout)
  if (!business?.subscription) {
    redirect("/pricing")
  }

  // 2. No business or onboarding not complete → onboarding
  if (!user.businessId || !business?.onboardingComplete) {
    redirect("/onboarding")
  }

  return <>{children}</>
}
