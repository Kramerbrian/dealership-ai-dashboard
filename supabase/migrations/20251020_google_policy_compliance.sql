-- ============================================================================
-- Google Ads Policy Compliance Tracking Schema
-- Created: 2025-10-20
-- ============================================================================

-- Policy Version Tracking
CREATE TABLE IF NOT EXISTS google_policy_versions (
  id SERIAL PRIMARY KEY,
  version TEXT NOT NULL UNIQUE,
  last_updated TIMESTAMPTZ NOT NULL,
  last_checked TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  changes JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_policy_versions_version ON google_policy_versions(version);
CREATE INDEX idx_policy_versions_checked ON google_policy_versions(last_checked DESC);

-- Policy Compliance Audit Results
CREATE TABLE IF NOT EXISTS google_policy_audits (
  id SERIAL PRIMARY KEY,
  tenant_id TEXT,
  ad_url TEXT NOT NULL,
  lp_url TEXT NOT NULL,
  vdp_url TEXT NOT NULL,

  -- Compliance Results
  compliant BOOLEAN NOT NULL,
  risk_score NUMERIC(5,2) NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),

  -- Breakdown
  jaccard_score NUMERIC(5,4) NOT NULL CHECK (jaccard_score >= 0 AND jaccard_score <= 1),
  price_mismatch BOOLEAN NOT NULL,
  hidden_fees BOOLEAN NOT NULL,
  disclosure_clarity NUMERIC(5,2) NOT NULL CHECK (disclosure_clarity >= 0 AND disclosure_clarity <= 100),

  -- ATI Impact
  consistency_penalty NUMERIC(5,2) NOT NULL DEFAULT 0,
  precision_penalty NUMERIC(5,2) NOT NULL DEFAULT 0,

  -- Violations (stored as JSONB array)
  violations JSONB NOT NULL DEFAULT '[]',

  -- Raw scan data (optional, for debugging)
  raw_data JSONB,

  -- Metadata
  scan_duration_ms INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_audits_tenant ON google_policy_audits(tenant_id);
CREATE INDEX idx_audits_created_at ON google_policy_audits(created_at DESC);
CREATE INDEX idx_audits_compliant ON google_policy_audits(compliant);
CREATE INDEX idx_audits_risk_score ON google_policy_audits(risk_score DESC);
CREATE INDEX idx_audits_ad_url ON google_policy_audits(ad_url);

-- Composite index for summary queries
CREATE INDEX idx_audits_summary ON google_policy_audits(tenant_id, created_at DESC, compliant);

-- Policy Drift Events
CREATE TABLE IF NOT EXISTS google_policy_drift_events (
  id SERIAL PRIMARY KEY,
  old_version TEXT NOT NULL,
  new_version TEXT NOT NULL,
  changes JSONB NOT NULL,
  action_required BOOLEAN NOT NULL DEFAULT FALSE,
  notified_at TIMESTAMPTZ,
  acknowledged_at TIMESTAMPTZ,
  acknowledged_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_drift_events_created_at ON google_policy_drift_events(created_at DESC);
CREATE INDEX idx_drift_events_notified ON google_policy_drift_events(notified_at);
CREATE INDEX idx_drift_events_action_required ON google_policy_drift_events(action_required);

-- Compliance Summary (Materialized View for fast dashboard queries)
CREATE MATERIALIZED VIEW IF NOT EXISTS google_policy_compliance_summary AS
SELECT
  tenant_id,
  DATE_TRUNC('day', created_at) AS day,
  COUNT(*) AS total_audits,
  COUNT(*) FILTER (WHERE compliant) AS compliant_audits,
  COUNT(*) FILTER (WHERE NOT compliant) AS non_compliant_audits,
  AVG(risk_score) AS avg_risk_score,
  AVG(jaccard_score) AS avg_jaccard,
  AVG(disclosure_clarity) AS avg_disclosure,
  COUNT(*) FILTER (WHERE price_mismatch) AS price_mismatch_count,
  COUNT(*) FILTER (WHERE hidden_fees) AS hidden_fees_count,
  SUM(consistency_penalty) AS total_consistency_penalty,
  SUM(precision_penalty) AS total_precision_penalty,
  -- Extract critical violations count from JSONB
  SUM((SELECT COUNT(*) FROM jsonb_array_elements(violations) v WHERE v->>'type' = 'critical')) AS critical_violations,
  SUM((SELECT COUNT(*) FROM jsonb_array_elements(violations) v WHERE v->>'type' = 'warning')) AS warning_violations
FROM google_policy_audits
WHERE created_at >= NOW() - INTERVAL '90 days'
GROUP BY tenant_id, DATE_TRUNC('day', created_at);

-- Index for materialized view
CREATE INDEX idx_compliance_summary_tenant_day ON google_policy_compliance_summary(tenant_id, day DESC);

-- Function to refresh summary (call via pg_cron or manually)
CREATE OR REPLACE FUNCTION refresh_google_policy_summary()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY google_policy_compliance_summary;
END;
$$ LANGUAGE plpgsql;

-- RLS Policies (if using Supabase multi-tenancy)
ALTER TABLE google_policy_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_policy_drift_events ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own tenant's audits
CREATE POLICY tenant_isolation_audits ON google_policy_audits
  FOR ALL
  USING (
    tenant_id = current_setting('app.current_tenant', TRUE)::TEXT
    OR current_setting('app.current_tenant', TRUE) IS NULL
  );

-- Policy: All users can see drift events (policy updates are global)
CREATE POLICY public_drift_events ON google_policy_drift_events
  FOR SELECT
  USING (TRUE);

-- Insert initial policy version (current as of 2025-10-20)
INSERT INTO google_policy_versions (version, last_updated, changes)
VALUES (
  '2025.10.1',
  '2025-10-15',
  '[
    "Stricter disclosure requirements for lease offers",
    "New APR display guidelines for finance offers",
    "Enhanced fee transparency requirements"
  ]'::JSONB
)
ON CONFLICT (version) DO NOTHING;

-- Grant permissions (adjust based on your setup)
GRANT SELECT, INSERT, UPDATE ON google_policy_audits TO authenticated;
GRANT SELECT ON google_policy_versions TO authenticated;
GRANT SELECT ON google_policy_drift_events TO authenticated;
GRANT SELECT ON google_policy_compliance_summary TO authenticated;

-- Comments for documentation
COMMENT ON TABLE google_policy_versions IS 'Tracks Google Ads policy versions and changes';
COMMENT ON TABLE google_policy_audits IS 'Stores individual policy compliance audit results';
COMMENT ON TABLE google_policy_drift_events IS 'Logs policy update events for alerting';
COMMENT ON MATERIALIZED VIEW google_policy_compliance_summary IS 'Pre-aggregated compliance metrics for dashboard (refresh every 1 hour)';

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Google Policy Compliance schema created successfully!';
  RAISE NOTICE 'Tables: google_policy_versions, google_policy_audits, google_policy_drift_events';
  RAISE NOTICE 'Materialized View: google_policy_compliance_summary';
  RAISE NOTICE 'Run: SELECT refresh_google_policy_summary(); to populate summary';
END $$;
