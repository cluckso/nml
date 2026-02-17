import Stripe from "stripe"
import { db } from "./db"
import { PlanType, SubscriptionStatus } from "@prisma/client"
import { getIncludedMinutes, getOverageMinutes, TRIAL_DAYS } from "./plans"
import { releaseRetellNumber } from "./retell"

/** Map Stripe subscription status to our DB SubscriptionStatus (single place for mapping). */
function stripeSubscriptionStatusToDb(stripeStatus: string): SubscriptionStatus {
  switch (stripeStatus) {
    case "active":
    case "trialing":
      return "ACTIVE"
    case "past_due":
    case "unpaid":
    case "incomplete":
      return "PAST_DUE"
    case "canceled":
    case "incomplete_expired":
      return "CANCELED"
    default:
      return "CANCELED"
  }
}

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
  ELITE: process.env.STRIPE_PRODUCT_ELITE || "prod_elite",
}

// Metered usage price ID for overages ($0.20/min)
export const STRIPE_USAGE_PRICE_ID = process.env.STRIPE_USAGE_PRICE_ID || "price_usage"

/**
 * Create a Stripe Customer for trial (card on file, no charge). Call before creating Business.
 */
export async function createStripeCustomerForTrial(email: string): Promise<string> {
  if (!stripe) throw new Error("STRIPE_SECRET_KEY is not configured.")
  const customer = await stripe.customers.create({ email })
  return customer.id
}

/**
 * Create a Checkout Session in setup mode to collect payment method for trial.
 * No charge. On success, customer has payment method attached; use same customer for upgrade.
 */
export async function createTrialSetupSession(
  businessId: string,
  stripeCustomerId: string,
  appUrl: string = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
): Promise<Stripe.Checkout.Session> {
  if (!stripe) throw new Error("STRIPE_SECRET_KEY is not configured.")
  const baseUrl = appUrl.replace(/\/$/, "")
  return stripe.checkout.sessions.create({
    mode: "setup",
    customer: stripeCustomerId,
    currency: "usd",
    success_url: `${baseUrl}/onboarding?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/trial/start`,
    metadata: { businessId },
    branding_settings: { display_name: "CallGrabbr" },
  } as Stripe.Checkout.SessionCreateParams)
}

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

  // Checkout shows only the plan (no usage charge). We add the metered overage item in the webhook after subscription creation.
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
    {
      price: priceId,
      quantity: 1,
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
  // Use existing Stripe Customer when upgrading from trial so same payment method is charged
  const session = await stripe.checkout.sessions.create({
    customer: business.stripeCustomerId ?? undefined,
    customer_email: business.stripeCustomerId ? undefined : (business.users?.[0]?.email ?? undefined),
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
    branding_settings: { display_name: "CallGrabbr" },
  } as Stripe.Checkout.SessionCreateParams)

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
    case PlanType.ELITE:
      return STRIPE_PRODUCTS.ELITE
  }
}

const PLACEHOLDER_IDS = ["price_starter", "price_pro", "price_local_plus", "price_elite", "price_usage"]

// Monthly price IDs only (STRIPE_PRICE_*). Annual: STRIPE_PRICE_*_ANNUAL for future use.
function getPriceIdForPlan(planType: PlanType): string {
  const priceIds: Record<PlanType, string | undefined> = {
    [PlanType.STARTER]: process.env.STRIPE_PRICE_STARTER,
    [PlanType.PRO]: process.env.STRIPE_PRICE_PRO,
    [PlanType.LOCAL_PLUS]: process.env.STRIPE_PRICE_LOCAL_PLUS,
    [PlanType.ELITE]: process.env.STRIPE_PRICE_ELITE,
  }
  const fallback = planType === "STARTER" ? "price_starter" : planType === "PRO" ? "price_pro" : planType === "ELITE" ? "price_elite" : "price_local_plus"
  const id = priceIds[planType] ?? fallback
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
  })

  if (!business?.planType || !business.stripeSubscriptionId) {
    console.warn(`No subscription found for business ${businessId}`)
    return
  }
  if (business.subscriptionStatus !== "ACTIVE") {
    console.warn(`Subscription not active for business ${businessId}`)
    return
  }

  // Get current billing period
  const now = new Date()
  const billingPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
  const includedMinutes = getIncludedMinutes(business.planType)

  // Fetch current usage before adding this call (to compute overage delta)
  const existing = await db.usage.findUnique({
    where: {
      businessId_billingPeriod: { businessId, billingPeriod },
    },
  })
  const previousTotal = existing?.minutesUsed ?? 0
  const overageBefore = getOverageMinutes(business.planType, previousTotal)
  const overageAfter = getOverageMinutes(business.planType, previousTotal + minutes)
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
      const sub = await stripe.subscriptions.retrieve(business.stripeSubscriptionId, {
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
      const businessId = session.metadata?.businessId as string | undefined
      const planType = session.metadata?.planType as PlanType | undefined

      // Trial flow: setup mode (card on file, no plan) — start trial window
      if (businessId && session.mode === "setup" && !planType) {
        const now = new Date()
        const trialEndsAt = new Date(now.getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000)
        await db.business.update({
          where: { id: businessId },
          data: {
            trialStartedAt: now,
            trialEndsAt,
            status: "ACTIVE",
          },
        })
        break
      }

      if (businessId && planType) {
        const stripeSubscriptionId = session.subscription as string
        const now = new Date()
        const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
        // Store subscription on Business (one row per business)
        await db.business.update({
          where: { id: businessId },
          data: {
            planType,
            stripeSubscriptionId,
            subscriptionStatus: "ACTIVE",
            currentPeriodStart: now,
            currentPeriodEnd: periodEnd,
            cancelAtPeriodEnd: false,
            status: "ACTIVE",
            trialStartedAt: null,
            trialEndsAt: null,
            trialMinutesUsed: 0,
          },
        })
        // Add metered overage item so we can report usage later; not included at checkout so no upfront charge
        try {
          await stripe.subscriptionItems.create({
            subscription: stripeSubscriptionId,
            price: STRIPE_USAGE_PRICE_ID,
          })
        } catch (err) {
          console.error("Failed to add metered overage item to subscription:", err)
        }
      }
      break
    }

    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription
      const newStatus = stripeSubscriptionStatusToDb(subscription.status)
      const businesses = await db.business.findMany({
        where: { stripeSubscriptionId: subscription.id },
        select: { id: true },
      })
      await db.business.updateMany({
        where: { stripeSubscriptionId: subscription.id },
        data: {
          subscriptionStatus: newStatus,
          currentPeriodStart: new Date(subscription.current_period_start * 1000),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          ...(newStatus === "CANCELED" ? { status: "PAUSED" as const } : {}),
        },
      })
      for (const b of businesses) {
        if (newStatus === "CANCELED") await releaseRetellNumber(b.id)
      }
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
        await db.business.updateMany({
          where: { stripeSubscriptionId: invoice.subscription as string },
          data: { subscriptionStatus: "PAST_DUE", status: "PAUSED" },
        })
      }
      break
    }
  }
}
