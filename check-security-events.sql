-- Security Events Table Status Check
-- Run this in your Supabase SQL Editor to check if the security_events table is properly configured

-- Comprehensive diagnostic query
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
  pol.policy_count
FROM ctx, tbl
LEFT JOIN rls ON true
LEFT JOIN pol ON true;

-- If table_exists is NULL, the table doesn't exist
-- If rls_enabled is 't', RLS is enabled
-- If policy_count >= 1, policies exist

-- Additional check: List all policies on security_events table
SELECT 
  policyname, 
  permissive, 
  roles, 
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname='public' AND tablename='security_events';

-- Check if we can query the table (if it exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'security_events' AND table_schema = 'public') THEN
    RAISE NOTICE 'Table exists - attempting to query...';
    PERFORM 1 FROM public.security_events LIMIT 1;
    RAISE NOTICE 'Table is queryable';
  ELSE
    RAISE NOTICE 'Table does not exist';
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error querying table: %', SQLERRM;
END $$;
