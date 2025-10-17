-- 🔧 RLS Performance Fix - Manual Application
-- Copy and paste this SQL into your Supabase SQL Editor

-- 1. Fix the main issue: prospects table RLS policy
DROP POLICY IF EXISTS "Users can read their own prospect record" ON public.prospects;
CREATE POLICY "Users can read their own prospect record" ON public.prospects
    FOR SELECT USING (user_id = (select auth.uid()));

-- 2. Fix other critical RLS policies for better performance
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can view own tenant" ON public.tenants;
CREATE POLICY "Users can view own tenant" ON public.tenants
    FOR SELECT USING (owner_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can view own dealership data" ON public.dealership_data;
CREATE POLICY "Users can view own dealership data" ON public.dealership_data
    FOR SELECT USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can view own subscription" ON public.subscriptions;
CREATE POLICY "Users can view own subscription" ON public.subscriptions
    FOR SELECT USING (user_id = (select auth.uid()));

-- 3. Create performance monitoring function
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

-- 4. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_prospects_user_id ON public.prospects(user_id);
CREATE INDEX IF NOT EXISTS idx_users_id ON public.users(id);
CREATE INDEX IF NOT EXISTS idx_tenants_owner_id ON public.tenants(owner_id);
CREATE INDEX IF NOT EXISTS idx_dealership_data_user_id ON public.dealership_data(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);

-- 5. Check for any remaining inefficient policies
SELECT 
    'RLS Performance Check Results:' as status,
    COUNT(*) as total_policies,
    COUNT(CASE WHEN is_inefficient THEN 1 END) as inefficient_policies
FROM check_rls_performance();

-- 6. Show any remaining inefficient policies
SELECT 
    tablename,
    policyname,
    definition
FROM check_rls_performance() 
WHERE is_inefficient = true;

-- 7. Success message
SELECT '✅ RLS Performance Fix Applied Successfully!' as result;
