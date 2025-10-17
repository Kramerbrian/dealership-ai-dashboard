-- DealershipAI RLS Performance Optimization
-- Fix suboptimal query performance by replacing auth.<function>() with (select auth.<function>())

-- 1. Fix prospects table RLS policy
-- Drop the existing inefficient policy
DROP POLICY IF EXISTS "Users can read their own prospect record" ON public.prospects;

-- Create optimized policy using subquery
CREATE POLICY "Users can read their own prospect record" ON public.prospects
    FOR SELECT USING (user_id = (select auth.uid()));

-- 2. Check for other tables with similar RLS performance issues
-- Fix users table policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
CREATE POLICY "Users can insert own profile" ON public.users
    FOR INSERT WITH CHECK (id = (select auth.uid()));

-- 3. Fix tenants table policies
DROP POLICY IF EXISTS "Users can view own tenant" ON public.tenants;
CREATE POLICY "Users can view own tenant" ON public.tenants
    FOR SELECT USING (owner_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own tenant" ON public.tenants;
CREATE POLICY "Users can update own tenant" ON public.tenants
    FOR UPDATE USING (owner_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert own tenant" ON public.tenants;
CREATE POLICY "Users can insert own tenant" ON public.tenants
    FOR INSERT WITH CHECK (owner_id = (select auth.uid()));

-- 4. Fix dealership_data table policies
DROP POLICY IF EXISTS "Users can view own dealership data" ON public.dealership_data;
CREATE POLICY "Users can view own dealership data" ON public.dealership_data
    FOR SELECT USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own dealership data" ON public.dealership_data;
CREATE POLICY "Users can update own dealership data" ON public.dealership_data
    FOR UPDATE USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert own dealership data" ON public.dealership_data;
CREATE POLICY "Users can insert own dealership data" ON public.dealership_data
    FOR INSERT WITH CHECK (user_id = (select auth.uid()));

-- 5. Fix subscriptions table policies
DROP POLICY IF EXISTS "Users can view own subscription" ON public.subscriptions;
CREATE POLICY "Users can view own subscription" ON public.subscriptions
    FOR SELECT USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own subscription" ON public.subscriptions;
CREATE POLICY "Users can update own subscription" ON public.subscriptions
    FOR UPDATE USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert own subscription" ON public.subscriptions;
CREATE POLICY "Users can insert own subscription" ON public.subscriptions
    FOR INSERT WITH CHECK (user_id = (select auth.uid()));

-- 6. Fix usage_tracking table policies
DROP POLICY IF EXISTS "Users can view own usage" ON public.usage_tracking;
CREATE POLICY "Users can view own usage" ON public.usage_tracking
    FOR SELECT USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert own usage" ON public.usage_tracking;
CREATE POLICY "Users can insert own usage" ON public.usage_tracking
    FOR INSERT WITH CHECK (user_id = (select auth.uid()));

-- 7. Fix analytics_events table policies
DROP POLICY IF EXISTS "Users can view own analytics" ON public.analytics_events;
CREATE POLICY "Users can view own analytics" ON public.analytics_events
    FOR SELECT USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert own analytics" ON public.analytics_events;
CREATE POLICY "Users can insert own analytics" ON public.analytics_events
    FOR INSERT WITH CHECK (user_id = (select auth.uid()));

-- 8. Create a function to check for remaining inefficient RLS policies
CREATE OR REPLACE FUNCTION check_rls_performance()
RETURNS TABLE (
    schemaname text,
    tablename text,
    policyname text,
    definition text,
    is_inefficient boolean
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        n.nspname::text as schemaname,
        c.relname::text as tablename,
        pol.polname::text as policyname,
        pg_get_expr(pol.polqual, pol.polrelid)::text as definition,
        CASE 
            WHEN pg_get_expr(pol.polqual, pol.polrelid)::text LIKE '%auth.uid()%' 
                 AND pg_get_expr(pol.polqual, pol.polrelid)::text NOT LIKE '%(select auth.uid())%'
            THEN true
            ELSE false
        END as is_inefficient
    FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
    AND pol.polqual IS NOT NULL
    ORDER BY c.relname, pol.polname;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Run the performance check
SELECT * FROM check_rls_performance() WHERE is_inefficient = true;

-- 10. Create optimized helper functions for common RLS patterns
CREATE OR REPLACE FUNCTION current_user_id()
RETURNS uuid AS $$
BEGIN
    RETURN (select auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 11. Create a function to automatically fix inefficient RLS policies
CREATE OR REPLACE FUNCTION fix_inefficient_rls_policies()
RETURNS TABLE (
    table_name text,
    policy_name text,
    action_taken text
) AS $$
DECLARE
    policy_record RECORD;
    new_definition text;
BEGIN
    -- Loop through all inefficient policies
    FOR policy_record IN 
        SELECT 
            c.relname::text as tablename,
            pol.polname::text as policyname,
            pol.polcmd as polcmd,
            pg_get_expr(pol.polqual, pol.polrelid)::text as definition,
            pg_get_expr(pol.polwithcheck, pol.polrelid)::text as withcheck
        FROM pg_policy pol
        JOIN pg_class c ON c.oid = pol.polrelid
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public'
        AND pol.polqual IS NOT NULL
        AND pg_get_expr(pol.polqual, pol.polrelid)::text LIKE '%auth.uid()%'
        AND pg_get_expr(pol.polqual, pol.polrelid)::text NOT LIKE '%(select auth.uid())%'
    LOOP
        -- Replace auth.uid() with (select auth.uid())
        new_definition := replace(policy_record.definition, 'auth.uid()', '(select auth.uid())');
        
        -- Drop and recreate the policy
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', policy_record.policyname, policy_record.tablename);
        
        IF policy_record.polcmd = 'r' THEN
            EXECUTE format('CREATE POLICY %I ON %I FOR SELECT USING (%s)', 
                policy_record.policyname, policy_record.tablename, new_definition);
        ELSIF policy_record.polcmd = 'a' THEN
            EXECUTE format('CREATE POLICY %I ON %I FOR INSERT WITH CHECK (%s)', 
                policy_record.policyname, policy_record.tablename, new_definition);
        ELSIF policy_record.polcmd = 'w' THEN
            EXECUTE format('CREATE POLICY %I ON %I FOR UPDATE USING (%s)', 
                policy_record.policyname, policy_record.tablename, new_definition);
        ELSIF policy_record.polcmd = 'd' THEN
            EXECUTE format('CREATE POLICY %I ON %I FOR DELETE USING (%s)', 
                policy_record.policyname, policy_record.tablename, new_definition);
        END IF;
        
        -- Return the action taken
        table_name := policy_record.tablename;
        policy_name := policy_record.policyname;
        action_taken := 'Fixed inefficient auth.uid() call';
        
        RETURN NEXT;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. Run the automatic fix
SELECT * FROM fix_inefficient_rls_policies();

-- 13. Verify the fixes
SELECT * FROM check_rls_performance() WHERE is_inefficient = true;

-- 14. Create indexes to further optimize RLS performance
CREATE INDEX IF NOT EXISTS idx_prospects_user_id ON public.prospects(user_id);
CREATE INDEX IF NOT EXISTS idx_users_id ON public.users(id);
CREATE INDEX IF NOT EXISTS idx_tenants_owner_id ON public.tenants(owner_id);
CREATE INDEX IF NOT EXISTS idx_dealership_data_user_id ON public.dealership_data(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_id ON public.usage_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON public.analytics_events(user_id);

-- 15. Create a monitoring function to track RLS performance
CREATE OR REPLACE FUNCTION monitor_rls_performance()
RETURNS TABLE (
    table_name text,
    total_policies integer,
    efficient_policies integer,
    inefficient_policies integer,
    performance_score numeric
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.relname::text as table_name,
        COUNT(*)::integer as total_policies,
        COUNT(CASE 
            WHEN pg_get_expr(pol.polqual, pol.polrelid)::text NOT LIKE '%auth.uid()%' 
                 OR pg_get_expr(pol.polqual, pol.polrelid)::text LIKE '%(select auth.uid())%'
            THEN 1 
        END)::integer as efficient_policies,
        COUNT(CASE 
            WHEN pg_get_expr(pol.polqual, pol.polrelid)::text LIKE '%auth.uid()%' 
                 AND pg_get_expr(pol.polqual, pol.polrelid)::text NOT LIKE '%(select auth.uid())%'
            THEN 1 
        END)::integer as inefficient_policies,
        ROUND(
            (COUNT(CASE 
                WHEN pg_get_expr(pol.polqual, pol.polrelid)::text NOT LIKE '%auth.uid()%' 
                     OR pg_get_expr(pol.polqual, pol.polrelid)::text LIKE '%(select auth.uid())%'
                THEN 1 
            END)::numeric / COUNT(*)::numeric) * 100, 2
        ) as performance_score
    FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
    AND pol.polqual IS NOT NULL
    GROUP BY c.relname
    ORDER BY performance_score DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 16. Run the performance monitoring
SELECT * FROM monitor_rls_performance();

-- 17. Create a summary report
SELECT 
    'RLS Performance Optimization Complete' as status,
    COUNT(*) as total_tables_optimized,
    SUM(CASE WHEN performance_score = 100 THEN 1 ELSE 0 END) as fully_optimized_tables,
    ROUND(AVG(performance_score), 2) as average_performance_score
FROM monitor_rls_performance();

COMMENT ON FUNCTION check_rls_performance() IS 'Check for inefficient RLS policies that use auth.uid() without subquery';
COMMENT ON FUNCTION fix_inefficient_rls_policies() IS 'Automatically fix inefficient RLS policies by wrapping auth.uid() in subquery';
COMMENT ON FUNCTION monitor_rls_performance() IS 'Monitor RLS performance across all tables';
COMMENT ON FUNCTION current_user_id() IS 'Optimized helper function for getting current user ID in RLS policies';
