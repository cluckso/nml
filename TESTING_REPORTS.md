# Testing email reports

## Weekly report (Local Plus)

The weekly report is sent to **Local Plus** businesses with an active subscription. It includes usage, leads by tag, and recent calls.

### 1. Prerequisites

- **RESEND_API_KEY** in `.env.local` (get from [Resend](https://resend.com)).
- For testing, you can use Resend’s test domain: set **RESEND_FROM_EMAIL** to a verified address (e.g. `onboarding@resend.dev` or your own verified domain).
- A **business** in your DB that has at least one **user** with an email (the report is sent to the first user’s email).

### 2. Test in development (no cron secret)

In development you can trigger a single report with **test mode** (bypasses auth and plan check; subject is prefixed with `[TEST]`):

```bash
# Replace YOUR_BUSINESS_ID with a real business id (e.g. from Prisma Studio or your DB)
curl -X POST "http://localhost:3000/api/reports/weekly?businessId=YOUR_BUSINESS_ID&test=1"
```

Example response:

```json
{
  "sent": true,
  "test": true,
  "to": "owner@example.com",
  "hint": "Check inbox for [TEST] Weekly report"
}
```

If `sent` is `false`, check server logs and that `RESEND_API_KEY` and (if needed) `RESEND_FROM_EMAIL` are set.

### 3. Test with cron secret (production-like)

To test the same endpoint as Vercel Cron (requires **CRON_SECRET** in env):

```bash
curl -X POST "http://localhost:3000/api/reports/weekly?businessId=YOUR_BUSINESS_ID" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

Without `?businessId=...`, it sends to **all** Local Plus businesses (same as cron).

### 4. Environment variables

| Variable            | Purpose |
|---------------------|--------|
| `RESEND_API_KEY`    | Required for sending (Resend dashboard). |
| `RESEND_FROM_EMAIL` | Optional. From address (e.g. `onboarding@resend.dev` for testing). Default: `NeverMissLead-AI <notifications@nevermisslead.ai>`. |
| `CRON_SECRET`       | Required for non-test calls; set when using cron or production-like testing. |
