-- Integration Audit Log Table
-- Tracks health checks and validation results for dealer integrations

CREATE TABLE IF NOT EXISTS integration_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dealer_id TEXT NOT NULL,
  integration_name TEXT NOT NULL,

  -- Audit results
  status TEXT NOT NULL CHECK (status IN ('active', 'inactive', 'error', 'warning')),
  is_valid BOOLEAN NOT NULL DEFAULT false,
  message TEXT NOT NULL,

  -- Performance metrics
  response_time_ms INTEGER,
  data_points INTEGER,

  -- Error tracking
  error_details TEXT,

  -- Timestamps
  checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_audit_log_dealer_id ON integration_audit_log(dealer_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_integration ON integration_audit_log(integration_name);
CREATE INDEX IF NOT EXISTS idx_audit_log_status ON integration_audit_log(status);
CREATE INDEX IF NOT EXISTS idx_audit_log_checked_at ON integration_audit_log(checked_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_dealer_integration ON integration_audit_log(dealer_id, integration_name, checked_at DESC);

-- Row Level Security
ALTER TABLE integration_audit_log ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own audit logs
CREATE POLICY audit_log_select_policy ON integration_audit_log
  FOR SELECT
  USING (
    dealer_id = current_setting('app.current_dealer_id', true)
    OR current_setting('app.user_role', true) = 'admin'
  );

-- Policy: System can insert audit logs
CREATE POLICY audit_log_insert_policy ON integration_audit_log
  FOR INSERT
  WITH CHECK (true);

-- Function to clean up old audit logs (keep last 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM integration_audit_log
  WHERE checked_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Add comment
COMMENT ON TABLE integration_audit_log IS 'Tracks health checks and validation results for dealer integrations';

-- Success message
SELECT 'integration_audit_log table created successfully!' as status;
