-- Critical Production Infrastructure
-- Idempotency Keys + Audit Logs

-- 1. Idempotency Keys Table
CREATE TABLE IF NOT EXISTS idempotency_keys (
  key TEXT PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  response JSONB NOT NULL,
  status_code INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '24 hours'
);

CREATE INDEX IF NOT EXISTS idx_idempotency_expires ON idempotency_keys(expires_at);
CREATE INDEX IF NOT EXISTS idx_idempotency_tenant ON idempotency_keys(tenant_id);

COMMENT ON TABLE idempotency_keys IS 'Prevents duplicate operations from webhook replays and retries';
COMMENT ON COLUMN idempotency_keys.key IS 'Unique idempotency key from Idempotency-Key header';
COMMENT ON COLUMN idempotency_keys.expires_at IS 'Keys expire after 24 hours, allowing reuse';

-- 2. Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  request_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_tenant ON audit_logs(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at DESC);

COMMENT ON TABLE audit_logs IS 'Comprehensive audit trail for all tenant actions';
COMMENT ON COLUMN audit_logs.action IS 'Action type: USER_CREATED, DEALERSHIP_UPDATED, SUBSCRIPTION_CANCELED, etc.';
COMMENT ON COLUMN audit_logs.resource IS 'Resource identifier: users/123, dealerships/456, etc.';
COMMENT ON COLUMN audit_logs.metadata IS 'Additional context: changes made, error details, etc.';

-- 3. RLS Policies for Audit Logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Users can only view their own tenant's audit logs
CREATE POLICY audit_logs_tenant_isolation ON audit_logs
  FOR SELECT
  USING (tenant_id = (SELECT tenant_id FROM users WHERE clerk_user_id = auth.uid()));

-- Only service role can insert audit logs
CREATE POLICY audit_logs_service_insert ON audit_logs
  FOR INSERT
  WITH CHECK (true);

-- 4. RLS Policies for Idempotency Keys
ALTER TABLE idempotency_keys ENABLE ROW LEVEL SECURITY;

-- Only service role can access idempotency keys
CREATE POLICY idempotency_keys_service_only ON idempotency_keys
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 5. Cleanup Function for Expired Idempotency Keys
CREATE OR REPLACE FUNCTION cleanup_expired_idempotency_keys()
RETURNS void AS $$
BEGIN
  DELETE FROM idempotency_keys
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION cleanup_expired_idempotency_keys IS 'Removes expired idempotency keys (run daily via cron)';

-- 6. Grant Permissions
GRANT SELECT ON audit_logs TO authenticated;
GRANT ALL ON idempotency_keys TO service_role;
GRANT ALL ON audit_logs TO service_role;
