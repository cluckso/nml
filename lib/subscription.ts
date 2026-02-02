import { db } from "./db"
import type { SubscriptionStatus } from "@prisma/client"

/**
 * Subscription state lives on Business (one plan per business).
 * Stripe webhooks keep the DB in sync. Use this module or business.subscriptionStatus for access control.
 */

export type { SubscriptionStatus }

/** Whether the business has an active paid subscription (from DB only). */
export async function hasActiveSubscription(businessId: string): Promise<boolean> {
  const business = await db.business.findUnique({
    where: { id: businessId },
    select: { subscriptionStatus: true },
  })
  return business?.subscriptionStatus === "ACTIVE"
}

/** Whether the given subscription status counts as "active" for access/trial logic. */
export function isSubscriptionActive(
  sub: { subscriptionStatus?: SubscriptionStatus | null } | null | undefined
): boolean {
  return sub?.subscriptionStatus === "ACTIVE"
}
