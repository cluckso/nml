import { db } from "./db"
import type { Subscription, SubscriptionStatus } from "@prisma/client"

/**
 * Subscription state is read only from the database in this app.
 * Stripe is the source of truth for billing (payments, invoices, usage);
 * Stripe webhooks keep the DB in sync. Never read subscription status from
 * Stripe for access control or UI — use this module or business.subscription.
 */

export type { Subscription, SubscriptionStatus }

/** Get the subscription record for a business (from DB only). */
export async function getSubscriptionForBusiness(
  businessId: string
): Promise<Subscription | null> {
  return db.subscription.findUnique({
    where: { businessId },
  })
}

/** Whether the business has an active paid subscription (from DB only). */
export async function hasActiveSubscription(businessId: string): Promise<boolean> {
  const sub = await getSubscriptionForBusiness(businessId)
  return sub?.status === "ACTIVE"
}

/** Whether the given subscription record counts as "active" for access/trial logic. */
export function isSubscriptionActive(sub: Subscription | null | undefined): boolean {
  return sub?.status === "ACTIVE"
}
