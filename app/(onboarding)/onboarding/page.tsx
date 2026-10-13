import { requireAuth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { OnboardingClient } from "./OnboardingClient"

export const dynamic = "force-dynamic"

/** Placeholder names set at trial/checkout — blank so the owner types the real shop name. */
function resolvePrefillName(
  name: string | null | undefined,
  userName?: string | null
): string | undefined {
  const trimmed = name?.trim()
  if (!trimmed || trimmed === "My Business") return undefined
  if (userName?.trim() && trimmed.toLowerCase() === userName.trim().toLowerCase()) return undefined
  return trimmed
}

function resolvePrefillPhone(phone: string | null | undefined): string | undefined {
  if (!phone?.trim() || phone.startsWith("pending-")) return undefined
  return phone
}

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

  if (business.onboardingComplete) {
    redirect("/dashboard")
  }

  const planType = business.planType ?? null
  const ownerPhone = (user as { phoneNumber?: string | null }).phoneNumber ?? undefined
  const initialBusiness = {
    name: resolvePrefillName(business.name, user.name),
    city: business.city ?? undefined,
    serviceAreas: business.serviceAreas?.length
      ? business.serviceAreas
      : business.city
        ? [business.city]
        : undefined,
    businessHours: business.businessHours as { open: string; close: string; days: string[] } | null,
    phoneNumber: resolvePrefillPhone(business.primaryForwardingNumber),
    ownerPhone,
  }

  return (
    <OnboardingClient
      planType={planType}
      initialIndustry={business.industry ?? null}
      initialBusiness={initialBusiness}
    />
  )
}
