import "dotenv/config"
import Stripe from "stripe"

const key = process.env.STRIPE_SECRET_KEY ?? ""
const mode = key.startsWith("sk_live_")
  ? "live"
  : key.startsWith("sk_test_")
    ? "test"
    : "missing/invalid"
const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "(not set)"

const priceVars = [
  "STRIPE_PRICE_STARTER",
  "STRIPE_PRICE_PRO",
  "STRIPE_PRICE_LOCAL_PLUS",
  "STRIPE_PRICE_ELITE",
  "STRIPE_USAGE_PRICE_ID",
] as const

/** Documented live IDs from STRIPE_SETUP.md — used when env vars are unset locally. */
const DOC_LIVE_PRICE_IDS: Record<(typeof priceVars)[number], string> = {
  STRIPE_PRICE_STARTER: "price_1SvQxbDcWEGGVqRpfuSnJfLy",
  STRIPE_PRICE_PRO: "price_1UUf4wDcWEGGVqRpFl2wti3i",
  STRIPE_PRICE_LOCAL_PLUS: "price_1TmpyODcWEGGVqRpHlavDS9m",
  STRIPE_PRICE_ELITE: "price_1TmpyODcWEGGVqRpHlavDS9m",
  STRIPE_USAGE_PRICE_ID: "price_1UUf51DcWEGGVqRpwVWRffzg",
}

const REQUIRED_WEBHOOK_EVENTS = [
  "checkout.session.completed",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "invoice.payment_succeeded",
  "invoice.payment_failed",
  "account.updated",
] as const

async function main() {
  console.log("STRIPE_SECRET_KEY mode:", mode)
  console.log("NEXT_PUBLIC_APP_URL:", appUrl)
  console.log(
    "STRIPE_WEBHOOK_SECRET set:",
    Boolean(process.env.STRIPE_WEBHOOK_SECRET?.startsWith("whsec_"))
  )

  if (!key.startsWith("sk_")) {
    process.exit(1)
  }
  const stripe = new Stripe(key, {
    apiVersion: "2026-09-30.endive" as Stripe.LatestApiVersion,
  })

  for (const v of priceVars) {
    const id =
      process.env[v]?.startsWith("price_") ? process.env[v] : DOC_LIVE_PRICE_IDS[v]
    if (!id?.startsWith("price_")) {
      console.log(`${v}: MISSING or invalid`)
      continue
    }
    const fromEnv = process.env[v]?.startsWith("price_")
    try {
      const p = await stripe.prices.retrieve(id)
      console.log(
        `${v}: OK active=${p.active} livemode=${p.livemode} amount=${p.unit_amount ?? "metered"}${fromEnv ? "" : " (STRIPE_SETUP.md id; set in Vercel env)"}`
      )
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      console.log(`${v}: ERROR ${msg}`)
    }
  }

  const hooks = await stripe.webhookEndpoints.list({ limit: 20 })
  const prodUrl = "https://callgrabbr.com/api/webhooks/stripe"
  const wwwUrl = "https://www.callgrabbr.com/api/webhooks/stripe"
  const matches = hooks.data.filter((h) => h.url === prodUrl || h.url === wwwUrl)
  console.log("Webhook endpoints pointing at callgrabbr.com:", matches.length)
  for (const h of matches) {
    console.log("  -", h.status, h.url, `events=${h.enabled_events.length}`)
  }
  if (matches.length === 0) {
    console.log("No webhook URL for callgrabbr.com — check Stripe Dashboard (Live mode).")
  }
  console.log("All live webhook endpoints:")
  for (const h of hooks.data) {
    console.log("  -", h.status, h.url, `events=${h.enabled_events.length}`)
    if (h.enabled_events.includes("*") || h.enabled_events.length > 10) {
      console.log("    events: (many or all)")
    } else {
      console.log("    events:", h.enabled_events.join(", "))
    }
    const missing = REQUIRED_WEBHOOK_EVENTS.filter((e) => !h.enabled_events.includes(e))
    if (missing.length > 0) {
      console.log("    missing for app handler:", missing.join(", "))
    }
  }

  const recent = await stripe.events.list({ limit: 5, types: ["checkout.session.completed"] })
  console.log("Recent checkout.session.completed events:", recent.data.length)
  for (const ev of recent.data) {
    console.log("  -", ev.created, ev.id, ev.livemode ? "live" : "test")
  }
}

main().catch((e: unknown) => {
  console.error(e instanceof Error ? e.message : e)
  process.exit(1)
})
