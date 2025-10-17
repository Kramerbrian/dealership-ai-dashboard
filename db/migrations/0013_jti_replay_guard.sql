-- JTI replay guard for JWT security
CREATE TABLE IF NOT EXISTS jwt_jti_seen (
  jti text PRIMARY KEY,
  seen_at timestamptz NOT NULL DEFAULT now()
);

-- Index for cleanup of old JTIs
CREATE INDEX IF NOT EXISTS idx_jwt_jti_seen_at ON jwt_jti_seen(seen_at);

-- Cleanup function for old JTIs (older than 24 hours)
CREATE OR REPLACE FUNCTION cleanup_old_jtis() RETURNS void AS $$
BEGIN
  DELETE FROM jwt_jti_seen WHERE seen_at < now() - interval '24 hours';
END;
$$ LANGUAGE plpgsql;

-- Tenant webhook secrets table
CREATE TABLE IF NOT EXISTS tenant_webhook_secrets (
  tenant_id uuid PRIMARY KEY,
  secret text NOT NULL,
  rotated_at timestamptz NOT NULL DEFAULT now()
);

-- RLS for webhook secrets
ALTER TABLE tenant_webhook_secrets ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY tenant_webhook_secrets_tenant_select ON tenant_webhook_secrets FOR SELECT
  USING (tenant_id = current_setting('app.tenant')::uuid);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY tenant_webhook_secrets_tenant_insert ON tenant_webhook_secrets FOR INSERT
  WITH CHECK (tenant_id = current_setting('app.tenant')::uuid);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY tenant_webhook_secrets_tenant_update ON tenant_webhook_secrets FOR UPDATE
  USING (tenant_id = current_setting('app.tenant')::uuid)
  WITH CHECK (tenant_id = current_setting('app.tenant')::uuid);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
