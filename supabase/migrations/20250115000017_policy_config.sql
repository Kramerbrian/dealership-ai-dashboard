-- Policy Editor: JSON schema, SQL, APIs, UI
-- db/migrations/0017_policy_config.sql

CREATE TABLE IF NOT EXISTS policy_configs (
  tenant_id uuid PRIMARY KEY,
  version int NOT NULL DEFAULT 1,
  config jsonb NOT NULL,
  updated_by uuid,
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS policy_config_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  version int NOT NULL,
  config jsonb NOT NULL,
  updated_by uuid,
  updated_at timestamptz DEFAULT now()
);

CREATE OR REPLACE FUNCTION bump_policy_version()
RETURNS trigger AS $$
BEGIN
  INSERT INTO policy_config_versions(tenant_id, version, config, updated_by, updated_at)
  VALUES (NEW.tenant_id, NEW.version, NEW.config, NEW.updated_by, NEW.updated_at);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_policy_version ON policy_configs;
CREATE TRIGGER trg_policy_version
AFTER INSERT OR UPDATE ON policy_configs
FOR EACH ROW EXECUTE FUNCTION bump_policy_version();

-- RLS policies
ALTER TABLE policy_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE policy_config_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY policy_configs_tenant_isolation ON policy_configs
  FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

CREATE POLICY policy_config_versions_tenant_isolation ON policy_config_versions
  FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_policy_configs_tenant ON policy_configs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_policy_versions_tenant_version ON policy_config_versions(tenant_id, version DESC);
