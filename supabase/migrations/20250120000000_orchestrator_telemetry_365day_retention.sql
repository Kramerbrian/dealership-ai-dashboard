-- DealershipAI Orchestrator Telemetry Schema
-- 365-day retention policy with automatic cleanup
-- Created: 2025-01-20

-- ==============================================
-- 1. ORCHESTRATOR EXECUTIONS TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS orchestrator_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Execution metadata
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  
  -- Results
  success BOOLEAN NOT NULL DEFAULT false,
  jobs_executed INTEGER DEFAULT 0,
  jobs_failed INTEGER DEFAULT 0,
  
  -- Governance & Health
  governance_passed BOOLEAN DEFAULT false,
  governance_reasons TEXT[],
  lighthouse_score INTEGER,
  safe_mode_triggered BOOLEAN DEFAULT false,
  
  -- System state snapshot
  system_state JSONB DEFAULT '{}'::jsonb,
  
  -- Error tracking
  error_message TEXT,
  error_stack TEXT,
  
  -- Metadata
  trigger_source TEXT DEFAULT 'cron', -- 'cron', 'manual', 'api'
  version TEXT,
  
  -- Indexes
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orchestrator_executions_started_at ON orchestrator_executions (started_at DESC);
CREATE INDEX idx_orchestrator_executions_success ON orchestrator_executions (success);
CREATE INDEX idx_orchestrator_executions_created_at ON orchestrator_executions (created_at DESC);

-- ==============================================
-- 2. JOB EXECUTIONS TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS orchestrator_job_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  execution_id UUID NOT NULL REFERENCES orchestrator_executions(id) ON DELETE CASCADE,
  
  -- Job identification
  job_id TEXT NOT NULL,
  job_name TEXT,
  
  -- Execution details
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  duration_seconds NUMERIC(10, 2),
  
  -- Results
  success BOOLEAN NOT NULL DEFAULT false,
  output TEXT,
  error_message TEXT,
  
  -- Dependencies
  depends_on TEXT[],
  
  -- Metrics
  success_metric TEXT,
  actual_value NUMERIC,
  threshold_value NUMERIC,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_job_executions_execution_id ON orchestrator_job_executions (execution_id);
CREATE INDEX idx_job_executions_job_id ON orchestrator_job_executions (job_id);
CREATE INDEX idx_job_executions_started_at ON orchestrator_job_executions (started_at DESC);
CREATE INDEX idx_job_executions_success ON orchestrator_job_executions (success);

-- ==============================================
-- 3. SYSTEM HEALTH METRICS TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS orchestrator_health_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Timestamp
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Performance metrics
  lighthouse_performance INTEGER,
  lighthouse_accessibility INTEGER,
  lighthouse_best_practices INTEGER,
  lighthouse_seo INTEGER,
  
  -- System metrics
  p95_latency_ms INTEGER,
  error_rate NUMERIC(5, 4), -- 0.0000 to 1.0000
  uptime_percentage NUMERIC(5, 2),
  
  -- Governance metrics
  governance_score NUMERIC(5, 2), -- 0.00 to 100.00
  safe_mode_active BOOLEAN DEFAULT false,
  
  -- Resource usage (if available)
  memory_usage_mb INTEGER,
  cpu_usage_percent NUMERIC(5, 2),
  
  -- Metadata
  source TEXT DEFAULT 'orchestrator', -- 'orchestrator', 'lighthouse', 'monitoring'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_health_metrics_recorded_at ON orchestrator_health_metrics (recorded_at DESC);
CREATE INDEX idx_health_metrics_source ON orchestrator_health_metrics (source);

-- ==============================================
-- 4. TELEMETRY EVENTS (Enhanced with retention)
-- ==============================================
-- Extend existing telemetry_events table if it exists
DO $$
BEGIN
  -- Add retention tracking if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'telemetry_events' AND column_name = 'retention_expires_at'
  ) THEN
    ALTER TABLE telemetry_events 
    ADD COLUMN retention_expires_at TIMESTAMPTZ 
    GENERATED ALWAYS AS (created_at + INTERVAL '365 days') STORED;
    
    CREATE INDEX idx_telemetry_retention_expires ON telemetry_events (retention_expires_at);
  END IF;
END $$;

-- ==============================================
-- 5. AUTOMATIC CLEANUP FUNCTION (365-day retention)
-- ==============================================
CREATE OR REPLACE FUNCTION cleanup_expired_telemetry()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Delete orchestrator executions older than 365 days
  DELETE FROM orchestrator_executions
  WHERE created_at < NOW() - INTERVAL '365 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RAISE NOTICE 'Deleted % orchestrator_executions records', deleted_count;
  
  -- Delete job executions older than 365 days
  DELETE FROM orchestrator_job_executions
  WHERE created_at < NOW() - INTERVAL '365 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RAISE NOTICE 'Deleted % orchestrator_job_executions records', deleted_count;
  
  -- Delete health metrics older than 365 days
  DELETE FROM orchestrator_health_metrics
  WHERE created_at < NOW() - INTERVAL '365 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RAISE NOTICE 'Deleted % orchestrator_health_metrics records', deleted_count;
  
  -- Delete telemetry events older than 365 days
  DELETE FROM telemetry_events
  WHERE retention_expires_at < NOW();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RAISE NOTICE 'Deleted % telemetry_events records', deleted_count;
END;
$$;

-- ==============================================
-- 6. SCHEDULED CLEANUP (via pg_cron if available)
-- ==============================================
-- Note: This requires pg_cron extension
-- Run daily at 2 AM UTC
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.schedule(
      'cleanup-expired-telemetry',
      '0 2 * * *', -- Daily at 2 AM UTC
      $$SELECT cleanup_expired_telemetry()$$
    );
    RAISE NOTICE 'Scheduled cleanup job created';
  ELSE
    RAISE NOTICE 'pg_cron extension not available. Manual cleanup required.';
  END IF;
END $$;

-- ==============================================
-- 7. HELPER VIEWS
-- ==============================================

-- Recent orchestrator executions summary
CREATE OR REPLACE VIEW v_orchestrator_recent AS
SELECT 
  id,
  started_at,
  completed_at,
  duration_seconds,
  success,
  jobs_executed,
  jobs_failed,
  governance_passed,
  lighthouse_score,
  safe_mode_triggered,
  trigger_source
FROM orchestrator_executions
WHERE started_at >= NOW() - INTERVAL '30 days'
ORDER BY started_at DESC;

-- Job success rate (last 30 days)
CREATE OR REPLACE VIEW v_job_success_rates AS
SELECT 
  job_id,
  COUNT(*) as total_executions,
  COUNT(*) FILTER (WHERE success = true) as successful_executions,
  ROUND(
    COUNT(*) FILTER (WHERE success = true)::NUMERIC / NULLIF(COUNT(*), 0) * 100,
    2
  ) as success_rate_percent,
  AVG(duration_seconds) as avg_duration_seconds,
  MAX(started_at) as last_execution
FROM orchestrator_job_executions
WHERE started_at >= NOW() - INTERVAL '30 days'
GROUP BY job_id
ORDER BY success_rate_percent DESC;

-- System health trends (last 7 days)
CREATE OR REPLACE VIEW v_health_trends AS
SELECT 
  DATE_TRUNC('day', recorded_at) as day,
  AVG(lighthouse_performance) as avg_lighthouse_performance,
  AVG(p95_latency_ms) as avg_p95_latency_ms,
  AVG(error_rate) as avg_error_rate,
  AVG(governance_score) as avg_governance_score,
  COUNT(*) FILTER (WHERE safe_mode_active = true) as safe_mode_activations
FROM orchestrator_health_metrics
WHERE recorded_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE_TRUNC('day', recorded_at)
ORDER BY day DESC;

-- ==============================================
-- 8. ROW LEVEL SECURITY (RLS)
-- ==============================================
ALTER TABLE orchestrator_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE orchestrator_job_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE orchestrator_health_metrics ENABLE ROW LEVEL SECURITY;

-- Admin-only read access
CREATE POLICY "orchestrator_executions_admin_read"
  ON orchestrator_executions FOR SELECT
  USING (
    auth.jwt() ->> 'role' = 'admin' OR
    auth.jwt() ->> 'role' = 'superadmin'
  );

-- System can insert (for cron jobs)
CREATE POLICY "orchestrator_executions_system_insert"
  ON orchestrator_executions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "orchestrator_job_executions_admin_read"
  ON orchestrator_job_executions FOR SELECT
  USING (
    auth.jwt() ->> 'role' = 'admin' OR
    auth.jwt() ->> 'role' = 'superadmin'
  );

CREATE POLICY "orchestrator_job_executions_system_insert"
  ON orchestrator_job_executions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "orchestrator_health_metrics_admin_read"
  ON orchestrator_health_metrics FOR SELECT
  USING (
    auth.jwt() ->> 'role' = 'admin' OR
    auth.jwt() ->> 'role' = 'superadmin'
  );

CREATE POLICY "orchestrator_health_metrics_system_insert"
  ON orchestrator_health_metrics FOR INSERT
  WITH CHECK (true);

-- ==============================================
-- 9. COMMENTS
-- ==============================================
COMMENT ON TABLE orchestrator_executions IS 'Tracks all orchestrator execution runs with 365-day retention';
COMMENT ON TABLE orchestrator_job_executions IS 'Individual job execution results within orchestrator runs';
COMMENT ON TABLE orchestrator_health_metrics IS 'System health metrics collected over time';
COMMENT ON FUNCTION cleanup_expired_telemetry() IS 'Automatically deletes telemetry data older than 365 days';

