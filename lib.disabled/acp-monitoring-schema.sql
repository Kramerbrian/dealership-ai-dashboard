-- ACP Monitoring & Analytics Database Schema
-- Run this after the main acp-database-schema.sql

-- Table: acp_analytics_events
-- Store all ACP-related events for analytics
CREATE TABLE IF NOT EXISTS acp_analytics_events (
  id BIGSERIAL PRIMARY KEY,
  event_type TEXT NOT NULL,
  session_id TEXT REFERENCES acp_checkout_sessions(session_id) ON DELETE SET NULL,
  user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,

  -- Event data (flexible JSONB)
  data JSONB DEFAULT '{}'::jsonb,

  -- Metadata
  user_agent TEXT,
  ip_address TEXT,
  referrer TEXT,

  -- Timestamp
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for analytics events
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON acp_analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_session_id ON acp_analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON acp_analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_timestamp ON acp_analytics_events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_data ON acp_analytics_events USING gin(data);

-- Table: acp_error_logs
-- Store all errors for debugging and monitoring
CREATE TABLE IF NOT EXISTS acp_error_logs (
  id BIGSERIAL PRIMARY KEY,
  message TEXT NOT NULL,
  stack TEXT,
  code TEXT NOT NULL DEFAULT 'UNKNOWN_ERROR',

  -- Context
  session_id TEXT REFERENCES acp_checkout_sessions(session_id) ON DELETE SET NULL,
  user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  context JSONB DEFAULT '{}'::jsonb,

  -- Error metadata
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMPTZ,
  resolved_by TEXT,

  -- Timestamp
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for error logs
CREATE INDEX IF NOT EXISTS idx_error_logs_code ON acp_error_logs(code);
CREATE INDEX IF NOT EXISTS idx_error_logs_session_id ON acp_error_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_error_logs_severity ON acp_error_logs(severity);
CREATE INDEX IF NOT EXISTS idx_error_logs_resolved ON acp_error_logs(resolved);
CREATE INDEX IF NOT EXISTS idx_error_logs_timestamp ON acp_error_logs(timestamp DESC);

-- Table: critical_alerts
-- Store critical system alerts
CREATE TABLE IF NOT EXISTS critical_alerts (
  id BIGSERIAL PRIMARY KEY,
  type TEXT NOT NULL,
  severity TEXT CHECK (severity IN ('warning', 'critical', 'emergency')) DEFAULT 'critical',
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}'::jsonb,

  -- Alert status
  acknowledged BOOLEAN DEFAULT FALSE,
  acknowledged_at TIMESTAMPTZ,
  acknowledged_by TEXT,
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMPTZ,

  -- Timestamp
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for critical alerts
CREATE INDEX IF NOT EXISTS idx_alerts_type ON critical_alerts(type);
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON critical_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_alerts_acknowledged ON critical_alerts(acknowledged);
CREATE INDEX IF NOT EXISTS idx_alerts_resolved ON critical_alerts(resolved);
CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON critical_alerts(created_at DESC);

-- Table: acp_performance_metrics
-- Store performance metrics for monitoring
CREATE TABLE IF NOT EXISTS acp_performance_metrics (
  id BIGSERIAL PRIMARY KEY,
  metric_name TEXT NOT NULL,
  metric_value DECIMAL(10, 2) NOT NULL,
  metric_unit TEXT,

  -- Context
  tags JSONB DEFAULT '{}'::jsonb,

  -- Timestamp
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance metrics
CREATE INDEX IF NOT EXISTS idx_metrics_name ON acp_performance_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_metrics_recorded_at ON acp_performance_metrics(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_metrics_tags ON acp_performance_metrics USING gin(tags);

-- Table: acp_ab_tests
-- A/B testing for conversion optimization
CREATE TABLE IF NOT EXISTS acp_ab_tests (
  id BIGSERIAL PRIMARY KEY,
  test_name TEXT NOT NULL,
  variant TEXT NOT NULL, -- 'control', 'variant_a', 'variant_b', etc.
  session_id TEXT REFERENCES acp_checkout_sessions(session_id) ON DELETE CASCADE,
  user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,

  -- Test data
  converted BOOLEAN DEFAULT FALSE,
  conversion_value DECIMAL(10, 2) DEFAULT 0,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  converted_at TIMESTAMPTZ
);

-- Indexes for A/B tests
CREATE INDEX IF NOT EXISTS idx_ab_tests_name ON acp_ab_tests(test_name);
CREATE INDEX IF NOT EXISTS idx_ab_tests_variant ON acp_ab_tests(variant);
CREATE INDEX IF NOT EXISTS idx_ab_tests_converted ON acp_ab_tests(converted);
CREATE INDEX IF NOT EXISTS idx_ab_tests_session_id ON acp_ab_tests(session_id);

-- Function: Calculate funnel conversion rates
CREATE OR REPLACE FUNCTION get_funnel_conversion_rates(
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ
)
RETURNS TABLE(
  step TEXT,
  count BIGINT,
  conversion_rate DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  WITH funnel_steps AS (
    SELECT
      (data->>'step')::TEXT as step,
      COUNT(*) as step_count
    FROM acp_analytics_events
    WHERE event_type = 'funnel_step'
      AND timestamp >= start_date
      AND timestamp <= end_date
    GROUP BY data->>'step'
  ),
  total_sessions AS (
    SELECT COUNT(*) as total
    FROM funnel_steps
    WHERE step = 'session_created'
  )
  SELECT
    fs.step,
    fs.step_count,
    ROUND((fs.step_count::DECIMAL / NULLIF(ts.total, 0)) * 100, 2) as conversion_rate
  FROM funnel_steps fs
  CROSS JOIN total_sessions ts
  ORDER BY
    CASE fs.step
      WHEN 'session_created' THEN 1
      WHEN 'items_added' THEN 2
      WHEN 'shipping_entered' THEN 3
      WHEN 'payment_initiated' THEN 4
      WHEN 'payment_completed' THEN 5
      WHEN 'order_confirmed' THEN 6
      ELSE 999
    END;
END;
$$ LANGUAGE plpgsql;

-- Function: Get error rate by time period
CREATE OR REPLACE FUNCTION get_error_rate(
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  time_bucket INTERVAL DEFAULT '1 hour'::INTERVAL
)
RETURNS TABLE(
  time_period TIMESTAMPTZ,
  error_count BIGINT,
  critical_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    date_trunc('hour', timestamp) as time_period,
    COUNT(*) as error_count,
    COUNT(*) FILTER (WHERE severity = 'critical') as critical_count
  FROM acp_error_logs
  WHERE timestamp >= start_date
    AND timestamp <= end_date
  GROUP BY date_trunc('hour', timestamp)
  ORDER BY time_period DESC;
END;
$$ LANGUAGE plpgsql;

-- Function: Get top error codes
CREATE OR REPLACE FUNCTION get_top_errors(
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  limit_count INTEGER DEFAULT 10
)
RETURNS TABLE(
  error_code TEXT,
  error_count BIGINT,
  last_occurrence TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    code as error_code,
    COUNT(*) as error_count,
    MAX(timestamp) as last_occurrence
  FROM acp_error_logs
  WHERE timestamp >= start_date
    AND timestamp <= end_date
  GROUP BY code
  ORDER BY error_count DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Function: Calculate average session duration
CREATE OR REPLACE FUNCTION get_average_session_duration(
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ
)
RETURNS INTERVAL AS $$
DECLARE
  avg_duration INTERVAL;
BEGIN
  SELECT AVG(
    CASE
      WHEN completed_at IS NOT NULL THEN completed_at - created_at
      ELSE expires_at - created_at
    END
  ) INTO avg_duration
  FROM acp_checkout_sessions
  WHERE created_at >= start_date
    AND created_at <= end_date;

  RETURN avg_duration;
END;
$$ LANGUAGE plpgsql;

-- View: Recent errors summary
CREATE OR REPLACE VIEW recent_errors_summary AS
SELECT
  code,
  severity,
  COUNT(*) as occurrence_count,
  MAX(timestamp) as last_occurrence,
  COUNT(*) FILTER (WHERE resolved = false) as unresolved_count
FROM acp_error_logs
WHERE timestamp > NOW() - INTERVAL '24 hours'
GROUP BY code, severity
ORDER BY occurrence_count DESC;

-- View: Daily conversion metrics
CREATE OR REPLACE VIEW daily_conversion_metrics AS
SELECT
  DATE(created_at) as date,
  COUNT(*) as total_sessions,
  COUNT(*) FILTER (WHERE status = 'completed') as completed_sessions,
  COUNT(*) FILTER (WHERE status = 'failed') as failed_sessions,
  COUNT(*) FILTER (WHERE status = 'expired') as expired_sessions,
  ROUND(
    (COUNT(*) FILTER (WHERE status = 'completed')::DECIMAL / NULLIF(COUNT(*), 0)) * 100,
    2
  ) as conversion_rate,
  SUM(total_amount) FILTER (WHERE status = 'completed') as total_revenue
FROM acp_checkout_sessions
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- View: Active sessions with time remaining
CREATE OR REPLACE VIEW active_sessions_monitor AS
SELECT
  session_id,
  buyer_email,
  total_amount,
  currency,
  status,
  created_at,
  expires_at,
  expires_at - NOW() as time_remaining,
  CASE
    WHEN expires_at - NOW() < INTERVAL '1 hour' THEN 'expiring_soon'
    WHEN expires_at - NOW() < INTERVAL '6 hours' THEN 'active'
    ELSE 'new'
  END as urgency
FROM acp_checkout_sessions
WHERE status IN ('pending', 'updated')
  AND expires_at > NOW()
ORDER BY expires_at ASC;

-- Grant permissions
GRANT ALL ON acp_analytics_events TO service_role;
GRANT ALL ON acp_error_logs TO service_role;
GRANT ALL ON critical_alerts TO service_role;
GRANT ALL ON acp_performance_metrics TO service_role;
GRANT ALL ON acp_ab_tests TO service_role;

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- Comments
COMMENT ON TABLE acp_analytics_events IS 'Stores all ACP events for funnel analysis and user behavior tracking';
COMMENT ON TABLE acp_error_logs IS 'Centralized error logging for debugging and monitoring';
COMMENT ON TABLE critical_alerts IS 'Critical system alerts requiring immediate attention';
COMMENT ON TABLE acp_performance_metrics IS 'Performance metrics for system health monitoring';
COMMENT ON TABLE acp_ab_tests IS 'A/B test assignments and conversion tracking';
COMMENT ON VIEW recent_errors_summary IS 'Summary of errors in the last 24 hours';
COMMENT ON VIEW daily_conversion_metrics IS 'Daily conversion and revenue metrics';
COMMENT ON VIEW active_sessions_monitor IS 'Real-time view of active checkout sessions';
