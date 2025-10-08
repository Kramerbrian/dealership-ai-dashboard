-- Database Schema Verification Queries
-- Run these after executing setup-database-simplified.sql

-- 1. Check all tables were created
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Expected tables:
-- api_usage, audit_log, competitors, dealership_data,
-- market_analysis, score_history, tenants, users

-- 2. Check custom types were created
SELECT typname
FROM pg_type
WHERE typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
  AND typtype = 'e'
ORDER BY typname;

-- Expected types:
-- notification_type, review_sentiment, subscription_status,
-- subscription_tier, tenant_type, user_role

-- 3. Verify sample data - Check tenants
SELECT id, name, type, subscription_tier, subscription_status, rooftop_count
FROM tenants
ORDER BY created_at;

-- Expected: 2 rows (Demo Dealership Group, Test Auto Group)

-- 4. Verify sample data - Check users
SELECT id, clerk_id, email, full_name, role
FROM users
ORDER BY created_at;

-- Expected: 2 rows (admin@demodealership.com, manager@testautogroup.com)

-- 5. Verify sample data - Check dealerships
SELECT id, tenant_id, name, domain, ai_visibility_score, seo_score, aeo_score, geo_score, eeat_score
FROM dealership_data
ORDER BY created_at;

-- Expected: 2 rows (Demo Dealership, Test Auto Group)

-- 6. Verify sample data - Check score history
SELECT id, dealership_id, ai_visibility_score, seo_score, aeo_score, geo_score, eeat_score
FROM score_history
ORDER BY created_at;

-- Expected: 2 rows with historical scores

-- 7. Check indexes were created
SELECT
    schemaname,
    tablename,
    indexname
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- Expected: Multiple indexes on tenants, users, dealership_data, etc.

-- 8. Check RLS is enabled
SELECT
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Expected: rowsecurity = true for all tables

-- 9. Check RLS policies exist
SELECT
    schemaname,
    tablename,
    policyname,
    cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Expected: SELECT policies for each table

-- 10. Quick data summary
SELECT
    'tenants' as table_name, COUNT(*) as row_count FROM tenants
UNION ALL
SELECT 'users', COUNT(*) FROM users
UNION ALL
SELECT 'dealership_data', COUNT(*) FROM dealership_data
UNION ALL
SELECT 'score_history', COUNT(*) FROM score_history
UNION ALL
SELECT 'competitors', COUNT(*) FROM competitors
UNION ALL
SELECT 'market_analysis', COUNT(*) FROM market_analysis
UNION ALL
SELECT 'audit_log', COUNT(*) FROM audit_log
UNION ALL
SELECT 'api_usage', COUNT(*) FROM api_usage
ORDER BY table_name;
