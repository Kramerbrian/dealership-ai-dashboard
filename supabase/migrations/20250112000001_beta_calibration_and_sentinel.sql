-- ============================================================================
-- Beta Calibration & Sentinel Monitoring System
-- ============================================================================
-- This migration adds:
-- 1. DTRI beta coefficient configuration & calibration logging
-- 2. Sentinel autonomous monitoring events
-- 3. Supporting indexes for performance
-- ============================================================================

-- ====================
-- 1. DTRI Configuration
-- ====================

CREATE TABLE IF NOT EXISTS dtri_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  beta_coefficient DECIMAL(10, 6) NOT NULL DEFAULT 1.000000,
  last_calibration TIMESTAMPTZ,
  calibration_reason TEXT,
  sample_size INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert default config if not exists
INSERT INTO dtri_config (beta_coefficient, calibration_reason)
VALUES (1.000000, 'Initial default')
ON CONFLICT DO NOTHING;

-- ====================
-- 2. Beta Calibration Log
-- ====================

CREATE TABLE IF NOT EXISTS dtri_calibration_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  old_beta DECIMAL(10, 6) NOT NULL,
  new_beta DECIMAL(10, 6) NOT NULL,
  drift_percentage DECIMAL(10, 4) NOT NULL,
  sample_size INTEGER NOT NULL,
  trigger VARCHAR(50) NOT NULL, -- 'auto_recalibration', 'manual', 'sentinel_alert'
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for time-based queries
CREATE INDEX IF NOT EXISTS idx_dtri_calibration_log_created_at
  ON dtri_calibration_log(created_at DESC);

-- Index for trigger-based queries
CREATE INDEX IF NOT EXISTS idx_dtri_calibration_log_trigger
  ON dtri_calibration_log(trigger);

-- ====================
-- 3. DTRI Analysis Table
-- ====================

CREATE TABLE IF NOT EXISTS dtri_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id VARCHAR(100) NOT NULL,
  vertical VARCHAR(50) NOT NULL, -- 'sales', 'service', 'parts', 'acquisition'
  correlation_score DECIMAL(10, 6) NOT NULL DEFAULT 0.5,
  impact_factor DECIMAL(10, 6) NOT NULL DEFAULT 1.0,
  confidence_score DECIMAL(10, 6) NOT NULL DEFAULT 0.7,
  dtri_score DECIMAL(10, 4) NOT NULL,
  recommendations JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for analysis queries
CREATE INDEX IF NOT EXISTS idx_dtri_analysis_dealer_id
  ON dtri_analysis(dealer_id);

CREATE INDEX IF NOT EXISTS idx_dtri_analysis_created_at
  ON dtri_analysis(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_dtri_analysis_dealer_created
  ON dtri_analysis(dealer_id, created_at DESC);

-- ====================
-- 4. DTRI Audit Log
-- ====================

CREATE TABLE IF NOT EXISTS dtri_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id VARCHAR(100) NOT NULL,
  job_type VARCHAR(50) NOT NULL, -- 'nightly_dtri', 'manual_analysis', etc.
  results JSONB NOT NULL DEFAULT '[]'::jsonb,
  status VARCHAR(20) NOT NULL DEFAULT 'completed', -- 'completed', 'failed', 'partial'
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for audit queries
CREATE INDEX IF NOT EXISTS idx_dtri_audit_log_dealer_id
  ON dtri_audit_log(dealer_id);

CREATE INDEX IF NOT EXISTS idx_dtri_audit_log_created_at
  ON dtri_audit_log(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_dtri_audit_log_status
  ON dtri_audit_log(status);

-- ====================
-- 5. Sentinel Events
-- ====================

CREATE TABLE IF NOT EXISTS sentinel_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id VARCHAR(100) NOT NULL,
  event_type VARCHAR(100) NOT NULL, -- 'REVIEW_CRISIS_SOW', 'VDP_OPTIMIZATION_SOW', etc.
  metric_name VARCHAR(100), -- 'avg_response_time', 'lcp', 'tsm', 'dtri_delta'
  metric_value DECIMAL(10, 4),
  threshold DECIMAL(10, 4),
  severity VARCHAR(20) NOT NULL DEFAULT 'info', -- 'info', 'warning', 'critical'
  alert_sent BOOLEAN NOT NULL DEFAULT FALSE,
  alert_sent_at TIMESTAMPTZ,
  acknowledged BOOLEAN NOT NULL DEFAULT FALSE,
  acknowledged_by VARCHAR(100),
  acknowledged_at TIMESTAMPTZ,
  resolution_notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for sentinel queries
CREATE INDEX IF NOT EXISTS idx_sentinel_events_dealer_id
  ON sentinel_events(dealer_id);

CREATE INDEX IF NOT EXISTS idx_sentinel_events_event_type
  ON sentinel_events(event_type);

CREATE INDEX IF NOT EXISTS idx_sentinel_events_severity
  ON sentinel_events(severity);

CREATE INDEX IF NOT EXISTS idx_sentinel_events_created_at
  ON sentinel_events(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_sentinel_events_acknowledged
  ON sentinel_events(acknowledged, created_at DESC);

-- Composite index for active critical alerts
CREATE INDEX IF NOT EXISTS idx_sentinel_events_active_critical
  ON sentinel_events(dealer_id, severity, acknowledged)
  WHERE acknowledged = FALSE AND severity = 'critical';

-- ====================
-- 6. Sentinel Configuration
-- ====================

CREATE TABLE IF NOT EXISTS sentinel_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id VARCHAR(100) UNIQUE NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,

  -- Review monitoring thresholds
  review_response_time_threshold DECIMAL(10, 2) DEFAULT 4.0, -- hours
  review_velocity_threshold DECIMAL(10, 4) DEFAULT 0.85,
  negativity_rate_threshold DECIMAL(10, 4) DEFAULT 0.20,

  -- PageSpeed thresholds
  lcp_threshold DECIMAL(10, 2) DEFAULT 3.0, -- seconds
  fid_threshold DECIMAL(10, 2) DEFAULT 100.0, -- milliseconds
  cls_threshold DECIMAL(10, 4) DEFAULT 0.1,

  -- Economic thresholds
  tsm_critical_threshold DECIMAL(10, 4) DEFAULT 1.4,
  tsm_warning_threshold DECIMAL(10, 4) DEFAULT 1.2,

  -- Competitive thresholds
  dtri_delta_threshold DECIMAL(10, 2) DEFAULT 10.0, -- points

  -- Alert configuration
  alert_cooldown_minutes INTEGER DEFAULT 60,
  webhook_url TEXT,
  notification_channels JSONB DEFAULT '["email", "webhook"]'::jsonb,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ====================
-- 7. Sentinel Alert History
-- ====================

CREATE TABLE IF NOT EXISTS sentinel_alert_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES sentinel_events(id),
  dealer_id VARCHAR(100) NOT NULL,
  channel VARCHAR(50) NOT NULL, -- 'email', 'webhook', 'slack', 'sms'
  status VARCHAR(20) NOT NULL DEFAULT 'sent', -- 'sent', 'failed', 'pending'
  response_code INTEGER,
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for alert history queries
CREATE INDEX IF NOT EXISTS idx_sentinel_alert_history_event_id
  ON sentinel_alert_history(event_id);

CREATE INDEX IF NOT EXISTS idx_sentinel_alert_history_dealer_id
  ON sentinel_alert_history(dealer_id);

CREATE INDEX IF NOT EXISTS idx_sentinel_alert_history_created_at
  ON sentinel_alert_history(created_at DESC);

-- ====================
-- 8. Views for Monitoring
-- ====================

-- Active critical alerts view
CREATE OR REPLACE VIEW sentinel_active_alerts AS
SELECT
  se.*,
  sc.webhook_url,
  sc.notification_channels
FROM sentinel_events se
LEFT JOIN sentinel_config sc ON se.dealer_id = sc.dealer_id
WHERE se.acknowledged = FALSE
  AND se.severity IN ('critical', 'warning')
ORDER BY
  CASE
    WHEN se.severity = 'critical' THEN 1
    WHEN se.severity = 'warning' THEN 2
    ELSE 3
  END,
  se.created_at DESC;

-- Beta calibration summary view
CREATE OR REPLACE VIEW beta_calibration_summary AS
SELECT
  dc.beta_coefficient AS current_beta,
  dc.last_calibration,
  dc.calibration_reason,
  dc.sample_size AS last_sample_size,
  dcl.old_beta AS previous_beta,
  dcl.drift_percentage AS last_drift,
  dcl.created_at AS last_calibration_time
FROM dtri_config dc
LEFT JOIN LATERAL (
  SELECT old_beta, drift_percentage, created_at
  FROM dtri_calibration_log
  ORDER BY created_at DESC
  LIMIT 1
) dcl ON true;

-- Dealer DTRI health summary
CREATE OR REPLACE VIEW dtri_dealer_health AS
SELECT
  dealer_id,
  COUNT(*) AS total_analyses,
  AVG(dtri_score) AS avg_dtri_score,
  MAX(dtri_score) AS max_dtri_score,
  MIN(dtri_score) AS min_dtri_score,
  AVG(confidence_score) AS avg_confidence,
  MAX(created_at) AS last_analysis
FROM dtri_analysis
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY dealer_id
ORDER BY avg_dtri_score DESC;

-- Sentinel event summary by dealer
CREATE OR REPLACE VIEW sentinel_event_summary AS
SELECT
  dealer_id,
  severity,
  COUNT(*) AS event_count,
  COUNT(*) FILTER (WHERE acknowledged = FALSE) AS open_count,
  COUNT(*) FILTER (WHERE acknowledged = TRUE) AS resolved_count,
  MAX(created_at) AS last_event
FROM sentinel_events
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY dealer_id, severity
ORDER BY dealer_id,
  CASE
    WHEN severity = 'critical' THEN 1
    WHEN severity = 'warning' THEN 2
    ELSE 3
  END;

-- ====================
-- 9. Row Level Security (RLS)
-- ====================

-- Enable RLS on all tables
ALTER TABLE dtri_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE dtri_calibration_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE dtri_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE dtri_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE sentinel_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE sentinel_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE sentinel_alert_history ENABLE ROW LEVEL SECURITY;

-- Service role has full access
CREATE POLICY "Service role has full access to dtri_config"
  ON dtri_config FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to dtri_calibration_log"
  ON dtri_calibration_log FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to dtri_analysis"
  ON dtri_analysis FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to dtri_audit_log"
  ON dtri_audit_log FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to sentinel_events"
  ON sentinel_events FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to sentinel_config"
  ON sentinel_config FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to sentinel_alert_history"
  ON sentinel_alert_history FOR ALL
  USING (auth.role() = 'service_role');

-- ====================
-- 10. Functions
-- ====================

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to relevant tables
CREATE TRIGGER update_dtri_config_updated_at
  BEFORE UPDATE ON dtri_config
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sentinel_events_updated_at
  BEFORE UPDATE ON sentinel_events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sentinel_config_updated_at
  BEFORE UPDATE ON sentinel_config
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ====================
-- 11. Comments
-- ====================

COMMENT ON TABLE dtri_config IS 'DTRI system configuration including beta coefficients';
COMMENT ON TABLE dtri_calibration_log IS 'Historical log of beta coefficient calibrations';
COMMENT ON TABLE dtri_analysis IS 'Individual DTRI analysis results per dealer/vertical';
COMMENT ON TABLE dtri_audit_log IS 'Audit trail of DTRI job executions';
COMMENT ON TABLE sentinel_events IS 'Autonomous monitoring events and alerts';
COMMENT ON TABLE sentinel_config IS 'Per-dealer configuration for Sentinel monitoring';
COMMENT ON TABLE sentinel_alert_history IS 'History of sent alerts across all channels';

COMMENT ON VIEW sentinel_active_alerts IS 'Real-time view of unacknowledged critical/warning alerts';
COMMENT ON VIEW beta_calibration_summary IS 'Current beta status with last calibration details';
COMMENT ON VIEW dtri_dealer_health IS '30-day DTRI performance summary by dealer';
COMMENT ON VIEW sentinel_event_summary IS '7-day event summary by dealer and severity';

-- ====================
-- Success Message
-- ====================

DO $$
BEGIN
  RAISE NOTICE '✅ Beta Calibration & Sentinel Monitoring migration complete!';
  RAISE NOTICE '📊 Tables created: 7';
  RAISE NOTICE '📈 Views created: 4';
  RAISE NOTICE '🔐 RLS policies applied';
  RAISE NOTICE '⚡ Indexes created for performance';
END $$;
