# Subscription state: one place to read

Subscription state is handled so the app has **one place to read** and **one place that writes from billing**.

## Where things live

| Concern | Source of truth | Used for |
|--------|------------------|----------|
| **Billing** (payments, invoices, usage, plan in Stripe) | **Stripe** | Creating subscriptions at checkout, reporting usage, webhooks pushing changes into the DB |
| **Subscription state in the app** (active?, plan?, period end?) | **Database** (Prisma `Subscription` model) | All app logic: billing page, trial vs paid, agent creation, reports, access control |

The app **never** reads subscription status from the Stripe API for access control or UI. It only reads from the database. Stripe webhooks keep the DB in sync.

## Reading subscription state

- **Preferred:** Use `lib/subscription.ts`:
  - `getSubscriptionForBusiness(businessId)` – subscription record or null
  - `hasActiveSubscription(businessId)` – boolean
  - `isSubscriptionActive(sub)` – given a subscription record, is it ACTIVE?
- **Alternatively:** Use `business.subscription` when you already have a business (with `include: { subscription: true }`).

## Writing subscription state (from Stripe)

The **only** place that creates or updates the `Subscription` table from billing is **Stripe webhooks** in `lib/stripe.ts` (`handleStripeWebhook`):

- `checkout.session.completed` – creates a `Subscription` row and clears trial fields
- `customer.subscription.updated` / `customer.subscription.deleted` – updates `status`, period dates, `cancelAtPeriodEnd` (Stripe status is mapped to our `SubscriptionStatus` in one helper: `stripeSubscriptionStatusToDb`)
- `invoice.payment_failed` – sets status to `PAST_DUE` and can pause the business

So: **Stripe = billing source of truth; DB = app copy, synced by webhooks; app reads only from DB.**
