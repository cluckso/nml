import { requireAuth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { getIntakeNumberForIndustry, hasIntakeNumberConfigured } from "@/lib/intake-routing"
import { OnboardingClient } from "./OnboardingClient"

export const dynamic = "force-dynamic"

/** Plan-first: user has subscription from checkout. Load business + plan for plan-aware form. */
export default async function OnboardingPage() {
  const user = await requireAuth()

  const business = user.businessId
    ? await db.business.findUnique({
        where: { id: user.businessId },
      })
    : null

  if (!business) {
    redirect("/trial/start")
  }

  const planType = business.planType ?? null
  const intakeNumber = getIntakeNumberForIndustry(business.industry)
  const showIntakeNumber = hasIntakeNumberConfigured() && intakeNumber
  // If they just returned from checkout, webhook may not have run yet — still show onboarding
  const initialBusiness = {
    name: business.name,
    address: business.address ?? undefined,
    city: business.city ?? undefined,
    state: business.state ?? undefined,
    zipCode: business.zipCode ?? undefined,
    serviceAreas: business.serviceAreas?.length ? business.serviceAreas : business.city ? [business.city] : undefined,
    businessHours: business.businessHours as { open: string; close: string; days: string[] } | null,
    departments: business.departments,
    phoneNumber: business.primaryForwardingNumber ?? undefined,
    crmWebhookUrl: business.crmWebhookUrl ?? undefined,
    forwardToEmail: business.forwardToEmail ?? undefined,
    afterHoursEmergencyPhone: business.afterHoursEmergencyPhone ?? undefined,
  }

  return (
    <OnboardingClient
      planType={planType}
      initialIndustry={business?.industry ?? null}
      initialBusiness={initialBusiness}
      intakeNumber={showIntakeNumber ? intakeNumber : null}
    />
  )
}
