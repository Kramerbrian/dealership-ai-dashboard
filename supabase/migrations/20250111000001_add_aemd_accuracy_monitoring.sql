-- Migration: Add AEMD and Accuracy Monitoring Tables
-- Created: 2025-01-11
-- Purpose: Track AEMD financial metrics and AI accuracy monitoring

-- ============================================================================
-- AEMD Metrics Table
-- ============================================================================
-- Stores AEMD (AI Economic Metric Dashboard) calculations
-- Formula: ωDef * Σ(Metric_i * ΩFin_i)
CREATE TABLE IF NOT EXISTS aemd_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  report_date date NOT NULL,

  -- Raw metric values
  ctr_p3 numeric(8,4) NOT NULL,           -- CTR for P3 (baseline)
  ctr_fs numeric(8,4) NOT NULL,            -- CTR for Form Submissions
  total_vdp_views int NOT NULL,            -- Total VDP Views
  vdp_views_ai int NOT NULL,               -- VDP Views attributed to AI
  total_assisted_conversions int NOT NULL, -- Total Assisted Conversions
  assisted_conversions_paa int NOT NULL,   -- Assisted Conversions from PAA

  -- ΩFin Components (financial weights)
  omega_fs numeric(6,4) NOT NULL,          -- FS financial weight (0.30)
  omega_aio numeric(6,4) NOT NULL,         -- AIO financial weight (0.50)
  omega_paa numeric(6,4) NOT NULL,         -- PAA financial weight (0.20)

  -- Calculated values
  fs_score numeric(10,4) NOT NULL,         -- (CTR_P3/CTR_FS) * 0.30
  aio_score numeric(10,4) NOT NULL,        -- (Total_VDP/VDP_AI) * 0.50
  paa_score numeric(10,4) NOT NULL,        -- (Total_Conv/Conv_PAA) * 0.20

  -- Final AEMD score
  omega_def numeric(6,4) NOT NULL,         -- Default omega weight
  aemd_final numeric(12,4) NOT NULL,       -- Final weighted score

  -- Metadata
  calculation_version text NOT NULL DEFAULT 'v1.0',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  UNIQUE (tenant_id, report_date)
);

CREATE INDEX idx_aemd_metrics_tenant_date ON aemd_metrics(tenant_id, report_date DESC);
CREATE INDEX idx_aemd_metrics_score ON aemd_metrics(tenant_id, aemd_final DESC);

-- ============================================================================
-- Accuracy Monitoring Table
-- ============================================================================
-- Tracks AI model accuracy and reliability metrics over time
CREATE TABLE IF NOT EXISTS accuracy_monitoring (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  measurement_date timestamptz NOT NULL,

  -- Core accuracy metrics
  issue_detection_accuracy numeric(5,4) NOT NULL,  -- 0.88 = 88%
  ranking_correlation numeric(5,4) NOT NULL,       -- 0.72 = 72%
  consensus_reliability numeric(5,4) NOT NULL,     -- 0.92 = 92%

  -- Confidence metrics
  variance numeric(8,4) NOT NULL,                  -- Variance value
  confidence_level text NOT NULL,                  -- VERY_HIGH, HIGH, MEDIUM, LOW
  confidence_threshold numeric(5,2) NOT NULL DEFAULT 5.0, -- variance <5 = VERY_HIGH

  -- Additional tracking
  sample_size int,
  model_version text,
  evaluation_method text,
  notes text,

  -- Alert flags
  is_below_threshold boolean NOT NULL DEFAULT false,
  alert_triggered_at timestamptz,
  alert_acknowledged_at timestamptz,
  alert_acknowledged_by uuid,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_accuracy_monitoring_tenant_date ON accuracy_monitoring(tenant_id, measurement_date DESC);
CREATE INDEX idx_accuracy_monitoring_alerts ON accuracy_monitoring(tenant_id, is_below_threshold, alert_triggered_at)
  WHERE is_below_threshold = true AND alert_acknowledged_at IS NULL;

-- ============================================================================
-- Accuracy Thresholds Table
-- ============================================================================
-- Configurable thresholds for accuracy monitoring alerts
CREATE TABLE IF NOT EXISTS accuracy_thresholds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  metric_name text NOT NULL,

  -- Threshold values
  warning_threshold numeric(5,4) NOT NULL,
  critical_threshold numeric(5,4) NOT NULL,
  target_threshold numeric(5,4),

  -- Alert configuration
  alert_enabled boolean NOT NULL DEFAULT true,
  alert_cooldown_minutes int NOT NULL DEFAULT 60,
  notification_channels jsonb, -- ["email", "slack", "webhook"]

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  UNIQUE (tenant_id, metric_name)
);

CREATE INDEX idx_accuracy_thresholds_tenant ON accuracy_thresholds(tenant_id);

-- Insert default thresholds
INSERT INTO accuracy_thresholds (tenant_id, metric_name, warning_threshold, critical_threshold, target_threshold)
VALUES
  ('00000000-0000-0000-0000-000000000000'::uuid, 'issue_detection_accuracy', 0.80, 0.70, 0.90),
  ('00000000-0000-0000-0000-000000000000'::uuid, 'ranking_correlation', 0.65, 0.55, 0.80),
  ('00000000-0000-0000-0000-000000000000'::uuid, 'consensus_reliability', 0.85, 0.75, 0.95)
ON CONFLICT (tenant_id, metric_name) DO NOTHING;

-- ============================================================================
-- Accuracy Alerts Table
-- ============================================================================
-- Historical log of accuracy monitoring alerts
CREATE TABLE IF NOT EXISTS accuracy_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  accuracy_monitoring_id uuid REFERENCES accuracy_monitoring(id) ON DELETE CASCADE,

  -- Alert details
  metric_name text NOT NULL,
  metric_value numeric(5,4) NOT NULL,
  threshold_value numeric(5,4) NOT NULL,
  severity text NOT NULL, -- 'warning', 'critical'

  -- Alert lifecycle
  triggered_at timestamptz NOT NULL DEFAULT now(),
  acknowledged_at timestamptz,
  acknowledged_by uuid,
  resolved_at timestamptz,
  resolved_by uuid,
  resolution_notes text,

  -- Notification tracking
  notifications_sent jsonb, -- {"email": true, "slack": true}

  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_accuracy_alerts_tenant ON accuracy_alerts(tenant_id, triggered_at DESC);
CREATE INDEX idx_accuracy_alerts_unacknowledged ON accuracy_alerts(tenant_id, acknowledged_at)
  WHERE acknowledged_at IS NULL;

-- ============================================================================
-- Row Level Security Policies
-- ============================================================================

ALTER TABLE aemd_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE accuracy_monitoring ENABLE ROW LEVEL SECURITY;
ALTER TABLE accuracy_thresholds ENABLE ROW LEVEL SECURITY;
ALTER TABLE accuracy_alerts ENABLE ROW LEVEL SECURITY;

-- AEMD Metrics Policies
DO $$ BEGIN
  CREATE POLICY aemd_metrics_tenant_select ON aemd_metrics FOR SELECT
  USING (tenant_id = current_setting('app.tenant')::uuid);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY aemd_metrics_tenant_insert ON aemd_metrics FOR INSERT
  WITH CHECK (tenant_id = current_setting('app.tenant')::uuid);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY aemd_metrics_tenant_update ON aemd_metrics FOR UPDATE
  USING (tenant_id = current_setting('app.tenant')::uuid);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Accuracy Monitoring Policies
DO $$ BEGIN
  CREATE POLICY accuracy_monitoring_tenant_select ON accuracy_monitoring FOR SELECT
  USING (tenant_id = current_setting('app.tenant')::uuid);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY accuracy_monitoring_tenant_insert ON accuracy_monitoring FOR INSERT
  WITH CHECK (tenant_id = current_setting('app.tenant')::uuid);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY accuracy_monitoring_tenant_update ON accuracy_monitoring FOR UPDATE
  USING (tenant_id = current_setting('app.tenant')::uuid);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Accuracy Thresholds Policies
DO $$ BEGIN
  CREATE POLICY accuracy_thresholds_tenant_select ON accuracy_thresholds FOR SELECT
  USING (tenant_id = current_setting('app.tenant')::uuid);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY accuracy_thresholds_tenant_insert ON accuracy_thresholds FOR INSERT
  WITH CHECK (tenant_id = current_setting('app.tenant')::uuid);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY accuracy_thresholds_tenant_update ON accuracy_thresholds FOR UPDATE
  USING (tenant_id = current_setting('app.tenant')::uuid);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Accuracy Alerts Policies
DO $$ BEGIN
  CREATE POLICY accuracy_alerts_tenant_select ON accuracy_alerts FOR SELECT
  USING (tenant_id = current_setting('app.tenant')::uuid);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY accuracy_alerts_tenant_insert ON accuracy_alerts FOR INSERT
  WITH CHECK (tenant_id = current_setting('app.tenant')::uuid);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY accuracy_alerts_tenant_update ON accuracy_alerts FOR UPDATE
  USING (tenant_id = current_setting('app.tenant')::uuid);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================================
-- Functions
-- ============================================================================

-- Function to calculate confidence level based on variance
CREATE OR REPLACE FUNCTION calculate_confidence_level(variance_value numeric, threshold numeric DEFAULT 5.0)
RETURNS text AS $$
BEGIN
  IF variance_value < threshold THEN
    RETURN 'VERY_HIGH';
  ELSIF variance_value < threshold * 2 THEN
    RETURN 'HIGH';
  ELSIF variance_value < threshold * 3 THEN
    RETURN 'MEDIUM';
  ELSE
    RETURN 'LOW';
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to calculate AEMD final score
CREATE OR REPLACE FUNCTION calculate_aemd_final(
  omega_def numeric,
  fs_score numeric,
  aio_score numeric,
  paa_score numeric
)
RETURNS numeric AS $$
BEGIN
  RETURN omega_def * (fs_score + aio_score + paa_score);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Trigger to automatically calculate confidence level
CREATE OR REPLACE FUNCTION trg_calculate_confidence_level()
RETURNS trigger AS $$
BEGIN
  NEW.confidence_level := calculate_confidence_level(NEW.variance, NEW.confidence_threshold);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  DROP TRIGGER IF EXISTS trg_accuracy_monitoring_confidence ON accuracy_monitoring;
  CREATE TRIGGER trg_accuracy_monitoring_confidence
  BEFORE INSERT OR UPDATE ON accuracy_monitoring
  FOR EACH ROW EXECUTE FUNCTION trg_calculate_confidence_level();
END $$;

-- Trigger to check thresholds and create alerts
CREATE OR REPLACE FUNCTION trg_check_accuracy_thresholds()
RETURNS trigger AS $$
DECLARE
  threshold_rec RECORD;
  metric_value numeric;
  metric_name text;
  severity text;
BEGIN
  -- Check each metric against thresholds
  FOR threshold_rec IN
    SELECT * FROM accuracy_thresholds
    WHERE tenant_id = NEW.tenant_id AND alert_enabled = true
  LOOP
    -- Get metric value based on metric name
    CASE threshold_rec.metric_name
      WHEN 'issue_detection_accuracy' THEN
        metric_value := NEW.issue_detection_accuracy;
      WHEN 'ranking_correlation' THEN
        metric_value := NEW.ranking_correlation;
      WHEN 'consensus_reliability' THEN
        metric_value := NEW.consensus_reliability;
      ELSE
        CONTINUE;
    END CASE;

    -- Check if below thresholds
    IF metric_value < threshold_rec.critical_threshold THEN
      severity := 'critical';
      NEW.is_below_threshold := true;
      NEW.alert_triggered_at := now();

      INSERT INTO accuracy_alerts (
        tenant_id, accuracy_monitoring_id, metric_name,
        metric_value, threshold_value, severity
      ) VALUES (
        NEW.tenant_id, NEW.id, threshold_rec.metric_name,
        metric_value, threshold_rec.critical_threshold, severity
      );

    ELSIF metric_value < threshold_rec.warning_threshold THEN
      severity := 'warning';
      NEW.is_below_threshold := true;
      NEW.alert_triggered_at := now();

      INSERT INTO accuracy_alerts (
        tenant_id, accuracy_monitoring_id, metric_name,
        metric_value, threshold_value, severity
      ) VALUES (
        NEW.tenant_id, NEW.id, threshold_rec.metric_name,
        metric_value, threshold_rec.warning_threshold, severity
      );
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  DROP TRIGGER IF EXISTS trg_accuracy_monitoring_alerts ON accuracy_monitoring;
  CREATE TRIGGER trg_accuracy_monitoring_alerts
  AFTER INSERT OR UPDATE ON accuracy_monitoring
  FOR EACH ROW EXECUTE FUNCTION trg_check_accuracy_thresholds();
END $$;

-- Trigger to update updated_at timestamps
DO $$ BEGIN
  DROP TRIGGER IF EXISTS trg_aemd_metrics_updated_at ON aemd_metrics;
  CREATE TRIGGER trg_aemd_metrics_updated_at
  BEFORE UPDATE ON aemd_metrics
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
END $$;

DO $$ BEGIN
  DROP TRIGGER IF EXISTS trg_accuracy_monitoring_updated_at ON accuracy_monitoring;
  CREATE TRIGGER trg_accuracy_monitoring_updated_at
  BEFORE UPDATE ON accuracy_monitoring
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
END $$;

DO $$ BEGIN
  DROP TRIGGER IF EXISTS trg_accuracy_thresholds_updated_at ON accuracy_thresholds;
  CREATE TRIGGER trg_accuracy_thresholds_updated_at
  BEFORE UPDATE ON accuracy_thresholds
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
END $$;

-- ============================================================================
-- Views for Reporting
-- ============================================================================

-- View combining AEMD and accuracy metrics
CREATE OR REPLACE VIEW avi_monitoring_summary AS
SELECT
  ar.tenant_id,
  ar.as_of as report_date,
  ar.aiv_pct,
  ar.ati_pct,
  ar.crs_pct,
  ae.aemd_final,
  ae.fs_score,
  ae.aio_score,
  ae.paa_score,
  am.issue_detection_accuracy,
  am.ranking_correlation,
  am.consensus_reliability,
  am.confidence_level,
  am.is_below_threshold as has_accuracy_alerts
FROM avi_reports ar
LEFT JOIN aemd_metrics ae ON ar.tenant_id = ae.tenant_id AND ar.as_of = ae.report_date
LEFT JOIN accuracy_monitoring am ON ar.tenant_id = am.tenant_id AND ar.as_of::timestamptz = am.measurement_date
ORDER BY ar.tenant_id, ar.as_of DESC;
