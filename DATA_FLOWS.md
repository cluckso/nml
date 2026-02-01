# Where subscription, call, and usage data come from

If you have **no subscription, call, or usage rows** in your database, it’s because each of these is created only by specific events.

| Data        | Created when |
|------------|--------------|
| **Business** | When you **start a trial** (`/trial/start`) or **complete onboarding** (business upsert with primary forwarding number). |
| **Subscription** | When **Stripe** sends `checkout.session.completed` to your app’s webhook **after** a user completes a plan purchase. The app creates the row in `handleStripeWebhook`. So: (1) User must complete checkout. (2) Webhook URL in Stripe must point to `/api/webhooks/stripe`. (3) `STRIPE_WEBHOOK_SECRET` must be set. (4) Locally, run `stripe listen --forward-to localhost:3000/api/webhooks/stripe` and use the printed secret. |
| **Call** | When **Retell** sends `call_ended` or `call_analysis` to `/api/webhooks/retell` **after** a call completes. The app must resolve a business (by `metadata.client_id`, `metadata.forwarded_from_number`, or `event.call.from_number` matching a business’s `primaryForwardingNumber`). So: (1) Retell webhook URL must point to your app. (2) A real call must complete to your intake number. (3) The “forwarded from” number must match a business’s primary forwarding number. |
| **Usage** | When a **call completes** and the business has an **active subscription**. The app then upserts a `Usage` row and may report overage minutes to Stripe. So you need both: at least one completed call **and** an active subscription. |

**Quick check (dev):** `GET /api/health/data` returns counts and short hints (allowed in development or with `?secret=DATA_STATUS_SECRET`). See also **Help & FAQ** in the app (`/docs/faq`) for the same summary.
