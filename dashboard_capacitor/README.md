# CallGrabbr Mobile Dashboard

Standalone Android app for CallGrabbr owners — same Supabase account and `/api/*` backend as the website.

## App Details

- **App ID:** `com.me.adhd`
- **Platform:** Android (Capacitor 6)
- **Framework:** React 18 + Vite + React Router

## Features (web parity)

- **Auth:** In-app sign up, sign in, forgot password; Terms acceptance
- **Activation:** Trial start + onboarding (industry, shop, service areas) without leaving the app
- **Dashboard:** Stats, recent calls, trial status, forwarding acknowledge, referrals
- **Calls:** Search, emergency filter, call detail (transcript, intake, recording, callback)
- **Appointments:** List, create, cancel (plan-gated on API)
- **Settings:** Full section hub (greeting, intake, availability, notifications, routing, CRM, etc.) synced via `GET/PATCH /api/settings`
- **Billing:** Stripe Checkout + Customer Portal with Play Billing Choice / external links (`source: "android"`)
- **Partner / agency:** Profile, invite link, Stripe Connect payouts (browser)
- **Push:** FCM alerts with deep links
- **Account:** Delete account (same API as web)

Settings and user data sync automatically with callgrabbr.com — both clients read/write the same database.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   Copy `.env.example` to `.env` and set:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_API_BASE_URL` (production API, usually `https://www.callgrabbr.com`)

3. **Build and sync:**
   ```bash
   npm run build
   npx cap sync android
   npx cap open android
   ```

## Billing (Stripe + Play policy — no Play IAP)

CallGrabbr subscriptions are sold by **CallGrabbr through Stripe**, not as Google Play in-app products.

- Checkout / portal open via Play Billing Library 9.1 `launchExternalLink` when Billing Choice is available; otherwise the system browser.
- In Play Console, keep **Billing Choice / external offers** enrolled for target countries (US, UK, EEA as applicable).
- In-app copy discloses that Google Play is not the merchant of record.
- After returning from checkout, the app refreshes billing summary on `appStateChange` (resume).

Do **not** add Play product SKUs or RevenueCat for this billing model.

## Architecture

```
Capacitor WebView (React)
  → Supabase Auth (Bearer token)
  → nml-main /api/* (Prisma / Postgres)
  → Stripe Checkout / Portal (external)
```

- CORS / origins: `capacitor://localhost`, `https://localhost` (see `proxy.ts` on the web app)
- Gate after login: `GET /api/activation` → trial start → onboarding → dashboard

## API surface (mobile)

| Method | Path | Use |
|--------|------|-----|
| GET | `/api/activation` | Auth gate + onboarding prefill |
| GET | `/api/dashboard` | Home stats / recent calls |
| GET | `/api/calls`, `/api/calls/:id` | Call list + detail |
| GET/PATCH | `/api/settings` | Full business settings |
| GET/POST/DELETE | `/api/appointments` | Scheduling |
| POST | `/api/trial/start`, `/api/onboarding` | Activation |
| GET/POST | `/api/agency`, `/api/agency/connect` | Partner program |
| POST | `/api/checkout`, `/api/billing/portal` | Stripe (`source: android`) |
| DELETE | `/api/account/delete` | Account deletion |
| POST | `/api/push-token` | FCM registration |

## QA checklist

1. Fresh install → Sign up → Trial phone → Onboarding → Dashboard
2. Edit a settings section on phone → confirm same values on web Settings
3. Start Stripe checkout from Billing → complete in browser → resume app → plan updates
4. Sign in with same email on web and app
5. Push notification deep link to `/calls/:id`
6. Create / cancel appointment (Pro+); expect 403 on Starter

## Notes

- App ID `com.me.adhd` is kept for Play continuity
- See [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for push credentials
