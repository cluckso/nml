# Stripe Setup for CallGrabbr

Your app uses Stripe for:

- **Recurring plans:** Solo ($99/mo), Team ($159/mo), Pro ($279/mo)
- **Overage:** $0.22/min after included minutes (reported as usage on a subscription item)

You need to create the products/prices in Stripe and set env vars so checkout and usage reporting work.

---

## Current live price IDs (Jun 2026)

These are the **active** prices in the CallGrabbr Stripe account. Set them in Vercel / `.env`:

```env
STRIPE_PRICE_STARTER=price_1SvQxbDcWEGGVqRpfuSnJfLy       # Solo $99/mo
STRIPE_PRICE_PRO=price_1TmpyODcWEGGVqRpMX75b7oD             # Team $159/mo
STRIPE_PRICE_LOCAL_PLUS=price_1TmpyODcWEGGVqRpHlavDS9m      # Pro $279/mo
STRIPE_PRICE_ELITE=price_1TmpyODcWEGGVqRpHlavDS9m           # Pro $279/mo (same as LOCAL_PLUS)
STRIPE_USAGE_PRICE_ID=price_1Tmpz2DcWEGGVqRpcG3uI6MG        # Overage $0.22/min (Billing Meter)
# Optional override if meter event_name cannot be resolved from the price:
# STRIPE_USAGE_METER_EVENT_NAME=callgrabbr_call_minutes
```

**Note:** Stripe prices are immutable. When pricing changes, create **new** prices and update env vars. Existing subscribers stay on their original price until you migrate them.

Older prices (`$149` Team, `$249` Pro, `$0.20` overage) have been archived in Stripe.

---

## 1. Create products and prices in Stripe

### Option A: Stripe Dashboard

1. **Stripe Dashboard** → **Products** → **Add product**

2. **Solo (Starter)**
   - Name: `Starter` or `Solo`
   - Add a **recurring** price:
     - **Price:** $99.00 USD
     - **Billing period:** Monthly
     - **Usage type:** Licensed (default)
   - Copy the **Price ID** (starts with `price_`) → use as `STRIPE_PRICE_STARTER`

3. **Team (Pro plan in app)**
   - Product name: `Pro` or `Team`
   - Recurring price: $159.00 USD, monthly, licensed
   - Copy Price ID → `STRIPE_PRICE_PRO`

4. **Pro (Elite / Local Plus in app)**
   - Product name: `Elite`
   - Recurring price: $279.00 USD, monthly, licensed
   - Copy Price ID → `STRIPE_PRICE_LOCAL_PLUS` and `STRIPE_PRICE_ELITE`

5. **Overage**
   - Product name: `Call minutes overage` (or "Stripe Usage")
   - Add a **recurring** price:
     - **Price:** $0.22 USD per unit
     - **Billing period:** Monthly
     - **Usage type:** **Metered** (preferred) or match your existing usage price type
     - **Usage aggregation:** Sum (default)
   - Copy the **Price ID** → use as `STRIPE_USAGE_PRICE_ID`

Important: the overage price must support usage reporting (`createUsageRecord` or Billing Meters) so the app can bill per minute above the plan's included minutes. The app adds this overage item to the subscription in the webhook after checkout (not at checkout).

---

## 2. Environment variables

Add to `.env` (and your host’s env, e.g. Vercel):

```env
# Stripe (required)
STRIPE_SECRET_KEY=sk_live_...          # or sk_test_... for test mode
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Price IDs (from step 1 or "Current live price IDs" above)
STRIPE_PRICE_STARTER=price_xxxxx       # Solo $99/mo
STRIPE_PRICE_PRO=price_xxxxx           # Team $159/mo
STRIPE_PRICE_LOCAL_PLUS=price_xxxxx    # Pro $279/mo
STRIPE_PRICE_ELITE=price_xxxxx         # Pro $279/mo (optional if same as LOCAL_PLUS)
STRIPE_USAGE_PRICE_ID=price_xxxxx      # Overage $0.22/min

# Optional annual prices (2 months free — 10× monthly). Enables annual toggle on /pricing.
# STRIPE_PRICE_STARTER_ANNUAL=price_xxxxx
# STRIPE_PRICE_PRO_ANNUAL=price_xxxxx
# STRIPE_PRICE_ELITE_ANNUAL=price_xxxxx

# Optional product IDs
# STRIPE_PRODUCT_STARTER=prod_xxxxx
# STRIPE_PRODUCT_PRO=prod_xxxxx
# STRIPE_PRODUCT_LOCAL_PLUS=prod_xxxxx
```

Use **test** keys and **test** price IDs while developing; switch to **live** when you go to production.

---

## 3. Local testing (checkout & billing)

1. **Stripe test mode**  
   In Stripe Dashboard, switch to **Test mode** (toggle top-right). Create the same products and prices there and copy the **test** Price IDs into `.env` / `.env.local`.

2. **Required env vars for checkout**  
   All of these must be set or the checkout API returns **400** with a clear message:
   - `STRIPE_SECRET_KEY` (e.g. `sk_test_...`)
   - `STRIPE_PRICE_STARTER` (e.g. `price_...`)
   - `STRIPE_PRICE_PRO`
   - `STRIPE_PRICE_LOCAL_PLUS`
   - `STRIPE_USAGE_PRICE_ID` (overage price)

3. **Run the app and try checkout**  
   - Start the app: `npm run dev`
   - Sign in, go to **Pricing** or **Billing**, pick a plan and click through.
   - If something is missing, the UI shows the exact error (e.g. *"Stripe price ID for STARTER is not set. Set STRIPE_PRICE_STARTER in .env (value must start with price_)"*).

4. **Webhook (optional for local)**  
   To test the full flow (subscription created in DB after payment), run:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
   Use the printed `whsec_...` as `STRIPE_WEBHOOK_SECRET` in `.env.local`.

---

## 4. Webhook

1. **Stripe Dashboard** → **Developers** → **Webhooks** → **Add endpoint**

2. **Endpoint URL:**  
   `https://your-domain.com/api/webhooks/stripe`  
   (e.g. `https://www.callgrabbr.com/api/webhooks/stripe`)

3. **Events to send:** subscribe at least to:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded` (optional, for your own logic)
   - `invoice.payment_failed`

4. Copy the **Signing secret** (starts with `whsec_`) → set as `STRIPE_WEBHOOK_SECRET`.

5. For **local testing**, use Stripe CLI:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
   Use the printed `whsec_...` as `STRIPE_WEBHOOK_SECRET` in `.env.local`.

---

## 5. How it works in the app

- **Checkout:**  
  Creates a Stripe Checkout session with:
  - One **recurring** line item (plan: Solo, Team, or Pro)
  - Optional one-time **setup fee** line item  
  No usage/overage line at checkout — the overage item is added to the subscription in the webhook after payment.

- **After payment:**  
  Webhook `checkout.session.completed` creates the subscription in your DB and links it to the business.

- **Overage:**  
  When a call ends, the app computes overage minutes (total minutes − included minutes for the plan). The live overage price uses **Stripe Billing Meters** (`mtr_61UwEE0eV2tBYHZC741DcWEGGVqRpDa4`). The app sends meter events via `billing.meterEvents.create` with the customer's Stripe ID and incremental overage minutes. Legacy `createUsageRecord` is only used as a fallback when the price has no meter attached.

- **Plan upgrades:**  
  New subscribers go through Stripe Checkout. Existing active subscribers upgrade **in-place** via `subscriptionItems.update` with proration — the checkout API detects an active subscription and updates the plan line item instead of creating a duplicate subscription.

---

## 6. Checklist

- [ ] Created 3 products with **recurring licensed** prices ($99, $159, $279/month)
- [ ] Created 1 product with a **usage-based** overage price ($0.22/min)
- [ ] Set `STRIPE_PRICE_STARTER`, `STRIPE_PRICE_PRO`, `STRIPE_PRICE_LOCAL_PLUS`, `STRIPE_USAGE_PRICE_ID` in env
- [ ] Set `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`
- [ ] Webhook endpoint added in Stripe with the events above
- [ ] Test a subscription in test mode and confirm usage appears under the subscription (overage item)

If any price ID is wrong or the overage price does not support usage reporting, checkout or usage billing will fail; double-check those first.
