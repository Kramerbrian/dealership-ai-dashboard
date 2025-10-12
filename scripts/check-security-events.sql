-- DealershipAI v2.0 - Security Events Diagnostic
-- Run this to check the status of security_events table and RLS

WITH ctx AS (
  SELECT current_database() AS db, current_schema() AS schema, current_user AS usr, current_setting('search_path') AS search_path
),
tbl AS (
  SELECT to_regclass('public.security_events') AS reg
),
rls AS (
  SELECT c.relrowsecurity AS rls_enabled
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public' AND c.relname = 'security_events'
),
pol AS (
  SELECT count(*) AS policy_count
  FROM pg_policies
  WHERE schemaname='public' AND tablename='security_events'
)
SELECT 
  ctx.db, 
  ctx.schema, 
  ctx.usr, 
  ctx.search_path, 
  tbl.reg AS table_exists, 
  rls.rls_enabled, 
  pol.policy_count,
  CASE 
    WHEN tbl.reg IS NULL THEN '❌ Table missing - run migration'
    WHEN rls.rls_enabled = false THEN '⚠️  Table exists but RLS disabled'
    WHEN pol.policy_count = 0 THEN '⚠️  Table exists, RLS enabled, but no policies'
    ELSE '✅ Table exists, RLS enabled, policies configured'
  END AS status
FROM ctx, tbl
LEFT JOIN rls ON true
LEFT JOIN pol ON true;
