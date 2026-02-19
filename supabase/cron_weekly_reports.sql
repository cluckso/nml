-- Supabase Cron: Weekly reports (Local Plus)
-- Run this in Supabase SQL Editor after enabling pg_cron and pg_net in Dashboard → Database → Extensions.
--
-- 1. Enable extensions (if not already enabled via Dashboard):
--    CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
--    CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;
--
-- 2. Replace placeholders below with your values:
--    - YOUR_APP_URL: https://www.callgrabbr.com (no trailing slash)
--    - YOUR_CRON_SECRET: same value as CRON_SECRET in your app env

SELECT cron.schedule(
  'weekly-reports',           -- job name (case-sensitive, cannot be changed later)
  '0 9 * * 1',               -- every Monday at 09:00 UTC
  $$
  SELECT net.http_post(
    url := 'YOUR_APP_URL/api/reports/weekly',
    body := '{}'::jsonb,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer YOUR_CRON_SECRET'
    ),
    timeout_milliseconds := 60000
  ) AS request_id;
  $$
);

-- To unschedule later:
-- SELECT cron.unschedule('weekly-reports');

-- To list jobs:
-- SELECT * FROM cron.job;

-- To see run history:
-- SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 20;
