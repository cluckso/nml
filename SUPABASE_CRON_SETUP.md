# Supabase Cron: Weekly Reports

You can run the weekly reports job from **Supabase Cron** instead of (or in addition to) Vercel Cron.

## 1. Enable extensions

In **Supabase Dashboard** → **Database** → **Extensions**:

- Enable **pg_cron**
- Enable **pg_net** (for HTTP requests)

Or via SQL:

```sql
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;
```

## 2. Create the cron job

Open **SQL Editor** and run the script in `supabase/cron_weekly_reports.sql`.

**Before running**, replace:

- `YOUR_APP_URL` → `https://www.callgrabbr.com` (no trailing slash)
- `YOUR_CRON_SECRET` → same value as `CRON_SECRET` in your Next.js app env

Example after replacement:

```sql
SELECT cron.schedule(
  'weekly-reports',
  '0 9 * * 1',
  $$
  SELECT net.http_post(
    url := 'https://www.callgrabbr.com/api/reports/weekly',
    body := '{}'::jsonb,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer your_secret_here'
    ),
    timeout_milliseconds := 60000
  ) AS request_id;
  $$
);
```

Schedule: **every Monday at 09:00 UTC** (`0 9 * * 1`). Adjust the cron expression if you want a different time.

## 3. Verify

- **Jobs:** Dashboard → **Integrations** → **Cron** (or `SELECT * FROM cron.job;`)
- **Runs:** `SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 20;`
- **HTTP responses:** `net._http_response` (last ~6 hours)

## 4. Unschedule

To remove the job:

```sql
SELECT cron.unschedule('weekly-reports');
```

## Notes

- **pg_net** runs HTTP requests asynchronously; the cron job only triggers the request.
- Use the same `CRON_SECRET` in Supabase (in the SQL or via Vault) and in your app so `POST /api/reports/weekly` accepts the request.
- If you use both Vercel Cron and Supabase Cron, you may get two runs per week; keep one or the other, or use different schedules.
