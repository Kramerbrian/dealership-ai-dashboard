-- filename=db/migrations/0006_avi_models.sql
CREATE TABLE IF NOT EXISTS avi_models (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  as_of date NOT NULL,
  window_weeks int NOT NULL DEFAULT 12,
  coef_json jsonb NOT NULL,                -- regression coefficients
  features_json jsonb NOT NULL,            -- feature list + transforms
  r2 numeric(4,3) NOT NULL,
  method text NOT NULL DEFAULT 'ridge',
  regime_state text NOT NULL,              -- 'normal' | 'volatility' | 'shift'
  regime_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, as_of)
);

ALTER TABLE avi_models ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY avi_models_tenant_select ON avi_models FOR SELECT
  USING (tenant_id = current_setting('app.tenant')::uuid);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY avi_models_tenant_ins ON avi_models FOR INSERT
  WITH CHECK (tenant_id = current_setting('app.tenant')::uuid);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;