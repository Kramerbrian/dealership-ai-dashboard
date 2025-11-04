SELECT 
    tablename,
    policyname,
    CASE 
        WHEN definition LIKE '%(SELECT auth.uid())%' THEN '✅ Optimized'
        WHEN definition LIKE '%(select auth.uid())%' THEN '✅ Optimized'
        WHEN definition LIKE '%auth.uid()%' THEN '⚠️ Needs Fix'
        ELSE 'N/A'
    END as status
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename;

