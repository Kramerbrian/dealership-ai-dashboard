-- Verification queries for telemetry_events table
-- Run these in Supabase SQL Editor after creating the table

-- 1. Check if table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_name = 'telemetry_events'
);

-- 2. Check table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'telemetry_events'
ORDER BY ordinal_position;

-- 3. Check indexes
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'telemetry_events';

-- 4. Check RLS status
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'telemetry_events';

-- 5. Check policies
SELECT policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'telemetry_events';

-- 6. Test insert (should work with service role)
-- INSERT INTO telemetry_events (type, payload, ts, ip)
-- VALUES ('test', '{"test": true}'::jsonb, EXTRACT(EPOCH FROM NOW())::bigint * 1000, '127.0.0.1');

-- 7. Test select
SELECT * FROM telemetry_events LIMIT 5;

