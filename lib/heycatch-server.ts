import "server-only"

import { analytics } from "@heycatch/sdk"
import type { PlanType } from "@prisma/client"
import { db } from "@/lib/db"
import { getPlanDisplayName } from "@/lib/plan-labels"

analytics.init({
  projectKey: "hck_pk_3uUHMRH03dhr5PXfK-q07Tn5yhD5tMeV",
})

export { analytics as heycatchAnalytics }

export async function getHeyCatchIdentityForBusiness(businessId: string) {
  const owner = await db.user.findFirst({
    where: { businessId, supabaseUserId: { not: null } },
    select: { supabaseUserId: true, email: true, name: true },
    orderBy: { createdAt: "asc" },
  })
  if (!owner?.supabaseUserId) return null
  return {
    userId: owner.supabaseUserId,
    email: owner.email,
    name: owner.name ?? undefined,
  }
}

export async function trackHeyCatchBusinessOutcome(options: {
  businessId: string
  event: string
  plan?: PlanType | "trial"
  request?: Request
}) {
  const identity = await getHeyCatchIdentityForBusiness(options.businessId)
  if (!identity) return
  const plan =
    options.plan === "trial"
      ? "trial"
      : options.plan
        ? getPlanDisplayName(options.plan)
        : undefined
  await analytics.setIdentity(identity.userId, {
    email: identity.email,
    ...(identity.name ? { name: identity.name } : {}),
    ...(plan ? { plan } : {}),
  })
  await analytics.trackEvent(
    options.event,
    plan ? { plan } : undefined,
    options.request
      ? { userId: identity.userId, request: options.request }
      : { userId: identity.userId }
  )
}
