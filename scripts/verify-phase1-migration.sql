-- Verification Queries for Phase 1 Database Optimization Migration
-- Run these in Supabase SQL Editor to verify the migration was successful

-- ==============================================
-- 1. Check RLS Performance Status
-- ==============================================
SELECT * FROM check_rls_performance();

-- Expected: All policies should show is_inefficient = false
-- If any show true, those policies need optimization

-- ==============================================
-- 2. Verify Indexes Were Created
-- ==============================================
SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
AND indexname LIKE 'idx_%'
AND (
    indexname LIKE 'idx_users_%' OR
    indexname LIKE 'idx_tenants_%' OR
    indexname LIKE 'idx_dealerships_%' OR
    indexname LIKE 'idx_dealership_data_%' OR
    indexname LIKE 'idx_analytics_events_%' OR
    indexname LIKE 'idx_prospects_%' OR
    indexname LIKE 'idx_subscriptions_%' OR
    indexname LIKE 'idx_audit_logs_%'
)
ORDER BY tablename, indexname;

-- Expected: 20+ indexes should be listed

-- ==============================================
-- 3. Count Total Indexes by Table
-- ==============================================
SELECT 
    tablename,
    COUNT(*) as index_count,
    array_agg(indexname ORDER BY indexname) as indexes
FROM pg_indexes
WHERE schemaname = 'public'
AND indexname LIKE 'idx_%'
GROUP BY tablename
ORDER BY index_count DESC;

-- ==============================================
-- 4. Check RLS Policies Optimization Status
-- ==============================================
SELECT 
    schemaname,
    tablename,
    policyname,
    CASE 
        WHEN definition LIKE '%(SELECT auth.uid())%' THEN '✅ Optimized'
        WHEN definition LIKE '%(select auth.uid())%' THEN '✅ Optimized'
        WHEN definition LIKE '%auth.uid()%' THEN '⚠️ Needs Optimization'
        ELSE 'N/A'
    END as optimization_status,
    CASE 
        WHEN definition LIKE '%(SELECT auth.jwt()%' THEN '✅ Optimized (JWT)'
        WHEN definition LIKE '%auth.jwt()%' THEN '⚠️ Needs Optimization (JWT)'
        ELSE 'N/A'
    END as jwt_status
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ==============================================
-- 5. Performance Test Query
-- ==============================================
-- Test a common query that should be faster now
EXPLAIN ANALYZE
SELECT * FROM users 
WHERE clerk_id = 'test-user-id' 
LIMIT 1;

-- Check if index is being used (should see "Index Scan" not "Seq Scan")

-- ==============================================
-- 6. Summary Statistics
-- ==============================================
SELECT 
    'RLS Policies' as metric,
    COUNT(*) as count,
    COUNT(*) FILTER (WHERE definition LIKE '%(SELECT auth.uid())%' OR definition LIKE '%(select auth.uid())%') as optimized,
    COUNT(*) FILTER (WHERE definition LIKE '%auth.uid()%' AND definition NOT LIKE '%(SELECT auth.uid())%' AND definition NOT LIKE '%(select auth.uid())%') as needs_optimization
FROM pg_policies
WHERE schemaname = 'public'
UNION ALL
SELECT 
    'Strategic Indexes' as metric,
    COUNT(*) as count,
    COUNT(*) as optimized,
    0 as needs_optimization
FROM pg_indexes
WHERE schemaname = 'public'
AND indexname LIKE 'idx_%';

