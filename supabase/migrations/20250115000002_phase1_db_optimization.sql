-- Phase 1: Database Query Optimization
-- Fix RLS policies and add strategic indexes for 10-100x performance improvement

-- ==============================================
-- PART 1: RLS PERFORMANCE FIXES
-- ==============================================
-- Replace auth.uid() with (select auth.uid()) to prevent re-evaluation per row

-- Fix users table policies
DROP POLICY IF EXISTS "Users can view their own data" ON public.users;
CREATE POLICY "Users can view their own data" ON public.users
    FOR SELECT USING (id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can update their own data" ON public.users;
CREATE POLICY "Users can update their own data" ON public.users
    FOR UPDATE USING (id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can insert their own data" ON public.users;
CREATE POLICY "Users can insert their own data" ON public.users
    FOR INSERT WITH CHECK (id = (SELECT auth.uid()));

-- Fix dealerships table policies
DROP POLICY IF EXISTS "Users can view their own dealerships" ON public.dealerships;
CREATE POLICY "Users can view their own dealerships" ON public.dealerships
    FOR SELECT USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can insert their own dealerships" ON public.dealerships;
CREATE POLICY "Users can insert their own dealerships" ON public.dealerships
    FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can update their own dealerships" ON public.dealerships;
CREATE POLICY "Users can update their own dealerships" ON public.dealerships
    FOR UPDATE USING (user_id = (SELECT auth.uid()));

-- Fix tenants table policies
DROP POLICY IF EXISTS "Users can view their own tenant" ON public.tenants;
CREATE POLICY "Users can view their own tenant" ON public.tenants
    FOR SELECT USING (
        id IN (
            SELECT tenant_id FROM public.users 
            WHERE clerk_id = (SELECT auth.jwt() ->> 'sub')
        )
    );

DROP POLICY IF EXISTS "Users can view users in their tenant" ON public.users;
CREATE POLICY "Users can view users in their tenant" ON public.users
    FOR SELECT USING (
        tenant_id IN (
            SELECT tenant_id FROM public.users 
            WHERE clerk_id = (SELECT auth.jwt() ->> 'sub')
        )
    );

-- Fix dealership_data table policies
DROP POLICY IF EXISTS "Users can view data for their tenant" ON public.dealership_data;
CREATE POLICY "Users can view data for their tenant" ON public.dealership_data
    FOR SELECT USING (
        tenant_id IN (
            SELECT tenant_id FROM public.users 
            WHERE clerk_id = (SELECT auth.jwt() ->> 'sub')
        )
    );

DROP POLICY IF EXISTS "Users can update data for their tenant" ON public.dealership_data;
CREATE POLICY "Users can update data for their tenant" ON public.dealership_data
    FOR UPDATE USING (
        tenant_id IN (
            SELECT tenant_id FROM public.users 
            WHERE clerk_id = (SELECT auth.jwt() ->> 'sub')
        )
    );

-- Fix prospects table (if exists)
DROP POLICY IF EXISTS "Users can read their own prospect record" ON public.prospects;
CREATE POLICY "Users can read their own prospect record" ON public.prospects
    FOR SELECT USING (user_id = (SELECT auth.uid()));

-- Fix subscriptions table
DROP POLICY IF EXISTS "Users can view their own subscription" ON public.subscriptions;
CREATE POLICY "Users can view their own subscription" ON public.subscriptions
    FOR SELECT USING (user_id = (SELECT auth.uid()));

-- Fix analytics_events table
DROP POLICY IF EXISTS "Users can view their own analytics events" ON public.analytics_events;
CREATE POLICY "Users can view their own analytics events" ON public.analytics_events
    FOR SELECT USING (
        tenant_id IN (
            SELECT tenant_id FROM public.users 
            WHERE clerk_id = (SELECT auth.jwt() ->> 'sub')
        )
    );

-- Fix audit_logs table
DROP POLICY IF EXISTS "Users can view their own audit logs" ON public.audit_logs;
CREATE POLICY "Users can view their own audit logs" ON public.audit_logs
    FOR SELECT USING (
        tenant_id IN (
            SELECT tenant_id FROM public.users 
            WHERE clerk_id = (SELECT auth.jwt() ->> 'sub')
        )
    );

-- ==============================================
-- PART 2: STRATEGIC INDEXES
-- ==============================================

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON public.users(clerk_id);
CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON public.users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users(created_at DESC);

-- Tenants table indexes
CREATE INDEX IF NOT EXISTS idx_tenants_owner_id ON public.tenants(owner_id);
CREATE INDEX IF NOT EXISTS idx_tenants_created_at ON public.tenants(created_at DESC);

-- Dealerships table indexes
CREATE INDEX IF NOT EXISTS idx_dealerships_user_id ON public.dealerships(user_id);
CREATE INDEX IF NOT EXISTS idx_dealerships_domain ON public.dealerships(domain);
CREATE INDEX IF NOT EXISTS idx_dealerships_created_at ON public.dealerships(created_at DESC);

-- Dealership_data table indexes
CREATE INDEX IF NOT EXISTS idx_dealership_data_tenant_id ON public.dealership_data(tenant_id);
CREATE INDEX IF NOT EXISTS idx_dealership_data_dealer_id ON public.dealership_data(dealer_id);
CREATE INDEX IF NOT EXISTS idx_dealership_data_timestamp ON public.dealership_data(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_dealership_data_tenant_timestamp ON public.dealership_data(tenant_id, timestamp DESC);

-- Analytics_events table indexes (if exists)
CREATE INDEX IF NOT EXISTS idx_analytics_events_tenant_id ON public.analytics_events(tenant_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp ON public.analytics_events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON public.analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_tenant_timestamp ON public.analytics_events(tenant_id, timestamp DESC);

-- Prospects table indexes (if exists)
CREATE INDEX IF NOT EXISTS idx_prospects_user_id ON public.prospects(user_id);
CREATE INDEX IF NOT EXISTS idx_prospects_created_at ON public.prospects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_prospects_status ON public.prospects(status);

-- Subscriptions table indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id ON public.subscriptions(stripe_customer_id);

-- Audit_logs table indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_id ON public.audit_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_created ON public.audit_logs(tenant_id, created_at DESC);

-- Usage_tracking table indexes (if exists)
CREATE INDEX IF NOT EXISTS idx_usage_tracking_tenant_id ON public.usage_tracking(tenant_id);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_billing_period ON public.usage_tracking(billing_period DESC);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_tenant_period ON public.usage_tracking(tenant_id, billing_period DESC);

-- Reviews table indexes (if exists)
CREATE INDEX IF NOT EXISTS idx_reviews_tenant_id ON public.reviews(tenant_id);
CREATE INDEX IF NOT EXISTS idx_reviews_platform ON public.reviews(platform);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON public.reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_needs_response ON public.reviews(needs_response) WHERE needs_response = true;

-- ==============================================
-- PART 3: COMPOSITE INDEXES FOR COMMON QUERIES
-- ==============================================

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_users_tenant_clerk ON public.users(tenant_id, clerk_id);
CREATE INDEX IF NOT EXISTS idx_dealership_data_tenant_dealer_timestamp ON public.dealership_data(tenant_id, dealer_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_tenant_type_timestamp ON public.analytics_events(tenant_id, event_type, timestamp DESC);

-- ==============================================
-- PART 4: PERFORMANCE MONITORING FUNCTION
-- ==============================================

-- Function to check RLS policy efficiency
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
                 AND pg_get_expr(pol.polqual, pol.polrelid)::text NOT LIKE '%(SELECT auth.uid())%'
            THEN true
            ELSE false
        END as is_inefficient
    FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
    ORDER BY is_inefficient DESC, c.relname, pol.polname;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================
-- MIGRATION COMPLETE
-- ==============================================
-- Expected improvements:
-- 1. RLS policies: 10-100x faster evaluation
-- 2. Indexes: Faster lookups on frequently queried columns
-- 3. Composite indexes: Optimized common query patterns
-- 4. Monitoring: Easy identification of remaining issues

