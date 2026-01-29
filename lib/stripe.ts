import Stripe from "stripe"
import { db } from "./db"
import { PlanType } from "@prisma/client"
import { getIncludedMinutes, getOverageMinutes } from "./plans"

/** Only initialized when STRIPE_SECRET_KEY is set — app works without Stripe (e.g. dev before keys). */
export const stripe: Stripe | null = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      // Pin API version for stripe v17 (v20 removed createUsageRecord; migrate to Billing Meters later)
      apiVersion: "2025-02-24.acacia",
    })
  : null

// Stripe Product IDs (create these in Stripe dashboard or via API)
export const STRIPE_PRODUCTS = {
  STARTER: process.env.STRIPE_PRODUCT_STARTER || "prod_starter",
  PRO: process.env.STRIPE_PRODUCT_PRO || "prod_pro",
  LOCAL_PLUS: process.env.STRIPE_PRODUCT_LOCAL_PLUS || "prod_local_plus",
}

// Metered usage price ID for overages ($0.10/min)
export const STRIPE_USAGE_PRICE_ID = process.env.STRIPE_USAGE_PRICE_ID || "price_usage"

export async function createCheckoutSession(
  businessId: string,
  planType: PlanType,
  setupFee: number,
  appUrl: string = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
) {
  if (!stripe) {
    throw new Error("STRIPE_SECRET_KEY is not configured. Add it to .env to enable billing.")
  }
  const business = await db.business.findUnique({
    where: { id: businessId },
    include: { users: { take: 1 } },
  })

  if (!business) {
    throw new Error("Business not found")
  }

  const priceId = getPriceIdForPlan(planType)
  if (PLACEHOLDER_IDS.includes(STRIPE_USAGE_PRICE_ID) || !STRIPE_USAGE_PRICE_ID.startsWith("price_")) {
    throw new Error(
      "Stripe usage (overage) price ID is not set. Set STRIPE_USAGE_PRICE_ID in .env (value must start with price_)"
    )
  }

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
    {
      price: priceId,
      quantity: 1,
    },
    // Metered overage ($0.10/min); subscription must have this item so we can report usage.
    // For usage_type: metered, Stripe requires quantity to be omitted (not 0 or 1).
    {
      price: STRIPE_USAGE_PRICE_ID,
    },
  ]

  // Add setup fee if applicable
  if (setupFee > 0) {
    lineItems.push({
      price_data: {
        currency: "usd",
        product_data: {
          name: "Setup Fee",
        },
        unit_amount: setupFee * 100, // Convert to cents
      },
      quantity: 1,
    })
  }

  const baseUrl = appUrl.replace(/\/$/, "")
  const session = await stripe.checkout.sessions.create({
    customer_email: business.users?.[0]?.email ?? undefined,
    line_items: lineItems,
    mode: "subscription",
    success_url: `${baseUrl}/onboarding?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/pricing`,
    metadata: {
      businessId,
      planType,
    },
    subscription_data: {
      metadata: {
        businessId,
        planType,
      },
    },
  })

  return session
}

function getProductIdForPlan(planType: PlanType): string {
  switch (planType) {
    case PlanType.STARTER:
      return STRIPE_PRODUCTS.STARTER
    case PlanType.PRO:
      return STRIPE_PRODUCTS.PRO
    case PlanType.LOCAL_PLUS:
      return STRIPE_PRODUCTS.LOCAL_PLUS
  }
}

const PLACEHOLDER_IDS = ["price_starter", "price_pro", "price_local_plus", "price_usage"]

// Monthly price IDs only (STRIPE_PRICE_*). Annual: STRIPE_PRICE_*_ANNUAL for future use.
function getPriceIdForPlan(planType: PlanType): string {
  const priceIds: Record<PlanType, string | undefined> = {
    [PlanType.STARTER]: process.env.STRIPE_PRICE_STARTER,
    [PlanType.PRO]: process.env.STRIPE_PRICE_PRO,
    [PlanType.LOCAL_PLUS]: process.env.STRIPE_PRICE_LOCAL_PLUS,
  }
  const id = priceIds[planType] || (planType === "STARTER" ? "price_starter" : planType === "PRO" ? "price_pro" : "price_local_plus")
  if (PLACEHOLDER_IDS.includes(id) || !id.startsWith("price_")) {
    throw new Error(
      `Stripe price ID for ${planType} is not set. Set STRIPE_PRICE_${planType} in .env (value must start with price_)`
    )
  }
  return id
}

export async function reportUsageToStripe(businessId: string, minutes: number) {
  if (!stripe) return
  const business = await db.business.findUnique({
    where: { id: businessId },
    include: { subscription: true },
  })

  if (!business?.subscription) {
    console.warn(`No subscription found for business ${businessId}`)
    return
  }

  const subscription = business.subscription
  if (subscription.status !== "ACTIVE") {
    console.warn(`Subscription not active for business ${businessId}`)
    return
  }

  // Get current billing period
  const now = new Date()
  const billingPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
  const includedMinutes = getIncludedMinutes(subscription.planType)

  // Fetch current usage before adding this call (to compute overage delta)
  const existing = await db.usage.findUnique({
    where: {
      businessId_billingPeriod: { businessId, billingPeriod },
    },
  })
  const previousTotal = existing?.minutesUsed ?? 0
  const overageBefore = getOverageMinutes(subscription.planType, previousTotal)
  const overageAfter = getOverageMinutes(subscription.planType, previousTotal + minutes)
  const incrementalOverage = Math.max(0, overageAfter - overageBefore)

  // Update or create usage record (total minutes for our records)
  await db.usage.upsert({
    where: {
      businessId_billingPeriod: {
        businessId,
        billingPeriod,
      },
    },
    create: {
      businessId,
      minutesUsed: minutes,
      billingPeriod,
      reportedToStripe: incrementalOverage === 0,
    },
    update: {
      minutesUsed: {
        increment: minutes,
      },
    },
  })

  // Report only overage minutes to Stripe (incremental); needs subscription item id for metered price
  if (incrementalOverage > 0) {
    try {
      const sub = await stripe.subscriptions.retrieve(subscription.stripeSubscriptionId, {
        expand: ["items.data.price"],
      })
      const overageItem = sub.items.data.find(
        (item) => (item.price as Stripe.Price).id === STRIPE_USAGE_PRICE_ID
      )
      if (overageItem) {
        await stripe.subscriptionItems.createUsageRecord(overageItem.id, {
          quantity: Math.ceil(incrementalOverage),
          timestamp: Math.floor(now.getTime() / 1000),
        })
      }
    } catch (error) {
      console.error("Stripe usage reporting error:", error)
      // Don't throw - we'll retry on next call
    }
  }
}

export async function handleStripeWebhook(event: Stripe.Event) {
  if (!stripe) return
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session
      const businessId = session.metadata?.businessId
      const planType = session.metadata?.planType as PlanType

      if (businessId && planType) {
        await db.subscription.create({
          data: {
            businessId,
            stripeSubscriptionId: session.subscription as string,
            planType,
            status: "ACTIVE",
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          },
        })
        // Reactivate business if it was paused (e.g. after free trial exhausted)
        await db.business.update({
          where: { id: businessId },
          data: { isActive: true },
        })
      }
      break
    }

    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription
      await db.subscription.update({
        where: { stripeSubscriptionId: subscription.id },
        data: {
          status: subscription.status === "active" ? "ACTIVE" : "CANCELED",
          currentPeriodStart: new Date(subscription.current_period_start * 1000),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
        },
      })
      break
    }

    case "invoice.payment_succeeded": {
      // Handle successful payment
      break
    }

    case "invoice.payment_failed": {
      // Pause service on payment failure
      const invoice = event.data.object as Stripe.Invoice
      if (invoice.subscription) {
        const subscription = await db.subscription.findUnique({
          where: { stripeSubscriptionId: invoice.subscription as string },
        })
        if (subscription) {
          await db.subscription.update({
            where: { id: subscription.id },
            data: { status: "PAST_DUE" },
          })
          // Optionally pause the business
          await db.business.update({
            where: { id: subscription.businessId },
            data: { isActive: false },
          })
        }
      }
      break
    }
  }
}
