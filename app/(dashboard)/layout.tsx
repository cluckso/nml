import { redirect } from "next/navigation"
import { requireAuth } from "@/lib/auth"
import { db } from "@/lib/db"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireAuth()

  // If user doesn't have a business and hasn't completed onboarding, redirect to onboarding
  if (!user.businessId) {
    redirect("/onboarding")
  }

  const business = await db.business.findUnique({
    where: { id: user.businessId },
  })

  if (!business?.onboardingComplete) {
    redirect("/onboarding")
  }

  return <>{children}</>
}
