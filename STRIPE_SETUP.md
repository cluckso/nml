# Stripe Setup for NeverMissLead-AI

Your app uses Stripe for:

- **Recurring plans:** Basic ($99/mo), Pro ($229/mo), Local Plus ($349/mo)
- **Overage:** $0.20/min after included minutes (reported as metered usage)

You need to create the products/prices in Stripe and set env vars so checkout and usage reporting work.

---

## 1. Create products and prices in Stripe

### Option A: Stripe Dashboard

1. **Stripe Dashboard** → **Products** → **Add product**

2. **Basic**
   - Name: `Basic` (or "NeverMissLead Basic")
   - Add a **recurring** price:
     - **Price:** $99.00 USD
     - **Billing period:** Monthly
     - **Usage type:** Licensed (default)
   - Copy the **Price ID** (starts with `price_`) → use as `STRIPE_PRICE_STARTER`
   - Copy the **Product ID** (starts with `prod_`) → optional for `STRIPE_PRODUCT_STARTER`

3. **Pro**
   - New product, name: `Pro`
   - Recurring price: $229.00 USD, monthly, licensed
   - Copy Price ID → `STRIPE_PRICE_PRO`
   - Copy Product ID → optional `STRIPE_PRODUCT_PRO`

4. **Local Plus**
   - New product, name: `Local Plus`
   - Recurring price: $349.00 USD, monthly, licensed
   - Copy Price ID → `STRIPE_PRICE_LOCAL_PLUS`
   - Copy Product ID → optional `STRIPE_PRODUCT_LOCAL_PLUS`

5. **Overage (metered)**
   - New product, name: `Call minutes overage` (or "Overage")
   - Add a **recurring** price:
     - **Price:** $0.20 USD
     - **Billing period:** Monthly
     - **Usage type:** **Metered** (not licensed)
     - **Usage aggregation:** Sum (default)
   - Copy the **Price ID** (starts with `price_`) → use as `STRIPE_USAGE_PRICE_ID`

Important: the overage price must be **metered** so the app can report usage with `createUsageRecord`. The app adds this overage item to the subscription in the webhook after checkout (not at checkout), so customers are not charged for usage until the app reports overage minutes.

---

## 2. Environment variables

Add to `.env` (and your host’s env, e.g. Vercel):

```env
# Stripe (required)
STRIPE_SECRET_KEY=sk_live_...          # or sk_test_... for test mode
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Price IDs (from step 1)
STRIPE_PRICE_STARTER=price_xxxxx       # Basic $99/mo
STRIPE_PRICE_PRO=price_xxxxx          # Pro $229/mo
STRIPE_PRICE_LOCAL_PLUS=price_xxxxx   # Local Plus $349/mo
STRIPE_USAGE_PRICE_ID=price_xxxxx     # Overage $0.20/min (metered)

# Optional product IDs (used only if you reference them in code)
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
   - `STRIPE_USAGE_PRICE_ID` (metered overage price)

3. **Run the app and try checkout**  
   - Start the app: `npm run dev`
   - Sign in, go to **Pricing** or **Billing**, pick a plan and click through.
   - If something is missing, the UI now shows the exact error (e.g. *"Stripe price ID for STARTER is not set. Set STRIPE_PRICE_STARTER in .env (value must start with price_)"*).

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

## 5. How it works in the app

- **Checkout:**  
  Creates a Stripe Checkout session with:
  - One **recurring** line item (plan: Starter, Pro, or Local Plus)
  - Optional one-time **setup fee** line item  
  No usage/overage line at checkout — the metered overage item is added to the subscription in the webhook after payment, so customers are only charged for usage when the app reports overage minutes.

- **After payment:**  
  Webhook `checkout.session.completed` creates the subscription in your DB and links it to the business.

- **Overage:**  
  When a call ends, the app computes overage minutes (total minutes − included minutes for the plan). It finds the subscription item for `STRIPE_USAGE_PRICE_ID` and reports only that overage amount with `createUsageRecord`. Stripe then bills $0.20 per reported minute on the next invoice.

---

## 6. Checklist

- [ ] Created 3 products with **recurring licensed** prices ($99, $199, $299/month)
- [ ] Created 1 product with a **recurring metered** price ($0.20, monthly, metered)
- [ ] Set `STRIPE_PRICE_STARTER`, `STRIPE_PRICE_PRO`, `STRIPE_PRICE_LOCAL_PLUS`, `STRIPE_USAGE_PRICE_ID` in env
- [ ] Set `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`
- [ ] Webhook endpoint added in Stripe with the events above
- [ ] Test a subscription in test mode and confirm usage appears under the subscription (overage item)

If any price ID is wrong or the overage price is not metered, checkout or usage reporting will fail; double-check those first.
