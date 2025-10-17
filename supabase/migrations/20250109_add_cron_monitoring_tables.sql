-- Additional tables for Vercel Cron monitoring
-- Extends the closed-loop analytics system with cron job tracking

-- Review anomalies tracking (alternative naming for anomaly_detection)
CREATE TABLE IF NOT EXISTS review_anomalies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id UUID NOT NULL,
  dealer_name TEXT,
  anomaly_type TEXT NOT NULL, -- 'velocity_spike', 'sentiment_anomaly', 'fraud_probability', etc.
  severity TEXT NOT NULL, -- 'low', 'medium', 'high'
  confidence_score NUMERIC(3,2),
  detected_at TIMESTAMPTZ DEFAULT NOW(),
  details JSONB,
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMPTZ
);

-- Forecasts table (alternative naming for predictive_forecasts)
CREATE TABLE IF NOT EXISTS forecasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id UUID NOT NULL,
  forecast_week INTEGER,
  forecast_date DATE NOT NULL,
  aiv_forecast NUMERIC(5,2),
  aiv_lower_bound NUMERIC(5,2),
  aiv_upper_bound NUMERIC(5,2),
  rar_forecast NUMERIC(10,2),
  confidence NUMERIC(3,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cron job execution tracking
CREATE TABLE IF NOT EXISTS cron_job_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_name TEXT NOT NULL, -- 'retrain-aiv', 'evaluate-aiv', etc.
  endpoint TEXT NOT NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'running', -- 'running', 'success', 'failed'
  status_code INTEGER,
  execution_time_ms INTEGER,
  error_message TEXT,
  response_data JSONB,
  metadata JSONB
);

-- Cron job health monitoring
CREATE TABLE IF NOT EXISTS cron_job_health (
  job_name TEXT PRIMARY KEY,
  endpoint TEXT NOT NULL,
  schedule TEXT NOT NULL, -- '@daily', '@weekly', etc.
  last_run_at TIMESTAMPTZ,
  last_success_at TIMESTAMPTZ,
  consecutive_failures INTEGER DEFAULT 0,
  total_executions INTEGER DEFAULT 0,
  total_successes INTEGER DEFAULT 0,
  total_failures INTEGER DEFAULT 0,
  avg_execution_time_ms INTEGER,
  health_status TEXT DEFAULT 'healthy', -- 'healthy', 'degraded', 'critical'
  alert_sent BOOLEAN DEFAULT FALSE,
  alert_sent_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Initialize cron job health records
INSERT INTO cron_job_health (job_name, endpoint, schedule) VALUES
  ('retrain-aiv', '/api/train/reinforce', '0 0 * * *'),
  ('evaluate-aiv', '/api/train/evaluate', '0 0 * * 0'),
  ('fraudguard-scan', '/api/anomaly/reviews', '0 */6 * * *'),
  ('predict-forecast', '/api/predict/forecast', '0 0 * * 0'),
  ('generate-roi-report', '/api/reports/roi', '0 0 1 * *')
ON CONFLICT (job_name) DO NOTHING;

-- Row Level Security
ALTER TABLE review_anomalies ENABLE ROW LEVEL SECURITY;
ALTER TABLE forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cron_job_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cron_job_health ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Service role can manage review anomalies" ON review_anomalies
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage forecasts" ON forecasts
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage cron executions" ON cron_job_executions
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage cron health" ON cron_job_health
  FOR ALL USING (auth.role() = 'service_role');

-- Function to log cron job execution
CREATE OR REPLACE FUNCTION log_cron_execution(
  p_job_name TEXT,
  p_endpoint TEXT,
  p_status TEXT,
  p_status_code INTEGER DEFAULT NULL,
  p_execution_time_ms INTEGER DEFAULT NULL,
  p_error_message TEXT DEFAULT NULL,
  p_response_data JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  execution_id UUID;
BEGIN
  INSERT INTO cron_job_executions (
    job_name, endpoint, status, status_code, execution_time_ms,
    error_message, response_data, completed_at
  ) VALUES (
    p_job_name, p_endpoint, p_status, p_status_code, p_execution_time_ms,
    p_error_message, p_response_data, NOW()
  )
  RETURNING id INTO execution_id;

  -- Update health monitoring
  UPDATE cron_job_health
  SET
    last_run_at = NOW(),
    last_success_at = CASE WHEN p_status = 'success' THEN NOW() ELSE last_success_at END,
    consecutive_failures = CASE WHEN p_status = 'success' THEN 0 ELSE consecutive_failures + 1 END,
    total_executions = total_executions + 1,
    total_successes = total_successes + CASE WHEN p_status = 'success' THEN 1 ELSE 0 END,
    total_failures = total_failures + CASE WHEN p_status != 'success' THEN 1 ELSE 0 END,
    avg_execution_time_ms = CASE
      WHEN p_execution_time_ms IS NOT NULL
      THEN (COALESCE(avg_execution_time_ms, 0) * total_executions + p_execution_time_ms) / (total_executions + 1)
      ELSE avg_execution_time_ms
    END,
    health_status = CASE
      WHEN p_status != 'success' AND consecutive_failures + 1 >= 2 THEN 'critical'
      WHEN p_status != 'success' THEN 'degraded'
      ELSE 'healthy'
    END,
    updated_at = NOW()
  WHERE job_name = p_job_name;

  RETURN execution_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get cron job health summary
CREATE OR REPLACE FUNCTION get_cron_health_summary()
RETURNS TABLE (
  job_name TEXT,
  endpoint TEXT,
  health_status TEXT,
  last_run_at TIMESTAMPTZ,
  consecutive_failures INTEGER,
  success_rate NUMERIC,
  avg_execution_time_ms INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    h.job_name,
    h.endpoint,
    h.health_status,
    h.last_run_at,
    h.consecutive_failures,
    CASE
      WHEN h.total_executions > 0
      THEN ROUND((h.total_successes::NUMERIC / h.total_executions::NUMERIC) * 100, 2)
      ELSE 0::NUMERIC
    END as success_rate,
    h.avg_execution_time_ms
  FROM cron_job_health h
  ORDER BY h.job_name;
END;
$$ LANGUAGE plpgsql;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_review_anomalies_dealer_date ON review_anomalies(dealer_id, detected_at);
CREATE INDEX IF NOT EXISTS idx_review_anomalies_severity ON review_anomalies(severity);
CREATE INDEX IF NOT EXISTS idx_review_anomalies_resolved ON review_anomalies(resolved);
CREATE INDEX IF NOT EXISTS idx_forecasts_dealer_date ON forecasts(dealer_id, forecast_date);
CREATE INDEX IF NOT EXISTS idx_cron_executions_job ON cron_job_executions(job_name);
CREATE INDEX IF NOT EXISTS idx_cron_executions_status ON cron_job_executions(status);
CREATE INDEX IF NOT EXISTS idx_cron_executions_date ON cron_job_executions(started_at);

COMMENT ON TABLE review_anomalies IS 'Tracks anomalies detected in review data by FraudGuard';
COMMENT ON TABLE forecasts IS 'Stores Kalman-smoothed AIV forecasts for dealers';
COMMENT ON TABLE cron_job_executions IS 'Logs each cron job execution with timing and status';
COMMENT ON TABLE cron_job_health IS 'Monitors overall health of cron jobs for alerting';
