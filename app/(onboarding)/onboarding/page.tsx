import { requireAuth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { OnboardingClient } from "./OnboardingClient"

export const dynamic = "force-dynamic"

/** Plan-first: user has subscription from checkout. Load business + plan for plan-aware form. */
export default async function OnboardingPage() {
  const user = await requireAuth()

  const business = user.businessId
    ? await db.business.findUnique({
        where: { id: user.businessId },
        include: { subscription: true },
      })
    : null

  if (!business) {
    redirect("/trial/start")
  }

  const planType = business.subscription?.planType ?? null
  // If they just returned from checkout, webhook may not have run yet — still show onboarding
  const initialBusiness = {
    name: business.name,
    address: business.address ?? undefined,
    city: business.city ?? undefined,
    state: business.state ?? undefined,
    zipCode: business.zipCode ?? undefined,
    serviceAreas: business.serviceAreas?.length ? business.serviceAreas : business.city ? [business.city] : undefined,
    // Only use businessLinePhone for "Your existing business line"; Business.phoneNumber is the Retell AI number.
    phoneNumber: business.businessLinePhone ?? undefined,
    businessHours: business.businessHours as { open: string; close: string; days: string[] } | null,
    departments: business.departments,
    crmWebhookUrl: business.crmWebhookUrl ?? undefined,
    forwardToEmail: business.forwardToEmail ?? undefined,
    afterHoursEmergencyPhone: business.afterHoursEmergencyPhone ?? undefined,
  }

  return <OnboardingClient planType={planType} initialBusiness={initialBusiness} />
}
