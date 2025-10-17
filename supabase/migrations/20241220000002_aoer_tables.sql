-- AOER (Answer Engine Optimization Rating) Tables Migration
-- Creates tables for AOER computation, queue management, and metrics tracking

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_cron";

-- AOER Summary table - stores computed AOER scores for each tenant
CREATE TABLE IF NOT EXISTS aoer_summary (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID NOT NULL UNIQUE,
    aoer_score DECIMAL(5,2) NOT NULL CHECK (aoer_score >= 0 AND aoer_score <= 100),
    visibility_risk DECIMAL(3,2) NOT NULL CHECK (visibility_risk >= 0 AND visibility_risk <= 1),
    last_updated TIMESTAMPTZ NOT NULL,
    metrics JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Metrics Events table - tracks all AOER computation events
CREATE TABLE IF NOT EXISTS metrics_events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    event_data JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AOER Queue table - tracks queued recomputation jobs
CREATE TABLE IF NOT EXISTS aoer_queue (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID NOT NULL,
    priority VARCHAR(10) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status VARCHAR(20) NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'completed', 'failed')),
    retry_count INTEGER NOT NULL DEFAULT 0,
    max_retries INTEGER NOT NULL DEFAULT 3,
    scheduled_at TIMESTAMPTZ NOT NULL,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AOER Failures table - tracks failed computations
CREATE TABLE IF NOT EXISTS aoer_failures (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID NOT NULL,
    error_message TEXT NOT NULL,
    error_data JSONB DEFAULT '{}',
    retry_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_aoer_summary_tenant_id ON aoer_summary(tenant_id);
CREATE INDEX IF NOT EXISTS idx_aoer_summary_updated_at ON aoer_summary(updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_metrics_events_tenant_id ON metrics_events(tenant_id);
CREATE INDEX IF NOT EXISTS idx_metrics_events_created_at ON metrics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_metrics_events_event_type ON metrics_events(event_type);

CREATE INDEX IF NOT EXISTS idx_aoer_queue_tenant_id ON aoer_queue(tenant_id);
CREATE INDEX IF NOT EXISTS idx_aoer_queue_status ON aoer_queue(status);
CREATE INDEX IF NOT EXISTS idx_aoer_queue_priority ON aoer_queue(priority);
CREATE INDEX IF NOT EXISTS idx_aoer_queue_scheduled_at ON aoer_queue(scheduled_at);

CREATE INDEX IF NOT EXISTS idx_aoer_failures_tenant_id ON aoer_failures(tenant_id);
CREATE INDEX IF NOT EXISTS idx_aoer_failures_created_at ON aoer_failures(created_at DESC);

-- Create views for common queries
CREATE OR REPLACE VIEW v_aoer_dashboard AS
SELECT 
    s.tenant_id,
    s.aoer_score,
    s.visibility_risk,
    s.last_updated,
    s.metrics,
    CASE 
        WHEN s.aoer_score >= 80 THEN 'Excellent'
        WHEN s.aoer_score >= 60 THEN 'Good'
        WHEN s.aoer_score >= 40 THEN 'Fair'
        ELSE 'Poor'
    END as aoer_grade,
    CASE 
        WHEN s.visibility_risk <= 0.2 THEN 'Low'
        WHEN s.visibility_risk <= 0.5 THEN 'Medium'
        WHEN s.visibility_risk <= 0.8 THEN 'High'
        ELSE 'Critical'
    END as risk_level
FROM aoer_summary s;

CREATE OR REPLACE VIEW v_aoer_queue_status AS
SELECT 
    status,
    priority,
    COUNT(*) as job_count,
    MIN(scheduled_at) as oldest_job,
    MAX(scheduled_at) as newest_job
FROM aoer_queue
WHERE status IN ('queued', 'processing')
GROUP BY status, priority;

-- Create functions for AOER computation
CREATE OR REPLACE FUNCTION compute_aoer_for_tenant(tenant_uuid UUID)
RETURNS TABLE(
    tenant_id UUID,
    aoer_score DECIMAL(5,2),
    visibility_risk DECIMAL(3,2),
    metrics JSONB
) AS $$
DECLARE
    tenant_data RECORD;
    avg_aeo DECIMAL(5,2);
    avg_geo DECIMAL(5,2);
    avg_ugc DECIMAL(5,2);
    volatility DECIMAL(5,2);
    data_points INTEGER;
    days_since_last_data INTEGER;
    aoer_score DECIMAL(5,2);
    visibility_risk DECIMAL(3,2);
    metrics_data JSONB;
BEGIN
    -- Get tenant data from last 30 days
    SELECT 
        AVG(aeo) as avg_aeo,
        AVG(geo) as avg_geo,
        AVG(ugc) as avg_ugc,
        STDDEV(aeo) as aeo_volatility,
        COUNT(*) as data_count,
        MAX(date) as last_date
    INTO tenant_data
    FROM aiv_raw_signals 
    WHERE dealer_id = tenant_uuid
    AND date >= CURRENT_DATE - INTERVAL '30 days'
    AND aeo IS NOT NULL;

    -- Handle case where no data exists
    IF tenant_data.data_count IS NULL OR tenant_data.data_count = 0 THEN
        RETURN QUERY SELECT 
            tenant_uuid,
            0.00::DECIMAL(5,2),
            1.00::DECIMAL(3,2),
            '{"error": "No data available"}'::JSONB;
        RETURN;
    END IF;

    -- Calculate metrics
    avg_aeo := COALESCE(tenant_data.avg_aeo, 0);
    avg_geo := COALESCE(tenant_data.avg_geo, 0);
    avg_ugc := COALESCE(tenant_data.avg_ugc, 0);
    volatility := COALESCE(tenant_data.aeo_volatility, 0);
    data_points := tenant_data.data_count;
    days_since_last_data := EXTRACT(DAYS FROM (CURRENT_DATE - tenant_data.last_date));

    -- Calculate AOER score with volatility penalty
    aoer_score := (avg_aeo * 0.4 + avg_geo * 0.35 + avg_ugc * 0.25) * 
                  (1 - LEAST(volatility / 20, 0.3));

    -- Calculate visibility risk
    visibility_risk := 0.2; -- Default low risk
    IF data_points < 5 THEN
        visibility_risk := 0.8;
    ELSIF days_since_last_data > 7 THEN
        visibility_risk := 0.6;
    ELSIF volatility > 15 THEN
        visibility_risk := 0.4;
    END IF;

    -- Build metrics JSON
    metrics_data := jsonb_build_object(
        'avgAEO', ROUND(avg_aeo::NUMERIC, 2),
        'avgGEO', ROUND(avg_geo::NUMERIC, 2),
        'avgUGC', ROUND(avg_ugc::NUMERIC, 2),
        'volatility', ROUND(volatility::NUMERIC, 2),
        'dataPoints', data_points,
        'daysSinceLastData', days_since_last_data
    );

    RETURN QUERY SELECT 
        tenant_uuid,
        ROUND(aoer_score::NUMERIC, 2)::DECIMAL(5,2),
        ROUND(visibility_risk::NUMERIC, 2)::DECIMAL(3,2),
        metrics_data;
END;
$$ LANGUAGE plpgsql;

-- Function to update AOER summary
CREATE OR REPLACE FUNCTION update_aoer_summary(tenant_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    aoer_result RECORD;
BEGIN
    -- Compute AOER for the tenant
    SELECT * INTO aoer_result
    FROM compute_aoer_for_tenant(tenant_uuid);

    -- Update or insert AOER summary
    INSERT INTO aoer_summary (
        tenant_id,
        aoer_score,
        visibility_risk,
        last_updated,
        metrics,
        updated_at
    ) VALUES (
        aoer_result.tenant_id,
        aoer_result.aoer_score,
        aoer_result.visibility_risk,
        NOW(),
        aoer_result.metrics,
        NOW()
    )
    ON CONFLICT (tenant_id) 
    DO UPDATE SET
        aoer_score = EXCLUDED.aoer_score,
        visibility_risk = EXCLUDED.visibility_risk,
        last_updated = EXCLUDED.last_updated,
        metrics = EXCLUDED.metrics,
        updated_at = EXCLUDED.updated_at;

    -- Log metrics event
    INSERT INTO metrics_events (
        tenant_id,
        event_type,
        event_data
    ) VALUES (
        tenant_uuid,
        'aoer_recompute',
        jsonb_build_object(
            'aoer_score', aoer_result.aoer_score,
            'visibility_risk', aoer_result.visibility_risk,
            'metrics', aoer_result.metrics
        )
    );

    RETURN TRUE;
EXCEPTION WHEN OTHERS THEN
    -- Log failure
    INSERT INTO aoer_failures (
        tenant_id,
        error_message,
        error_data
    ) VALUES (
        tenant_uuid,
        SQLERRM,
        jsonb_build_object('function', 'update_aoer_summary', 'error', SQLERRM)
    );
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Function to queue tenant for recomputation
CREATE OR REPLACE FUNCTION queue_tenant_recompute(
    tenant_uuid UUID,
    priority_level VARCHAR(10) DEFAULT 'medium'
)
RETURNS UUID AS $$
DECLARE
    queue_id UUID;
BEGIN
    INSERT INTO aoer_queue (
        tenant_id,
        priority,
        scheduled_at
    ) VALUES (
        tenant_uuid,
        priority_level,
        NOW()
    ) RETURNING id INTO queue_id;

    RETURN queue_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get queue status
CREATE OR REPLACE FUNCTION get_aoer_queue_status()
RETURNS TABLE(
    status VARCHAR(20),
    priority VARCHAR(10),
    job_count BIGINT,
    oldest_job TIMESTAMPTZ,
    newest_job TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        q.status,
        q.priority,
        COUNT(*) as job_count,
        MIN(q.scheduled_at) as oldest_job,
        MAX(q.scheduled_at) as newest_job
    FROM aoer_queue q
    WHERE q.status IN ('queued', 'processing')
    GROUP BY q.status, q.priority
    ORDER BY q.priority DESC, q.status;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON aoer_summary TO authenticated;
GRANT SELECT, INSERT ON metrics_events TO authenticated;
GRANT SELECT, INSERT, UPDATE ON aoer_queue TO authenticated;
GRANT SELECT, INSERT ON aoer_failures TO authenticated;

GRANT SELECT ON v_aoer_dashboard TO authenticated;
GRANT SELECT ON v_aoer_queue_status TO authenticated;

GRANT EXECUTE ON FUNCTION compute_aoer_for_tenant(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION update_aoer_summary(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION queue_tenant_recompute(UUID, VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION get_aoer_queue_status() TO authenticated;

-- Create RLS policies
ALTER TABLE aoer_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE metrics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE aoer_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE aoer_failures ENABLE ROW LEVEL SECURITY;

-- RLS policies for aoer_summary
CREATE POLICY "Users can view their own AOER summary" ON aoer_summary
    FOR SELECT USING (tenant_id::text = auth.jwt() ->> 'tenant_id'::text);

-- RLS policies for metrics_events
CREATE POLICY "Users can view their own metrics events" ON metrics_events
    FOR SELECT USING (tenant_id::text = auth.jwt() ->> 'tenant_id'::text);

-- RLS policies for aoer_queue
CREATE POLICY "Users can view their own queue items" ON aoer_queue
    FOR SELECT USING (tenant_id::text = auth.jwt() ->> 'tenant_id'::text);

-- RLS policies for aoer_failures
CREATE POLICY "Users can view their own failures" ON aoer_failures
    FOR SELECT USING (tenant_id::text = auth.jwt() ->> 'tenant_id'::text);

-- Log completion
DO $$
BEGIN
    RAISE NOTICE 'AOER tables migration completed successfully!';
    RAISE NOTICE 'Tables created:';
    RAISE NOTICE '  - aoer_summary';
    RAISE NOTICE '  - metrics_events';
    RAISE NOTICE '  - aoer_queue';
    RAISE NOTICE '  - aoer_failures';
    RAISE NOTICE 'Views created:';
    RAISE NOTICE '  - v_aoer_dashboard';
    RAISE NOTICE '  - v_aoer_queue_status';
    RAISE NOTICE 'Functions created:';
    RAISE NOTICE '  - compute_aoer_for_tenant(UUID)';
    RAISE NOTICE '  - update_aoer_summary(UUID)';
    RAISE NOTICE '  - queue_tenant_recompute(UUID, VARCHAR)';
    RAISE NOTICE '  - get_aoer_queue_status()';
    RAISE NOTICE 'Indexes and RLS policies created';
END $$;
