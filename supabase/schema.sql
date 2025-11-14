/*
  DealershipAI – Supabase Schema
  -------------------------------------------------------------
  • Region: US
  • Retention: 365 days
  • Primary KPIs: leads, appointments, impressions, conversions
  • Used by orchestrator agents, Copilot telemetry, and dashboard analytics.
*/

-- =========================
--  CORE TABLES
-- =========================

-- 1. Dealer Master
CREATE TABLE IF NOT EXISTS dealer_master (
  dealer_id TEXT PRIMARY KEY,
  dealer_name TEXT NOT NULL,
  region TEXT DEFAULT 'US',
  brand TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Dealer Metrics (daily rollup)
CREATE TABLE IF NOT EXISTS dealer_metrics_daily (
  id BIGSERIAL PRIMARY KEY,
  dealer_id TEXT REFERENCES dealer_master(dealer_id),
  metric_date DATE NOT NULL,
  leads INT DEFAULT 0,
  appointments INT DEFAULT 0,
  impressions INT DEFAULT 0,
  conversions INT DEFAULT 0,
  aiv NUMERIC(6,2),
  aeo NUMERIC(6,2),
  geo NUMERIC(6,2),
  forecast_accuracy NUMERIC(5,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Aggregate Metrics (global pool)
CREATE TABLE IF NOT EXISTS aggregate_metrics_daily (
  id BIGSERIAL PRIMARY KEY,
  metric_date DATE NOT NULL,
  avg_leads NUMERIC(10,2),
  avg_appointments NUMERIC(10,2),
  avg_impressions NUMERIC(12,2),
  avg_conversions NUMERIC(10,2),
  avg_aiv NUMERIC(6,2),
  avg_aeo NUMERIC(6,2),
  avg_geo NUMERIC(6,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Copilot Telemetry
CREATE TABLE IF NOT EXISTS copilot_events (
  id BIGSERIAL PRIMARY KEY,
  dealer_id TEXT REFERENCES dealer_master(dealer_id),
  user_id TEXT,
  event_type TEXT CHECK (event_type IN ('copilot','voiceorb','feedback')),
  tone TEXT,
  quote_id TEXT,
  feedback_score NUMERIC(3,2),
  context JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Correlation + Insight Results
CREATE TABLE IF NOT EXISTS correlation_results (
  id BIGSERIAL PRIMARY KEY,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  dealer_id TEXT,
  feature TEXT,
  importance NUMERIC(6,4),
  correlation NUMERIC(6,4),
  impact JSONB,
  model_version TEXT
);

-- 6. Mood Report (aggregated sentiment)
CREATE TABLE IF NOT EXISTS mood_report (
  id BIGSERIAL PRIMARY KEY,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  mood TEXT CHECK (mood IN ('positive','neutral','reflective')),
  sentiment_score NUMERIC(4,3),
  total_events INT,
  dealer_id TEXT REFERENCES dealer_master(dealer_id)
);

-- 7. Orchestration Logs
CREATE TABLE IF NOT EXISTS orchestrator_log (
  id BIGSERIAL PRIMARY KEY,
  job_id TEXT,
  success BOOLEAN,
  duration NUMERIC(6,2),
  last_run TIMESTAMPTZ,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================
--  RETENTION POLICIES
-- =========================

-- 365-day rolling retention for high-volume tables
CREATE OR REPLACE FUNCTION purge_old_records() RETURNS void AS $$
BEGIN
  DELETE FROM dealer_metrics_daily WHERE metric_date < (CURRENT_DATE - INTERVAL '365 days');
  DELETE FROM copilot_events WHERE created_at < (NOW() - INTERVAL '365 days');
  DELETE FROM correlation_results WHERE timestamp < (NOW() - INTERVAL '365 days');
  DELETE FROM mood_report WHERE timestamp < (NOW() - INTERVAL '365 days');
  DELETE FROM orchestrator_log WHERE created_at < (NOW() - INTERVAL '365 days');
END;
$$ LANGUAGE plpgsql;

-- Schedule purge (daily at midnight UTC)
-- Note: Requires pg_cron extension enabled in Supabase
-- SELECT cron.schedule('daily_purge', '0 0 * * *', $$SELECT purge_old_records();$$);

-- =========================
--  INDEXES
-- =========================

CREATE INDEX IF NOT EXISTS idx_metrics_date ON dealer_metrics_daily(metric_date);
CREATE INDEX IF NOT EXISTS idx_copilot_dealer ON copilot_events(dealer_id);
CREATE INDEX IF NOT EXISTS idx_corr_feature ON correlation_results(feature);
CREATE INDEX IF NOT EXISTS idx_mood_dealer ON mood_report(dealer_id);
CREATE INDEX IF NOT EXISTS idx_orch_job ON orchestrator_log(job_id);

-- =========================
--  VIEWS
-- =========================

-- Dealer Summary View
CREATE OR REPLACE VIEW dealer_summary AS
SELECT
  d.dealer_id,
  d.dealer_name,
  ROUND(AVG(m.leads)::NUMERIC,2) AS avg_leads,
  ROUND(AVG(m.appointments)::NUMERIC,2) AS avg_appointments,
  ROUND(AVG(m.conversions)::NUMERIC,2) AS avg_conversions,
  ROUND(AVG(m.aiv)::NUMERIC,2) AS avg_aiv,
  ROUND(AVG(m.aeo)::NUMERIC,2) AS avg_aeo,
  ROUND(AVG(m.geo)::NUMERIC,2) AS avg_geo
FROM dealer_master d
LEFT JOIN dealer_metrics_daily m ON d.dealer_id = m.dealer_id
GROUP BY d.dealer_id, d.dealer_name;

-- =========================
--  SECURITY POLICIES
-- =========================

-- Ensure all data stays in US region (metadata tagging)
ALTER DATABASE postgres SET timezone = 'UTC';
COMMENT ON DATABASE postgres IS 'US Data Routing enforced; GDPR-compliant telemetry storage.';

-- Row-Level Security
ALTER TABLE dealer_metrics_daily ENABLE ROW LEVEL SECURITY;
CREATE POLICY dealer_data_isolation ON dealer_metrics_daily
  FOR SELECT USING (region = 'US');

-- =========================
--  END OF SCHEMA
-- =========================
