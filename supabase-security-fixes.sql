-- DealershipAI Database Security Fixes
-- Run these commands in your Supabase SQL editor

-- 1. Enable Row Level Security (RLS) on all tables
ALTER TABLE public.dealership_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- 2. Create RLS policies for users table
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 3. Create RLS policies for tenants table
CREATE POLICY "Users can view own tenant" ON public.tenants
    FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Users can update own tenant" ON public.tenants
    FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert own tenant" ON public.tenants
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- 4. Create RLS policies for dealership_data table
CREATE POLICY "Users can view own dealership data" ON public.dealership_data
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own dealership data" ON public.dealership_data
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own dealership data" ON public.dealership_data
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 5. Fix function search_path issues
ALTER FUNCTION public.update_leads_updated_at() SET search_path = '';
ALTER FUNCTION public.update_updated_at_column() SET search_path = '';

-- 6. Move pg_trgm extension to extensions schema
CREATE SCHEMA IF NOT EXISTS extensions;
ALTER EXTENSION pg_trgm SET SCHEMA extensions;

-- 7. Create proper indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_auth_id ON public.users(auth_id);
CREATE INDEX IF NOT EXISTS idx_tenants_owner_id ON public.tenants(owner_id);
CREATE INDEX IF NOT EXISTS idx_dealership_data_user_id ON public.dealership_data(user_id);
CREATE INDEX IF NOT EXISTS idx_dealership_data_domain ON public.dealership_data(domain);

-- 8. Create updated_at triggers
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER set_updated_at_users
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_tenants
    BEFORE UPDATE ON public.tenants
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_dealership_data
    BEFORE UPDATE ON public.dealership_data
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 9. Create subscription management tables
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    stripe_subscription_id TEXT UNIQUE,
    stripe_customer_id TEXT,
    plan_type TEXT NOT NULL CHECK (plan_type IN ('free', 'professional', 'enterprise')),
    status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'unpaid', 'trialing')),
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    trial_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on subscriptions
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for subscriptions
CREATE POLICY "Users can view own subscription" ON public.subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription" ON public.subscriptions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscription" ON public.subscriptions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create index for subscriptions
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_id ON public.subscriptions(stripe_subscription_id);

-- Apply updated_at trigger to subscriptions
CREATE TRIGGER set_updated_at_subscriptions
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 10. Create usage tracking table
CREATE TABLE IF NOT EXISTS public.usage_tracking (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    feature TEXT NOT NULL,
    usage_count INTEGER DEFAULT 1,
    usage_date DATE DEFAULT CURRENT_DATE,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on usage_tracking
ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for usage_tracking
CREATE POLICY "Users can view own usage" ON public.usage_tracking
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own usage" ON public.usage_tracking
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create indexes for usage_tracking
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_id ON public.usage_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_date ON public.usage_tracking(usage_date);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_feature ON public.usage_tracking(feature);

-- 11. Create analytics events table
CREATE TABLE IF NOT EXISTS public.analytics_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    event_data JSONB,
    session_id TEXT,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on analytics_events
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for analytics_events
CREATE POLICY "Users can view own analytics" ON public.analytics_events
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analytics" ON public.analytics_events
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create indexes for analytics_events
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON public.analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON public.analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON public.analytics_events(created_at);

-- 12. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- 13. Create helper functions for subscription management
CREATE OR REPLACE FUNCTION public.get_user_subscription(user_uuid UUID)
RETURNS TABLE (
    plan_type TEXT,
    status TEXT,
    current_period_end TIMESTAMP WITH TIME ZONE,
    trial_end TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT s.plan_type, s.status, s.current_period_end, s.trial_end
    FROM public.subscriptions s
    WHERE s.user_id = user_uuid
    AND s.status IN ('active', 'trialing')
    ORDER BY s.created_at DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 14. Create function to check feature access
CREATE OR REPLACE FUNCTION public.can_access_feature(user_uuid UUID, feature_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    user_plan TEXT;
    user_status TEXT;
BEGIN
    SELECT plan_type, status INTO user_plan, user_status
    FROM public.get_user_subscription(user_uuid);
    
    -- Free plan limitations
    IF user_plan = 'free' THEN
        CASE feature_name
            WHEN 'seo_analysis' THEN RETURN TRUE;
            WHEN 'aeo_analysis' THEN RETURN TRUE;
            WHEN 'geo_analysis' THEN RETURN TRUE;
            WHEN 'advanced_analytics' THEN RETURN FALSE;
            WHEN 'custom_reports' THEN RETURN FALSE;
            WHEN 'api_access' THEN RETURN FALSE;
            WHEN 'white_label' THEN RETURN FALSE;
            ELSE RETURN FALSE;
        END CASE;
    END IF;
    
    -- Professional plan
    IF user_plan = 'professional' THEN
        CASE feature_name
            WHEN 'seo_analysis' THEN RETURN TRUE;
            WHEN 'aeo_analysis' THEN RETURN TRUE;
            WHEN 'geo_analysis' THEN RETURN TRUE;
            WHEN 'advanced_analytics' THEN RETURN TRUE;
            WHEN 'custom_reports' THEN RETURN TRUE;
            WHEN 'api_access' THEN RETURN FALSE;
            WHEN 'white_label' THEN RETURN FALSE;
            ELSE RETURN TRUE;
        END CASE;
    END IF;
    
    -- Enterprise plan - access to everything
    IF user_plan = 'enterprise' THEN
        RETURN TRUE;
    END IF;
    
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 15. Create function to track usage
CREATE OR REPLACE FUNCTION public.track_feature_usage(user_uuid UUID, feature_name TEXT, usage_metadata JSONB DEFAULT NULL)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.usage_tracking (user_id, feature, metadata)
    VALUES (user_uuid, feature_name, usage_metadata)
    ON CONFLICT (user_id, feature, usage_date) 
    DO UPDATE SET 
        usage_count = usage_tracking.usage_count + 1,
        metadata = COALESCE(usage_tracking.metadata, '{}'::jsonb) || COALESCE(usage_metadata, '{}'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE public.subscriptions IS 'User subscription management with Stripe integration';
COMMENT ON TABLE public.usage_tracking IS 'Feature usage tracking for billing and analytics';
COMMENT ON TABLE public.analytics_events IS 'User analytics events for dashboard insights';
