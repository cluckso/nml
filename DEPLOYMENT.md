# Vercel Deployment Configuration

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

## Deployment Steps

### Option 1: Git Integration (Recommended)
1. Commit all changes to your git repository
2. Push to your main branch
3. Vercel will automatically deploy

### Option 2: Vercel CLI
```bash
cd nml-main
npx vercel --prod
```

## Troubleshooting

### Build Failures
- Check that all environment variables are set
- Verify Node.js version is 20.x or higher
- Ensure Prisma schema is valid and can generate

### Cron Jobs
Two cron jobs are configured:
- `/api/cron/expire-trials` - Daily at 12:00 PM UTC
- `/api/cron/follow-up` - Daily at 1:00 PM UTC

Make sure your Vercel plan supports cron jobs (Hobby plan supports daily crons only).

## Recent Updates
- Updated Node.js to version 22 (latest LTS)
- Added explicit build configuration to `vercel.json`
- Fixed Next.js config warnings
- Added mobile push notification endpoint
- Updated Prisma schema for push tokens
