import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

/**
 * GET /api/health/data
 * Returns counts of businesses, subscriptions, calls, usage and short hints
 * for why each might be empty. Allowed only in development or with ?secret=DATA_STATUS_SECRET.
 */
export async function GET(req: NextRequest) {
  const isDev = process.env.NODE_ENV === "development"
  const secret = req.nextUrl.searchParams.get("secret")
  const allowed = isDev || (process.env.DATA_STATUS_SECRET && secret === process.env.DATA_STATUS_SECRET)
  if (!allowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const [businessCount, subscriptionCount, callCount, usageCount] = await Promise.all([
    db.business.count(),
    db.subscription.count(),
    db.call.count(),
    db.usage.count(),
  ])

  return NextResponse.json({
    counts: {
      businesses: businessCount,
      subscriptions: subscriptionCount,
      calls: callCount,
      usage: usageCount,
    },
    whyEmpty: {
      businesses:
        "Businesses are created when you start a trial (/trial/start) or complete onboarding. If you went straight to pricing without a trial, you may have a business from onboarding.",
      subscriptions:
        "Subscriptions are created only when Stripe sends checkout.session.completed to your webhook after a successful checkout. Check: (1) You completed a plan purchase. (2) STRIPE_WEBHOOK_SECRET is set. (3) Webhook URL in Stripe Dashboard points to /api/webhooks/stripe. (4) For local dev, run: stripe listen --forward-to localhost:3000/api/webhooks/stripe",
      calls:
        "Calls are created when Retell sends call_ended or call_analysis to your webhook after a call completes. Check: (1) Retell webhook URL points to /api/webhooks/retell. (2) A call was placed to your intake number and the business was resolved (primaryForwardingNumber matches the forwarded-from number). (3) RETELL_WEBHOOK_SECRET is set (or NODE_ENV=development).",
      usage:
        "Usage rows are created when a call completes and the business has an active subscription (the app reports overage minutes to Stripe). So you need both: at least one completed call and an active subscription.",
    },
  })
}
