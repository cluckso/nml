# CallGrabbr Dashboard (Capacitor)

Android dashboard app for CallGrabbr — same features as the Flutter app, built with **Vite + React + Capacitor**. Package name: **com.me.adhd**.

## Prerequisites

- Node 18+
- Same Supabase project as the Next.js app
- Next.js app deployed (API base URL)
- Android Studio (to build/run the Android app)

## Setup

1. **Install dependencies**
   ```powershell
   cd dashboard_capacitor
   npm install
   ```

2. **Environment**
   Create `.env` in `dashboard_capacitor` (or pass at build time):
   ```
   VITE_API_BASE_URL=https://www.callgrabbr.com
   VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

## Build and run Android

1. **Build the web app** (required before syncing to Android)
   ```powershell
   npm run build
   ```

2. **Sync to Android**
   ```powershell
   npx cap sync android
   ```

3. **Open in Android Studio**
   ```powershell
   npx cap open android
   ```
   Then in Android Studio: **Build → Build Bundle(s) / APK(s) → Build APK(s)** (or run on device/emulator).

**One-shot build with env:**
   ```powershell
   npm run build -- --mode production
   ```
   (Ensure `.env` has the three `VITE_*` variables, or use a `.env.production`.)

## Scripts

- `npm run dev` — run web app locally (for testing in browser)
- `npm run build` — build for production (output in `dist/`)
- `npm run cap:sync` — copy `dist/` into Android (and iOS if added)
- `npm run cap:android` — open Android project in Android Studio

## App ID

- **Package / applicationId:** `com.me.adhd`
- Set in `capacitor.config.ts` (`appId`). Do not change in Android Studio; change in config and run `cap sync`.

## Screens

- **Login** — Email/password via Supabase (same account as web).
- **Dashboard** — Business name, AI number, agent status, usage stats, recent calls.
- **Calls** — Paginated list; pull to refresh by re-opening.
- **Appointments** — Upcoming appointments (Pro+); cancel from app.
- **Settings** — Notification phone, SMS consent.
