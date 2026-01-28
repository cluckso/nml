import Stripe from "stripe"
import { db } from "./db"
import { PlanType } from "@prisma/client"

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not configured")
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-11-20.acacia",
})

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
  setupFee: number
) {
  const business = await db.business.findUnique({
    where: { id: businessId },
  })

  if (!business) {
    throw new Error("Business not found")
  }

  const productId = getProductIdForPlan(planType)
  const priceId = await getPriceIdForPlan(planType)

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

  const session = await stripe.checkout.sessions.create({
    customer_email: business.users?.[0]?.email,
    line_items: lineItems,
    mode: "subscription",
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/onboarding`,
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

async function getPriceIdForPlan(planType: PlanType): Promise<string> {
  // In production, these would be stored in env or database
  // For now, return placeholder IDs that should be created in Stripe
  const priceIds: Record<PlanType, string> = {
    [PlanType.STARTER]: process.env.STRIPE_PRICE_STARTER || "price_starter",
    [PlanType.PRO]: process.env.STRIPE_PRICE_PRO || "price_pro",
    [PlanType.LOCAL_PLUS]: process.env.STRIPE_PRICE_LOCAL_PLUS || "price_local_plus",
  }
  return priceIds[planType]
}

export async function reportUsageToStripe(businessId: string, minutes: number) {
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

  // Update or create usage record
  const usage = await db.usage.upsert({
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
      reportedToStripe: false,
    },
    update: {
      minutesUsed: {
        increment: minutes,
      },
    },
  })

  // Report to Stripe if not already reported
  if (!usage.reportedToStripe && usage.minutesUsed > 0) {
    try {
      const usageRecord = await stripe.subscriptionItems.createUsageRecord(
        subscription.stripeSubscriptionId,
        {
          quantity: Math.ceil(usage.minutesUsed),
          timestamp: Math.floor(now.getTime() / 1000),
        }
      )

      await db.usage.update({
        where: { id: usage.id },
        data: {
          reportedToStripe: true,
          stripeUsageRecordId: usageRecord.id,
        },
      })
    } catch (error) {
      console.error("Stripe usage reporting error:", error)
      // Don't throw - we'll retry on next call
    }
  }
}

export async function handleStripeWebhook(event: Stripe.Event) {
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
