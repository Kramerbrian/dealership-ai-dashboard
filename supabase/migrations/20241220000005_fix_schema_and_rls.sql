-- Fix Schema and RLS Issues
-- This migration ensures the public schema exists and sets up proper RLS policies

-- 1. Create public schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS public;

-- 2. Ensure all tables are in the public schema
-- Move any tables that might be in wrong schema to public
DO $$
BEGIN
    -- Check if security_events table exists and move to public schema if needed
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'security_events' AND table_schema != 'public') THEN
        ALTER TABLE security_events SET SCHEMA public;
    END IF;
    
    -- Check if ai_source_configs table exists and move to public schema if needed
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ai_source_configs' AND table_schema != 'public') THEN
        ALTER TABLE ai_source_configs SET SCHEMA public;
    END IF;
    
    -- Check if ai_visibility_metrics table exists and move to public schema if needed
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ai_visibility_metrics' AND table_schema != 'public') THEN
        ALTER TABLE ai_visibility_metrics SET SCHEMA public;
    END IF;
    
    -- Check if ai_insights table exists and move to public schema if needed
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ai_insights' AND table_schema != 'public') THEN
        ALTER TABLE ai_insights SET SCHEMA public;
    END IF;
    
    -- Check if ai_recommendations table exists and move to public schema if needed
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ai_recommendations' AND table_schema != 'public') THEN
        ALTER TABLE ai_recommendations SET SCHEMA public;
    END IF;
    
    -- Check if document_uploads table exists and move to public schema if needed
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'document_uploads' AND table_schema != 'public') THEN
        ALTER TABLE document_uploads SET SCHEMA public;
    END IF;
    
    -- Check if document_insights table exists and move to public schema if needed
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'document_insights' AND table_schema != 'public') THEN
        ALTER TABLE document_insights SET SCHEMA public;
    END IF;
END $$;

-- 3. Create security_events table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.security_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    event_data JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMPTZ
);

-- 4. Enable RLS on all tables
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

-- Enable RLS on AI-related tables if they exist
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ai_source_configs' AND table_schema = 'public') THEN
        ALTER TABLE public.ai_source_configs ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ai_visibility_metrics' AND table_schema = 'public') THEN
        ALTER TABLE public.ai_visibility_metrics ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ai_insights' AND table_schema = 'public') THEN
        ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ai_recommendations' AND table_schema = 'public') THEN
        ALTER TABLE public.ai_recommendations ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'document_uploads' AND table_schema = 'public') THEN
        ALTER TABLE public.document_uploads ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'document_insights' AND table_schema = 'public') THEN
        ALTER TABLE public.document_insights ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- 5. Create minimal RLS policies for security_events
DROP POLICY IF EXISTS "Auth select security_events" ON public.security_events;
CREATE POLICY "Auth select security_events"
  ON public.security_events
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Auth insert security_events" ON public.security_events;
CREATE POLICY "Auth insert security_events"
  ON public.security_events
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 6. Create RLS policies for AI tables if they exist
DO $$
BEGIN
    -- AI Source Configs policies
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ai_source_configs' AND table_schema = 'public') THEN
        DROP POLICY IF EXISTS "Users can view their own source configs" ON public.ai_source_configs;
        CREATE POLICY "Users can view their own source configs" ON public.ai_source_configs
            FOR SELECT USING (tenant_id = auth.uid()::text::uuid);
            
        DROP POLICY IF EXISTS "Users can insert their own source configs" ON public.ai_source_configs;
        CREATE POLICY "Users can insert their own source configs" ON public.ai_source_configs
            FOR INSERT WITH CHECK (tenant_id = auth.uid()::text::uuid);
    END IF;
    
    -- AI Visibility Metrics policies
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ai_visibility_metrics' AND table_schema = 'public') THEN
        DROP POLICY IF EXISTS "Users can view their own visibility metrics" ON public.ai_visibility_metrics;
        CREATE POLICY "Users can view their own visibility metrics" ON public.ai_visibility_metrics
            FOR SELECT USING (tenant_id = auth.uid()::text::uuid);
            
        DROP POLICY IF EXISTS "Users can insert their own visibility metrics" ON public.ai_visibility_metrics;
        CREATE POLICY "Users can insert their own visibility metrics" ON public.ai_visibility_metrics
            FOR INSERT WITH CHECK (tenant_id = auth.uid()::text::uuid);
    END IF;
    
    -- AI Insights policies
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ai_insights' AND table_schema = 'public') THEN
        DROP POLICY IF EXISTS "Users can view their own insights" ON public.ai_insights;
        CREATE POLICY "Users can view their own insights" ON public.ai_insights
            FOR SELECT USING (tenant_id = auth.uid()::text::uuid);
            
        DROP POLICY IF EXISTS "Users can insert their own insights" ON public.ai_insights;
        CREATE POLICY "Users can insert their own insights" ON public.ai_insights
            FOR INSERT WITH CHECK (tenant_id = auth.uid()::text::uuid);
    END IF;
    
    -- AI Recommendations policies
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ai_recommendations' AND table_schema = 'public') THEN
        DROP POLICY IF EXISTS "Users can view their own recommendations" ON public.ai_recommendations;
        CREATE POLICY "Users can view their own recommendations" ON public.ai_recommendations
            FOR SELECT USING (tenant_id = auth.uid()::text::uuid);
            
        DROP POLICY IF EXISTS "Users can insert their own recommendations" ON public.ai_recommendations;
        CREATE POLICY "Users can insert their own recommendations" ON public.ai_recommendations
            FOR INSERT WITH CHECK (tenant_id = auth.uid()::text::uuid);
    END IF;
    
    -- Document Uploads policies
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'document_uploads' AND table_schema = 'public') THEN
        DROP POLICY IF EXISTS "Users can view their own document uploads" ON public.document_uploads;
        CREATE POLICY "Users can view their own document uploads" ON public.document_uploads
            FOR SELECT USING (tenant_id = auth.uid()::text::uuid);
            
        DROP POLICY IF EXISTS "Users can insert their own document uploads" ON public.document_uploads;
        CREATE POLICY "Users can insert their own document uploads" ON public.document_uploads
            FOR INSERT WITH CHECK (tenant_id = auth.uid()::text::uuid);
    END IF;
    
    -- Document Insights policies
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'document_insights' AND table_schema = 'public') THEN
        DROP POLICY IF EXISTS "Users can view their own document insights" ON public.document_insights;
        CREATE POLICY "Users can view their own document insights" ON public.document_insights
            FOR SELECT USING (tenant_id = auth.uid()::text::uuid);
            
        DROP POLICY IF EXISTS "Users can insert their own document insights" ON public.document_insights;
        CREATE POLICY "Users can insert their own document insights" ON public.document_insights
            FOR INSERT WITH CHECK (tenant_id = auth.uid()::text::uuid);
    END IF;
END $$;

-- 7. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_security_events_tenant_id ON public.security_events(tenant_id);
CREATE INDEX IF NOT EXISTS idx_security_events_created_at ON public.security_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_events_event_type ON public.security_events(event_type);

-- 8. Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.security_events TO authenticated;

-- 9. Verify tables exist
DO $$
DECLARE
    table_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('security_events', 'ai_source_configs', 'ai_visibility_metrics', 'ai_insights', 'ai_recommendations', 'document_uploads', 'document_insights');
    
    RAISE NOTICE 'Found % AI-related tables in public schema', table_count;
END $$;

-- 10. Check RLS policies
DO $$
DECLARE
    policy_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename IN ('security_events', 'ai_source_configs', 'ai_visibility_metrics', 'ai_insights', 'ai_recommendations', 'document_uploads', 'document_insights');
    
    RAISE NOTICE 'Found % RLS policies in public schema', policy_count;
END $$;

-- Log completion
DO $$
BEGIN
    RAISE NOTICE 'Schema and RLS fix completed successfully!';
    RAISE NOTICE 'Public schema created/verified';
    RAISE NOTICE 'All tables moved to public schema';
    RAISE NOTICE 'RLS enabled on all tables';
    RAISE NOTICE 'Minimal RLS policies created';
    RAISE NOTICE 'Indexes created for performance';
    RAISE NOTICE 'Permissions granted to authenticated users';
END $$;
