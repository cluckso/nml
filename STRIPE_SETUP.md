# Stripe Setup for NeverMissLead-AI

Your app uses Stripe for:

- **Recurring plans:** Starter ($99/mo), Pro ($199/mo), Local Plus ($299/mo)
- **One-time setup fee:** $99, $199, or $299 at signup
- **Overage:** $0.10/min after included minutes (reported as metered usage)

You need to create the products/prices in Stripe and set env vars so checkout and usage reporting work.

---

## 1. Create products and prices in Stripe

### Option A: Stripe Dashboard

1. **Stripe Dashboard** → **Products** → **Add product**

2. **Starter**
   - Name: `Starter` (or "NeverMissLead Starter")
   - Add a **recurring** price:
     - **Price:** $99.00 USD
     - **Billing period:** Monthly
     - **Usage type:** Licensed (default)
   - Copy the **Price ID** (starts with `price_`) → use as `STRIPE_PRICE_STARTER`
   - Copy the **Product ID** (starts with `prod_`) → optional for `STRIPE_PRODUCT_STARTER`

3. **Pro**
   - New product, name: `Pro`
   - Recurring price: $199.00 USD, monthly, licensed
   - Copy Price ID → `STRIPE_PRICE_PRO`
   - Copy Product ID → optional `STRIPE_PRODUCT_PRO`

4. **Local Plus**
   - New product, name: `Local Plus`
   - Recurring price: $299.00 USD, monthly, licensed
   - Copy Price ID → `STRIPE_PRICE_LOCAL_PLUS`
   - Copy Product ID → optional `STRIPE_PRODUCT_LOCAL_PLUS`

5. **Overage (metered)**
   - New product, name: `Call minutes overage` (or "Overage")
   - Add a **recurring** price:
     - **Price:** $0.10 USD
     - **Billing period:** Monthly
     - **Usage type:** **Metered** (not licensed)
     - **Usage aggregation:** Sum (default)
   - Copy the **Price ID** (starts with `price_`) → use as `STRIPE_USAGE_PRICE_ID`

Important: the overage price must be **metered** so the app can report usage with `createUsageRecord`. The subscription is created at checkout with both the plan price and this overage price; the app only reports minutes *above* the plan’s included minutes.

---

## 2. Environment variables

Add to `.env` (and your host’s env, e.g. Vercel):

```env
# Stripe (required)
STRIPE_SECRET_KEY=sk_live_...          # or sk_test_... for test mode
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Price IDs (from step 1)
STRIPE_PRICE_STARTER=price_xxxxx       # Starter $99/mo
STRIPE_PRICE_PRO=price_xxxxx          # Pro $199/mo
STRIPE_PRICE_LOCAL_PLUS=price_xxxxx   # Local Plus $299/mo
STRIPE_USAGE_PRICE_ID=price_xxxxx     # Overage $0.10/min (metered)

# Optional product IDs (used only if you reference them in code)
# STRIPE_PRODUCT_STARTER=prod_xxxxx
# STRIPE_PRODUCT_PRO=prod_xxxxx
# STRIPE_PRODUCT_LOCAL_PLUS=prod_xxxxx
```

Use **test** keys and **test** price IDs while developing; switch to **live** when you go to production.

---

## 3. Webhook

1. **Stripe Dashboard** → **Developers** → **Webhooks** → **Add endpoint**

2. **Endpoint URL:**  
   `https://your-domain.com/api/webhooks/stripe`  
   (e.g. `https://yourapp.vercel.app/api/webhooks/stripe`)

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

## 4. How it works in the app

- **Checkout:**  
  Creates a Stripe Checkout session with:
  - One **recurring** line item (plan: Starter, Pro, or Local Plus)
  - One **metered** line item (overage price, quantity 0 at checkout)
  - Optional one-time **setup fee** line item

- **After payment:**  
  Webhook `checkout.session.completed` creates the subscription in your DB and links it to the business.

- **Overage:**  
  When a call ends, the app computes overage minutes (total minutes − included minutes for the plan). It finds the subscription item for `STRIPE_USAGE_PRICE_ID` and reports only that overage amount with `createUsageRecord`. Stripe then bills $0.10 per reported minute on the next invoice.

---

## 5. Checklist

- [ ] Created 3 products with **recurring licensed** prices ($99, $199, $299/month)
- [ ] Created 1 product with a **recurring metered** price ($0.10, monthly, metered)
- [ ] Set `STRIPE_PRICE_STARTER`, `STRIPE_PRICE_PRO`, `STRIPE_PRICE_LOCAL_PLUS`, `STRIPE_USAGE_PRICE_ID` in env
- [ ] Set `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`
- [ ] Webhook endpoint added in Stripe with the events above
- [ ] Test a subscription in test mode and confirm usage appears under the subscription (overage item)

If any price ID is wrong or the overage price is not metered, checkout or usage reporting will fail; double-check those first.
