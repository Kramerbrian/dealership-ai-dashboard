-- Supabase pg_cron Configuration for MSRP Sync
-- 
-- Enable pg_cron & http (Supabase: pre-enabled on shared; enable if self-hosted)
-- This creates a nightly trigger hitting your Next.js job route

-- Note: Replace YOUR_DASH_DOMAIN with your actual deployment URL
-- Example: https://dealershipai.com or https://dash.dealershipai.com

-- Create nightly MSRP sync job (runs at 2 AM daily)
SELECT cron.schedule(
  'msrp_sync_nightly',
  '0 2 * * *',
  $$SELECT net.http_get(
    url:='https://YOUR_DASH_DOMAIN/api/jobs/msrp-sync',
    headers:=jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.cron_secret', true)
    )
  )$$
);

-- Health probe: Check last 14 runs
-- Usage: SELECT * FROM cron.job_run_details WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname='msrp_sync_nightly') ORDER BY end_time DESC LIMIT 14;

-- Optional: Create weekly price changes report (runs Sunday at 3 AM)
SELECT cron.schedule(
  'price_changes_weekly',
  '0 3 * * 0',
  $$SELECT net.http_get(
    url:='https://YOUR_DASH_DOMAIN/api/price-changes?since=' || (NOW() - INTERVAL '7 days')::text,
    headers:=jsonb_build_object(
      'Content-Type', 'application/json'
    )
  )$$
);

-- Helper function to check cron job status
CREATE OR REPLACE FUNCTION check_cron_status(job_name TEXT)
RETURNS TABLE (
  jobid BIGINT,
  jobname TEXT,
  schedule TEXT,
  active BOOLEAN,
  last_run TIMESTAMPTZ,
  next_run TIMESTAMPTZ,
  last_status TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    j.jobid,
    j.jobname::TEXT,
    j.schedule::TEXT,
    j.active,
    MAX(jrd.start_time) as last_run,
    j.next_run,
    MAX(jrd.status::TEXT) FILTER (WHERE jrd.start_time = (SELECT MAX(start_time) FROM cron.job_run_details WHERE jobid = j.jobid)) as last_status
  FROM cron.job j
  LEFT JOIN cron.job_run_details jrd ON j.jobid = jrd.jobid
  WHERE j.jobname = job_name
  GROUP BY j.jobid, j.jobname, j.schedule, j.active, j.next_run;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION check_cron_status(TEXT) TO authenticated;

-- Set cron secret (store in Supabase secrets management)
-- In Supabase Dashboard: Settings > Database > Secrets
-- Key: CRON_SECRET, Value: your-secret-token

COMMENT ON FUNCTION check_cron_status IS 'Check status of a cron job including last run time and status';

