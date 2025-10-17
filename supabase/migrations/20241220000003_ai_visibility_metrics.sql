-- AI Visibility Metrics Migration
-- This migration creates tables for storing AI visibility metrics from various sources

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create AI source configurations table
CREATE TABLE IF NOT EXISTS ai_source_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    platform VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    api_endpoint TEXT,
    api_key TEXT,
    refresh_interval INTEGER DEFAULT 60, -- in minutes
    enabled BOOLEAN DEFAULT true,
    sync_status VARCHAR(50) DEFAULT 'idle', -- idle, syncing, error, success
    last_sync TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create AI visibility metrics table
CREATE TABLE IF NOT EXISTS ai_visibility_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    source_id VARCHAR(255) NOT NULL,
    platform VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    visibility DECIMAL(5,2) NOT NULL, -- 0-100
    engagement DECIMAL(5,2) NOT NULL, -- 0-100
    reach INTEGER NOT NULL,
    sentiment DECIMAL(5,2) NOT NULL, -- 0-100
    conversion DECIMAL(5,2) NOT NULL, -- 0-100
    authority DECIMAL(5,2) NOT NULL, -- 0-100
    influence DECIMAL(5,2) NOT NULL, -- 0-100
    growth DECIMAL(5,2) NOT NULL, -- 0-100
    timestamp TIMESTAMPTZ NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create AI insights table
CREATE TABLE IF NOT EXISTS ai_insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    type VARCHAR(50) NOT NULL, -- opportunity, threat, trend, recommendation, alert, achievement
    priority VARCHAR(20) NOT NULL, -- low, medium, high, critical
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    impact DECIMAL(5,2) NOT NULL, -- 1-100
    confidence DECIMAL(5,2) NOT NULL, -- 1-100
    source VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    tags TEXT[],
    action_required BOOLEAN DEFAULT false,
    action_text TEXT,
    action_url TEXT,
    metrics JSONB,
    related_insights UUID[],
    ai_generated BOOLEAN DEFAULT true,
    verified BOOLEAN DEFAULT false,
    cost DECIMAL(10,2) DEFAULT 0,
    effort VARCHAR(20) DEFAULT 'medium', -- low, medium, high
    timeframe VARCHAR(20) DEFAULT 'medium', -- immediate, short, medium, long
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create AI recommendations table
CREATE TABLE IF NOT EXISTS ai_recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    priority VARCHAR(20) NOT NULL, -- low, medium, high, critical
    impact DECIMAL(5,2) NOT NULL, -- 1-100
    effort VARCHAR(20) NOT NULL, -- low, medium, high
    cost DECIMAL(10,2) NOT NULL,
    timeframe VARCHAR(20) NOT NULL, -- immediate, short, medium, long
    roi DECIMAL(5,2) NOT NULL, -- return on investment percentage
    success_rate DECIMAL(5,2) NOT NULL, -- 1-100
    prerequisites TEXT[],
    steps TEXT[],
    expected_outcome TEXT NOT NULL,
    metrics JSONB,
    ai_generated BOOLEAN DEFAULT true,
    verified BOOLEAN DEFAULT false,
    status VARCHAR(20) DEFAULT 'pending', -- pending, in_progress, completed, cancelled
    assigned_to VARCHAR(255),
    due_date TIMESTAMPTZ,
    progress DECIMAL(5,2) DEFAULT 0, -- 0-100
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create AI insights metrics aggregation table
CREATE TABLE IF NOT EXISTS ai_insights_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    date DATE NOT NULL,
    total_insights INTEGER DEFAULT 0,
    high_priority_insights INTEGER DEFAULT 0,
    actionable_insights INTEGER DEFAULT 0,
    ai_generated_insights INTEGER DEFAULT 0,
    verified_insights INTEGER DEFAULT 0,
    average_impact DECIMAL(5,2) DEFAULT 0,
    average_confidence DECIMAL(5,2) DEFAULT 0,
    total_recommendations INTEGER DEFAULT 0,
    active_recommendations INTEGER DEFAULT 0,
    completed_recommendations INTEGER DEFAULT 0,
    average_roi DECIMAL(5,2) DEFAULT 0,
    success_rate DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, date)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ai_source_configs_tenant_id ON ai_source_configs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_ai_source_configs_enabled ON ai_source_configs(enabled);
CREATE INDEX IF NOT EXISTS idx_ai_source_configs_sync_status ON ai_source_configs(sync_status);

CREATE INDEX IF NOT EXISTS idx_ai_visibility_metrics_tenant_id ON ai_visibility_metrics(tenant_id);
CREATE INDEX IF NOT EXISTS idx_ai_visibility_metrics_source_id ON ai_visibility_metrics(source_id);
CREATE INDEX IF NOT EXISTS idx_ai_visibility_metrics_platform ON ai_visibility_metrics(platform);
CREATE INDEX IF NOT EXISTS idx_ai_visibility_metrics_category ON ai_visibility_metrics(category);
CREATE INDEX IF NOT EXISTS idx_ai_visibility_metrics_timestamp ON ai_visibility_metrics(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_ai_visibility_metrics_tenant_timestamp ON ai_visibility_metrics(tenant_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_ai_insights_tenant_id ON ai_insights(tenant_id);
CREATE INDEX IF NOT EXISTS idx_ai_insights_type ON ai_insights(type);
CREATE INDEX IF NOT EXISTS idx_ai_insights_priority ON ai_insights(priority);
CREATE INDEX IF NOT EXISTS idx_ai_insights_category ON ai_insights(category);
CREATE INDEX IF NOT EXISTS idx_ai_insights_ai_generated ON ai_insights(ai_generated);
CREATE INDEX IF NOT EXISTS idx_ai_insights_verified ON ai_insights(verified);
CREATE INDEX IF NOT EXISTS idx_ai_insights_created_at ON ai_insights(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ai_recommendations_tenant_id ON ai_recommendations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_category ON ai_recommendations(category);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_priority ON ai_recommendations(priority);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_status ON ai_recommendations(status);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_ai_generated ON ai_recommendations(ai_generated);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_created_at ON ai_recommendations(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ai_insights_metrics_tenant_date ON ai_insights_metrics(tenant_id, date DESC);

-- Create views for common queries
CREATE OR REPLACE VIEW v_latest_ai_visibility_metrics AS
SELECT DISTINCT ON (tenant_id, source_id)
    tenant_id,
    source_id,
    platform,
    category,
    visibility,
    engagement,
    reach,
    sentiment,
    conversion,
    authority,
    influence,
    growth,
    timestamp,
    metadata
FROM ai_visibility_metrics
ORDER BY tenant_id, source_id, timestamp DESC;

CREATE OR REPLACE VIEW v_ai_insights_summary AS
SELECT 
    tenant_id,
    COUNT(*) as total_insights,
    COUNT(*) FILTER (WHERE priority = 'high' OR priority = 'critical') as high_priority_insights,
    COUNT(*) FILTER (WHERE action_required = true) as actionable_insights,
    COUNT(*) FILTER (WHERE ai_generated = true) as ai_generated_insights,
    COUNT(*) FILTER (WHERE verified = true) as verified_insights,
    AVG(impact) as average_impact,
    AVG(confidence) as average_confidence,
    MAX(created_at) as last_insight_date
FROM ai_insights
GROUP BY tenant_id;

CREATE OR REPLACE VIEW v_ai_recommendations_summary AS
SELECT 
    tenant_id,
    COUNT(*) as total_recommendations,
    COUNT(*) FILTER (WHERE status = 'in_progress') as active_recommendations,
    COUNT(*) FILTER (WHERE status = 'completed') as completed_recommendations,
    AVG(roi) as average_roi,
    AVG(success_rate) as success_rate,
    MAX(created_at) as last_recommendation_date
FROM ai_recommendations
GROUP BY tenant_id;

-- Create functions for AI metrics aggregation
CREATE OR REPLACE FUNCTION aggregate_ai_visibility_metrics(tenant_uuid UUID, start_date DATE, end_date DATE)
RETURNS TABLE(
    total_sources INTEGER,
    active_sources INTEGER,
    average_visibility DECIMAL(5,2),
    total_reach BIGINT,
    engagement_rate DECIMAL(5,2),
    sentiment_score DECIMAL(5,2),
    coverage_score DECIMAL(5,2),
    conversion_rate DECIMAL(5,2),
    authority_score DECIMAL(5,2),
    influence_score DECIMAL(5,2),
    growth_rate DECIMAL(5,2)
) AS $$
BEGIN
    RETURN QUERY
    WITH latest_metrics AS (
        SELECT DISTINCT ON (source_id)
            source_id,
            platform,
            category,
            visibility,
            engagement,
            reach,
            sentiment,
            conversion,
            authority,
            influence,
            growth
        FROM ai_visibility_metrics
        WHERE tenant_id = tenant_uuid
        AND timestamp >= start_date
        AND timestamp <= end_date
        ORDER BY source_id, timestamp DESC
    )
    SELECT 
        COUNT(*)::INTEGER as total_sources,
        COUNT(*) FILTER (WHERE visibility > 0)::INTEGER as active_sources,
        ROUND(AVG(visibility), 2) as average_visibility,
        SUM(reach) as total_reach,
        ROUND(AVG(engagement), 2) as engagement_rate,
        ROUND(AVG(sentiment), 2) as sentiment_score,
        ROUND((AVG(visibility) + AVG(engagement) + AVG(sentiment)) / 3, 2) as coverage_score,
        ROUND(AVG(conversion), 2) as conversion_rate,
        ROUND(AVG(authority), 2) as authority_score,
        ROUND(AVG(influence), 2) as influence_score,
        ROUND(AVG(growth), 2) as growth_rate
    FROM latest_metrics;
END;
$$ LANGUAGE plpgsql;

-- Create function to generate AI insights
CREATE OR REPLACE FUNCTION generate_ai_insights(tenant_uuid UUID)
RETURNS TABLE(
    insight_id UUID,
    insight_type VARCHAR(50),
    priority VARCHAR(20),
    title VARCHAR(500),
    description TEXT,
    impact DECIMAL(5,2),
    confidence DECIMAL(5,2)
) AS $$
BEGIN
    -- This is a placeholder function - in production, this would call AI services
    -- to generate actual insights based on the data
    RETURN QUERY
    SELECT 
        uuid_generate_v4() as insight_id,
        'opportunity'::VARCHAR(50) as insight_type,
        'medium'::VARCHAR(20) as priority,
        'Sample AI Insight'::VARCHAR(500) as title,
        'This is a sample insight generated by AI'::TEXT as description,
        75.0::DECIMAL(5,2) as impact,
        85.0::DECIMAL(5,2) as confidence;
END;
$$ LANGUAGE plpgsql;

-- Create function to update AI insights metrics
CREATE OR REPLACE FUNCTION update_ai_insights_metrics(tenant_uuid UUID, target_date DATE DEFAULT CURRENT_DATE)
RETURNS VOID AS $$
DECLARE
    insights_count INTEGER;
    high_priority_count INTEGER;
    actionable_count INTEGER;
    ai_generated_count INTEGER;
    verified_count INTEGER;
    avg_impact DECIMAL(5,2);
    avg_confidence DECIMAL(5,2);
    recs_count INTEGER;
    active_recs_count INTEGER;
    completed_recs_count INTEGER;
    avg_roi DECIMAL(5,2);
    success_rate_val DECIMAL(5,2);
BEGIN
    -- Get insights metrics
    SELECT 
        COUNT(*),
        COUNT(*) FILTER (WHERE priority = 'high' OR priority = 'critical'),
        COUNT(*) FILTER (WHERE action_required = true),
        COUNT(*) FILTER (WHERE ai_generated = true),
        COUNT(*) FILTER (WHERE verified = true),
        AVG(impact),
        AVG(confidence)
    INTO 
        insights_count,
        high_priority_count,
        actionable_count,
        ai_generated_count,
        verified_count,
        avg_impact,
        avg_confidence
    FROM ai_insights
    WHERE tenant_id = tenant_uuid
    AND created_at::DATE = target_date;

    -- Get recommendations metrics
    SELECT 
        COUNT(*),
        COUNT(*) FILTER (WHERE status = 'in_progress'),
        COUNT(*) FILTER (WHERE status = 'completed'),
        AVG(roi),
        AVG(success_rate)
    INTO 
        recs_count,
        active_recs_count,
        completed_recs_count,
        avg_roi,
        success_rate_val
    FROM ai_recommendations
    WHERE tenant_id = tenant_uuid
    AND created_at::DATE = target_date;

    -- Insert or update metrics
    INSERT INTO ai_insights_metrics (
        tenant_id,
        date,
        total_insights,
        high_priority_insights,
        actionable_insights,
        ai_generated_insights,
        verified_insights,
        average_impact,
        average_confidence,
        total_recommendations,
        active_recommendations,
        completed_recommendations,
        average_roi,
        success_rate
    ) VALUES (
        tenant_uuid,
        target_date,
        COALESCE(insights_count, 0),
        COALESCE(high_priority_count, 0),
        COALESCE(actionable_count, 0),
        COALESCE(ai_generated_count, 0),
        COALESCE(verified_count, 0),
        COALESCE(avg_impact, 0),
        COALESCE(avg_confidence, 0),
        COALESCE(recs_count, 0),
        COALESCE(active_recs_count, 0),
        COALESCE(completed_recs_count, 0),
        COALESCE(avg_roi, 0),
        COALESCE(success_rate_val, 0)
    )
    ON CONFLICT (tenant_id, date)
    DO UPDATE SET
        total_insights = EXCLUDED.total_insights,
        high_priority_insights = EXCLUDED.high_priority_insights,
        actionable_insights = EXCLUDED.actionable_insights,
        ai_generated_insights = EXCLUDED.ai_generated_insights,
        verified_insights = EXCLUDED.verified_insights,
        average_impact = EXCLUDED.average_impact,
        average_confidence = EXCLUDED.average_confidence,
        total_recommendations = EXCLUDED.total_recommendations,
        active_recommendations = EXCLUDED.active_recommendations,
        completed_recommendations = EXCLUDED.completed_recommendations,
        average_roi = EXCLUDED.average_roi,
        success_rate = EXCLUDED.success_rate;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON ai_source_configs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ai_visibility_metrics TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ai_insights TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ai_recommendations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ai_insights_metrics TO authenticated;

GRANT SELECT ON v_latest_ai_visibility_metrics TO authenticated;
GRANT SELECT ON v_ai_insights_summary TO authenticated;
GRANT SELECT ON v_ai_recommendations_summary TO authenticated;

GRANT EXECUTE ON FUNCTION aggregate_ai_visibility_metrics(UUID, DATE, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION generate_ai_insights(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION update_ai_insights_metrics(UUID, DATE) TO authenticated;

-- Create RLS policies
ALTER TABLE ai_source_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_visibility_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insights_metrics ENABLE ROW LEVEL SECURITY;

-- RLS policies for ai_source_configs
CREATE POLICY "Users can view their own source configs" ON ai_source_configs
    FOR SELECT USING (tenant_id = auth.uid()::text::uuid);

CREATE POLICY "Users can insert their own source configs" ON ai_source_configs
    FOR INSERT WITH CHECK (tenant_id = auth.uid()::text::uuid);

CREATE POLICY "Users can update their own source configs" ON ai_source_configs
    FOR UPDATE USING (tenant_id = auth.uid()::text::uuid);

CREATE POLICY "Users can delete their own source configs" ON ai_source_configs
    FOR DELETE USING (tenant_id = auth.uid()::text::uuid);

-- RLS policies for ai_visibility_metrics
CREATE POLICY "Users can view their own visibility metrics" ON ai_visibility_metrics
    FOR SELECT USING (tenant_id = auth.uid()::text::uuid);

CREATE POLICY "Users can insert their own visibility metrics" ON ai_visibility_metrics
    FOR INSERT WITH CHECK (tenant_id = auth.uid()::text::uuid);

-- RLS policies for ai_insights
CREATE POLICY "Users can view their own insights" ON ai_insights
    FOR SELECT USING (tenant_id = auth.uid()::text::uuid);

CREATE POLICY "Users can insert their own insights" ON ai_insights
    FOR INSERT WITH CHECK (tenant_id = auth.uid()::text::uuid);

CREATE POLICY "Users can update their own insights" ON ai_insights
    FOR UPDATE USING (tenant_id = auth.uid()::text::uuid);

-- RLS policies for ai_recommendations
CREATE POLICY "Users can view their own recommendations" ON ai_recommendations
    FOR SELECT USING (tenant_id = auth.uid()::text::uuid);

CREATE POLICY "Users can insert their own recommendations" ON ai_recommendations
    FOR INSERT WITH CHECK (tenant_id = auth.uid()::text::uuid);

CREATE POLICY "Users can update their own recommendations" ON ai_recommendations
    FOR UPDATE USING (tenant_id = auth.uid()::text::uuid);

-- RLS policies for ai_insights_metrics
CREATE POLICY "Users can view their own insights metrics" ON ai_insights_metrics
    FOR SELECT USING (tenant_id = auth.uid()::text::uuid);

CREATE POLICY "Users can insert their own insights metrics" ON ai_insights_metrics
    FOR INSERT WITH CHECK (tenant_id = auth.uid()::text::uuid);

CREATE POLICY "Users can update their own insights metrics" ON ai_insights_metrics
    FOR UPDATE USING (tenant_id = auth.uid()::text::uuid);

-- Log completion
DO $$
BEGIN
    RAISE NOTICE 'AI Visibility Metrics migration completed successfully!';
    RAISE NOTICE 'Tables created:';
    RAISE NOTICE '  - ai_source_configs';
    RAISE NOTICE '  - ai_visibility_metrics';
    RAISE NOTICE '  - ai_insights';
    RAISE NOTICE '  - ai_recommendations';
    RAISE NOTICE '  - ai_insights_metrics';
    RAISE NOTICE 'Views created:';
    RAISE NOTICE '  - v_latest_ai_visibility_metrics';
    RAISE NOTICE '  - v_ai_insights_summary';
    RAISE NOTICE '  - v_ai_recommendations_summary';
    RAISE NOTICE 'Functions created:';
    RAISE NOTICE '  - aggregate_ai_visibility_metrics()';
    RAISE NOTICE '  - generate_ai_insights()';
    RAISE NOTICE '  - update_ai_insights_metrics()';
    RAISE NOTICE 'Indexes created for optimal performance';
    RAISE NOTICE 'RLS policies enabled for security';
END $$;
