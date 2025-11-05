-- Enable pg_cron extension (if not already enabled)
-- Note: On Supabase shared, pg_cron is pre-enabled
-- For self-hosted, run: CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create nightly trigger for MSRP sync
-- Runs at 2 AM EST (UTC-5) = 7 AM UTC
-- Adjust timezone as needed for your region

SELECT cron.schedule(
  'msrp_sync_nightly',
  '0 7 * * *', -- 2 AM EST / 7 AM UTC daily
  $$
  SELECT net.http_get(
    url := 'https://YOUR_DASH_DOMAIN/api/jobs/msrp-sync',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.service_role_key', true)
    )
  ) AS response;
  $$
);

-- Health probe query: last 14 runs
-- Run this to check recent execution history:
-- SELECT * FROM cron.job_run_details
-- WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'msrp_sync_nightly')
-- ORDER BY end_time DESC
-- LIMIT 14;

-- Optional: Create a view for easy monitoring
CREATE OR REPLACE VIEW msrp_sync_status AS
SELECT 
  j.jobid,
  j.jobname,
  j.schedule,
  j.active,
  jrd.runid,
  jrd.start_time,
  jrd.end_time,
  jrd.status,
  jrd.return_message,
  EXTRACT(EPOCH FROM (jrd.end_time - jrd.start_time)) AS duration_seconds
FROM cron.job j
LEFT JOIN cron.job_run_details jrd ON j.jobid = jrd.jobid
WHERE j.jobname = 'msrp_sync_nightly'
ORDER BY jrd.end_time DESC NULLS LAST
LIMIT 14;

-- Grant access (adjust as needed for your RLS policies)
GRANT SELECT ON msrp_sync_status TO authenticated;

