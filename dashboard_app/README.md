# NeverMissLead Dashboard (Flutter)

Mobile dashboard app for NeverMissLead — sign in with your account, view usage stats, and recent calls.

## Prerequisites

- [Flutter SDK](https://docs.flutter.dev/get-started/install) (3.0+)
- Same Supabase project as the Next.js app
- Next.js app deployed and reachable (for API)

## Setup

1. **Install dependencies**
   ```bash
   cd dashboard_app
   flutter pub get
   ```

2. **Generate platform folders** (if you cloned without them)
   ```bash
   flutter create . --project-name nevermisslead_dashboard
   ```

3. **Configure environment**
   - Get your **Supabase URL** and **anon key** from [Supabase Dashboard → Settings → API](https://supabase.com/dashboard/project/_/settings/api).
   - Set your **API base URL** (Next.js app), e.g. `https://your-app.vercel.app` or `http://localhost:3000` for local.

   Run with Dart defines:
   ```bash
   flutter run --dart-define=API_BASE_URL=https://your-app.vercel.app --dart-define=SUPABASE_URL=https://xxx.supabase.co --dart-define=SUPABASE_ANON_KEY=your-anon-key
   ```

   Or use a `.env` and a package like `flutter_dotenv` and pass these into your app.

## Backend (Next.js)

The Next.js app supports **Bearer token** auth for API routes. When you sign in with Supabase in the Flutter app, the session `access_token` is sent as `Authorization: Bearer <token>` to:

- `GET /api/dashboard` — summary (business, recent calls, stats)
- `GET /api/calls` — paginated call list

Cookie-based auth (browser) continues to work; no change for the web app.

## Screens

- **Login** — Email/password via Supabase (same account as web).
- **Dashboard** — Business name, AI number, agent status, total calls/minutes, emergency count, recent calls list.
- **Calls** — Full paginated list of calls; pull-to-refresh.

## Run

```bash
cd dashboard_app
flutter run --dart-define=API_BASE_URL=https://your-app.vercel.app --dart-define=SUPABASE_URL=... --dart-define=SUPABASE_ANON_KEY=...
```

For a specific device:
```bash
flutter run -d chrome   # web
flutter run -d windows # desktop
flutter devices        # list devices
```
