# Stripe Setup for CallGrabbr

Your app uses Stripe for:

- **Recurring plans:** Basic ($99/mo), Growth ($189/mo), Platinum ($279/mo)
- **Overage:** $0.29/min after included minutes (reported as usage on a subscription item)

You need to create the products/prices in Stripe and set env vars so checkout and usage reporting work.

---

## Current live price IDs (Oct 2026)

These are the **active** prices in the CallGrabbr Stripe account. Set them in Vercel / `.env`:

```env
STRIPE_PRICE_STARTER=price_1SvQxbDcWEGGVqRpfuSnJfLy       # Basic $99/mo
STRIPE_PRICE_PRO=price_1UUf4wDcWEGGVqRpFl2wti3i             # Growth $189/mo
STRIPE_PRICE_LOCAL_PLUS=price_1TmpyODcWEGGVqRpHlavDS9m      # Platinum $279/mo
STRIPE_PRICE_ELITE=price_1TmpyODcWEGGVqRpHlavDS9m           # Platinum $279/mo (same as LOCAL_PLUS)
STRIPE_USAGE_PRICE_ID=price_1UUf51DcWEGGVqRpwVWRffzg        # Overage $0.29/min (Billing Meter)
# Optional annual (10× monthly = 2 months free):
STRIPE_PRICE_PRO_ANNUAL=price_1UUf52DcWEGGVqRpfGCl3Muh      # Growth $1,890/yr
STRIPE_PRICE_ELITE_ANNUAL=price_1UUf54DcWEGGVqRpJbhDuTcS    # Platinum $2,790/yr
STRIPE_PRICE_LOCAL_PLUS_ANNUAL=price_1UUf54DcWEGGVqRpJbhDuTcS
# Optional override if meter event_name cannot be resolved from the price:
# STRIPE_USAGE_METER_EVENT_NAME=callgrabbr_call_minutes
```

**Included minutes (app, not Stripe):** Basic 250 · Growth 500 · Platinum 1,200.

**Note:** Stripe prices are immutable. When pricing changes, create **new** prices and update env vars. Existing subscribers stay on their original price until you migrate them.

Archived (Oct 2026): Team $159/mo (`price_1TmpyODcWEGGVqRpMX75b7oD`), Overage $0.22/min (`price_1Tmpz2DcWEGGVqRpcG3uI6MG`).

---

## 1. Create products and prices in Stripe

### Option A: Stripe Dashboard

1. **Stripe Dashboard** → **Products** → **Add product**

2. **Basic (Starter)**
   - Name: `Starter` or `Basic`
   - Add a **recurring** price:
     - **Price:** $99.00 USD
     - **Billing period:** Monthly
     - **Usage type:** Licensed (default)
   - Copy the **Price ID** (starts with `price_`) → use as `STRIPE_PRICE_STARTER`

3. **Growth (Pro plan in app)**
   - Product name: `Pro` or `Growth`
   - Recurring price: $189.00 USD, monthly, licensed
   - Copy Price ID → `STRIPE_PRICE_PRO`

4. **Platinum (Elite / Local Plus in app)**
   - Product name: `Elite`
   - Recurring price: $279.00 USD, monthly, licensed
   - Copy Price ID → `STRIPE_PRICE_LOCAL_PLUS` and `STRIPE_PRICE_ELITE`

5. **Overage**
   - Product name: `Call minutes overage` (or "Stripe Usage")
   - Add a **recurring** price:
     - **Price:** $0.29 USD per unit
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
STRIPE_PRICE_STARTER=price_xxxxx       # Basic $99/mo
STRIPE_PRICE_PRO=price_xxxxx           # Growth $189/mo
STRIPE_PRICE_LOCAL_PLUS=price_xxxxx    # Platinum $279/mo
STRIPE_PRICE_ELITE=price_xxxxx         # Platinum $279/mo (optional if same as LOCAL_PLUS)
STRIPE_USAGE_PRICE_ID=price_xxxxx      # Overage $0.29/min

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

## Checklist

- [ ] Created 3 products with **recurring licensed** prices ($99, $189, $279/month)
- [ ] Created 1 product with a **usage-based** overage price ($0.29/min)
- [ ] Env vars set in Vercel (Production + Preview)
- [ ] Webhook endpoint receives `checkout.session.completed` and invoice events
- [ ] Test checkout in live mode with a real card (then refund)
