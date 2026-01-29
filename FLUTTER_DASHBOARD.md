# Flutter Dashboard App

A Flutter mobile app for the NeverMissLead dashboard lives in **`dashboard_app/`**.

## What was added

### Backend (this repo)

- **Bearer token auth** — API routes accept `Authorization: Bearer <supabase_access_token>` so the Flutter app (and other API clients) can authenticate with the same Supabase account. Cookie-based auth for the web app is unchanged.
- **`GET /api/dashboard`** — Returns dashboard summary: business, recent calls, stats (total calls, total minutes, emergency count). Used by the Flutter app home screen.
- **`lib/auth.ts`** — `getAuthUserFromRequest(req)` resolves the current user from either cookies (web) or Bearer token (Flutter/mobile). Protected API routes use it and return 401 when unauthenticated.

### Flutter app (`dashboard_app/`)

- **Login** — Supabase email/password (same account as web).
- **Dashboard** — Business name, AI number, agent status, usage stats, recent calls.
- **Calls** — Paginated list of calls; pull-to-refresh.

## Run the Flutter app

1. Install [Flutter](https://docs.flutter.dev/get-started/install).
2. From the repo root:
   ```bash
   cd dashboard_app
   flutter pub get
   flutter create . --project-name nevermisslead_dashboard   # if platform folders are missing
   flutter run --dart-define=API_BASE_URL=https://YOUR_APP.vercel.app --dart-define=SUPABASE_URL=https://YOUR_PROJECT.supabase.co --dart-define=SUPABASE_ANON_KEY=your-anon-key
   ```
3. Use the same Supabase URL and anon key as in your Next.js app (e.g. from `.env`: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).

See **`dashboard_app/README.md`** for full setup and options.
