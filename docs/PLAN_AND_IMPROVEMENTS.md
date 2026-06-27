# CallGrabbr — Plan & Improvements

**Purpose:** Complete inventory of what you have, prioritized improvements, and execution log.

---

## 1. What You Have (Inventory)

### Product
- **Offer:** AI phone receptionist for local service businesses (HVAC, plumbing, electrical, auto, handyman, etc.).
- **Core value:** Answer forwarded calls 24/7, capture lead info when callers share it, send summaries (email + optional SMS), optional appointment booking on Team and Pro.
- **Plans:** Solo $99 (300 min), Team $159 (800 min), Pro $279 (1,500 min). 7-day free trial, no card required; 40 trial minutes.

### User flows
| Flow | Steps | Status |
|------|--------|--------|
| **Landing → Sign up** | Home → Sign Up (email/password) → Confirm email → Redirect to dashboard | ✅ |
| **Landing → Trial** | Home → Sign Up (or Sign In) → Trial Start (business phone) → Onboarding → Dashboard | ✅ |
| **Onboarding** | Industry → Business info (name, address, hours, etc.) → Complete → Dashboard | ✅ |
| **Dashboard** | Trial card (if trial), Setup AI card, stats (calls, minutes, urgent), recent calls | ✅ |
| **Post-trial** | Billing (upgrade), Calls, Appointments, Settings | ✅ |

### Tech stack
- **App:** Next.js 16 (App Router), React, TypeScript, Tailwind, shadcn-style UI.
- **Auth:** Supabase (email/password).
- **Data:** PostgreSQL (Prisma), Supabase.
- **Payments:** Stripe (subscriptions, checkout).
- **Voice:** Retell (AI agents, phone numbers, webhooks).
- **Comms:** Twilio (SMS), email (notifications).
- **Tracking:** Meta Pixel on site.
- **Mobile:** Capacitor Android app (dashboard, auth, calls, appointments, settings).

### Key pages & routes
- **Marketing:** `/` (landing), `/pricing`, `/docs/faq`, `/privacy`, `/terms`, `/sms-terms`.
- **Auth:** `/sign-up`, `/sign-in`, `/confirm-email`.
- **App:** `/trial/start`, `/onboarding`, `/dashboard`, `/calls`, `/calls/[id]`, `/appointments`, `/billing`, `/settings`.
- **Admin:** `/admin`.

### What’s working well
- Clear value prop and pricing on landing and pricing.
- Trial is low-friction (no card, 7 days).
- Pricing page shows included minutes per tier.
- Carrier-specific FAQ for call forwarding.
- Dashboard shows trial status, setup, stats, recent calls.
- Billing shows usage and upgrade options.
- Android app for on-the-go.

---

## 2. Gaps & Improvement List (Prioritized)

### High impact (do first)
1. **SEO & shareability**
   - Add per-page `metadata` (title, description) where missing: `/pricing`, `/trial/start`, auth pages.
   - Add Open Graph and Twitter card meta in root layout so links look good when shared.
2. **Landing ↔ pricing consistency**
   - On landing, the three pricing cards say "~75–120 calls" etc. but not "300 / 800 / 1,500 minutes." Add included minutes to match `/pricing` and avoid confusion.
3. **Trial-first path from sign-up**
   - On Sign Up page, add a line like “New? Start with a free trial” linking to `/trial/start` so users can go trial-first without hunting.
4. **Confirm-email → next step**
   - After “Confirm your email,” make the next step obvious (e.g. “Then go to Trial or Dashboard”) with a button to `/trial/start` or `/dashboard`.

### Medium impact (next)
5. **Pricing page metadata**
   - Explicit `metadata` for `/pricing` (title, description) for search and social.
6. **Error and empty states**
   - Consistent, friendly messages for: “No calls yet,” “Onboarding failed,” “Payment failed,” and API errors (avoid raw alerts where possible).
7. **Mobile landing**
   - Quick pass on landing and pricing on small screens (tap targets, font size, spacing).
8. **One CTA clarity**
   - Ensure primary CTA above the fold is one clear action (e.g. “Start free trial” or “Start free — no card”) and secondary is “See pricing.”

### Lower priority / later
9. **Analytics**
   - Track trial start, onboarding complete, first call, upgrade (e.g. Meta Pixel events or dedicated analytics).
10. **Performance**
    - Image optimization (e.g. `next/image` for icon/hero if needed), lazy-load below-fold sections if needed.
11. **Accessibility**
    - Focus order, aria-labels on icon-only buttons, contrast check.
12. **Legal**
    - Ensure Terms/Privacy mention AI, recordings, and data retention where required.

---

## 3. Execution Log

**Phase 1 (completed):**
- **SEO & share:** Root layout — added `openGraph` and `twitter` metadata (title, description, url, siteName). Pricing page — added `metadata` (title, description). Trial start page — added `metadata`. Auth — added `app/(auth)/layout.tsx` with metadata for sign-in/sign-up/confirm-email.
- **Landing ↔ pricing:** Landing pricing cards now show "300 / 800 / 1,500 included minutes/month" and subtitle "· X included min/mo" so they match `/pricing`.
- **Trial-first path:** Sign-up page — added "Start free trial" link (to `/trial/start`) next to "Sign in" for returning users. Confirm-email — added "Start free trial" button next to "Sign in" so after confirming, users can go straight to trial.

**Phase 2 (completed):**
- **Error and empty states:** Replaced all `alert()` with inline UI. PlanCard — checkout errors shown in-card. OnboardingClient — submit errors and provisioning warning shown inline. NewAppointmentForm — create-appointment errors shown in form. CallLog already had a friendly "No calls yet" empty state.
- **Mobile + CTA:** Hero heading/subtext responsive (smaller on mobile). Primary CTA text set to "Start free trial"; both CTAs use min-h 44px for touch targets. Added `aria-hidden` on decorative arrow icon.
- **Analytics:** Added `lib/analytics.ts` with `trackStartTrial`, `trackCompleteRegistration`, `trackSubscribe`. Wired: trial start (TrialStartClient), onboarding complete (OnboardingClient), plan checkout (PlanCard). Uses Meta Pixel `fbq` when available.
- **Accessibility:** Nav logo link has `aria-label="CallGrabbr home"`; logo image `alt=""` (decorative). Appointments week nav buttons have `aria-label="Previous week"` / "Next week"; icons `aria-hidden`.
- **Legal:** Terms section 2 — added sentence that calls may be recorded/transcribed for service delivery and that user is responsible for call-recording consent laws. Privacy already covered recordings and data retention.

---

## 4. Quick Reference

- **Plans:** `lib/plans.ts` (minutes, prices, trial days, overage).
- **Trial logic:** `lib/trial.ts`, `app/api/trial/*`.
- **Landing:** `app/page.tsx`. **Pricing:** `app/pricing/page.tsx`, `components/pricing/*`.
- **Auth:** `app/(auth)/*`, Supabase in `lib/supabase/*`.
- **Dashboard:** `app/(dashboard)/dashboard/page.tsx`, `components/dashboard/*`.
