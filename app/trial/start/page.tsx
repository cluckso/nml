import { redirect } from "next/navigation"
import { requireAuth } from "@/lib/auth"
import { db } from "@/lib/db"
import { Industry } from "@prisma/client"

/**
 * Start free trial: ensure user has a business (create minimal one if not), then send to onboarding or dashboard.
 * After onboarding they land on dashboard with 100 free trial minutes.
 */
export default async function TrialStartPage() {
  const user = await requireAuth()

  if (!user.businessId) {
    const business = await db.business.create({
      data: {
        name: "My Business",
        industry: Industry.GENERIC,
        onboardingComplete: false,
        users: { connect: { id: user.id } },
      },
    })
    await db.user.update({
      where: { id: user.id },
      data: { businessId: business.id },
    })
    redirect("/onboarding")
  }

  const business = await db.business.findUnique({
    where: { id: user.businessId! },
  })
  if (business?.onboardingComplete) {
    redirect("/dashboard")
  }
  redirect("/onboarding")
}
