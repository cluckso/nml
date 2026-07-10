# Vercel Deployment Configuration

## Vercel project vs local folder

| | Name |
|---|---|
| **Vercel project** | `callgrabbr` (dashboard → [vercel.com](https://vercel.com/dashboard)) |
| **Local git folder** | `nml-main` (directory name only — not the Vercel project name) |
| **Production URL** | `https://www.callgrabbr.com` |

Env vars live on the **callgrabbr** Vercel project. A missing local `.env` does not affect production if Vercel env is set.

## Node.js Version
- **Current:** Node 22.x (Latest LTS)
- **Minimum:** Node 20.x
- Specified in:
  - `.nvmrc`: `22`
  - `.node-version`: `22`
  - `package.json`: `"node": ">=20.x"`

## Build Configuration
- **Framework:** Next.js 16.1.6
- **Build Command:** `npm run build` (includes Prisma generate)
- **Install Command:** `npm install`
- **Output Directory:** `.next` (default)

## Environment Variables Required
Ensure these are set in your Vercel project settings:

### Database (Supabase)
- `DATABASE_URL`
- `DIRECT_URL`

### Authentication
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Payment (Stripe)
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

### AI (Retell)
- `RETELL_API_KEY`

### Communications
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_PHONE_NUMBER`
- `RESEND_API_KEY`

### Application
- `NEXT_PUBLIC_APP_URL` (your production URL)

### Observability (optional)
- `SENTRY_DSN` — server-side error reporting (Retell webhooks, crons, API routes)
- `NEXT_PUBLIC_SENTRY_DSN` — same DSN for client-side errors (optional; can match `SENTRY_DSN`)

Sentry only sends events when `NODE_ENV=production` and a DSN is set.

## Deployment Steps

### Option 1: Git Integration (Recommended)
1. Commit all changes to your git repository
2. Push to your main branch
3. Vercel will automatically deploy

### Option 2: Vercel CLI
```bash
cd nml-main
npx vercel link --project callgrabbr   # first time only
npx vercel --prod
```

## Sync database schema (production)

If the dashboard shows "Unable to load dashboard" and Vercel logs contain `P2022` / **column does not exist**, the production DB is behind the Prisma schema. Env vars are fine — apply migrations:

**Option A — Supabase SQL Editor** (fastest):

Run `scripts/sync-production-call-columns.sql`, or paste:

```sql
ALTER TABLE "Call" ADD COLUMN IF NOT EXISTS "capacityDeclineSmsSent" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Call" ADD COLUMN IF NOT EXISTS "incompleteTextBackReplyAt" TIMESTAMP(3);
ALTER TABLE "Call" ADD COLUMN IF NOT EXISTS "callerConfirmationSentAt" TIMESTAMP(3);
ALTER TABLE "Call" ADD COLUMN IF NOT EXISTS "followUpSentAt" TIMESTAMP(3);
ALTER TABLE "Call" ADD COLUMN IF NOT EXISTS "missedCallTextBackSent" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Call" ADD COLUMN IF NOT EXISTS "notificationSent" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Call" ADD COLUMN IF NOT EXISTS "missedCallRecovery" BOOLEAN NOT NULL DEFAULT false;
```

**Option B — Prisma migrate** (from a machine with `DIRECT_URL` set):

```bash
cd nml-main
npx prisma migrate deploy
```

After applying, reload `/dashboard` — no redeploy needed.

## Fix "credentials for postgres are not valid" (pooler auth)

Vercel logs like `Authentication failed... credentials for postgres are not valid` on `pooler.supabase.com` mean **`DATABASE_URL` has the wrong username**.

| Variable | Username | Host | Port |
|---|---|---|---|
| `DATABASE_URL` | `postgres.sbfwaopvqpfgjfdzxnaq` | `aws-1-us-east-1.pooler.supabase.com` | **6543** |
| `DIRECT_URL` | `postgres` | `db.sbfwaopvqpfgjfdzxnaq.supabase.co` | **5432** |

Do **not** copy the direct-connection URI into `DATABASE_URL`. In Vercel → **callgrabbr** → Settings → Environment Variables:

1. Open Supabase → **Database** → **Connection pooling** → **Transaction** mode → copy URI.
2. Replace `DATABASE_URL` with that URI (must include `postgres.sbfwaopvqpfgjfdzxnaq`, port 6543, and `?pgbouncer=true`).
3. **Redeploy** production (env changes require redeploy).
4. Confirm `/api/health` returns healthy, then run schema SQL above if dashboard still errors on missing columns.

## Troubleshooting

### Build Failures
- Check that all environment variables are set
- Verify Node.js version is 20.x or higher
- Ensure Prisma schema is valid and can generate

### Cron Jobs
Three cron jobs are configured in `vercel.json`:
- `/api/cron/expire-trials` - Daily at 12:00 UTC (pauses expired/exhausted trials)
- `/api/cron/follow-up` - Daily at 13:00 UTC (24h caller follow-up SMS)
- `/api/cron/weekly-reports` - Mondays at 14:00 UTC (Pro weekly email reports)

Set `CRON_SECRET` in Vercel; Vercel sends `Authorization: Bearer <CRON_SECRET>` on cron invocations.

## Recent Updates
- Updated Node.js to version 22 (latest LTS)
- Added explicit build configuration to `vercel.json`
- Fixed Next.js config warnings
- Added mobile push notification endpoint
- Updated Prisma schema for push tokens
