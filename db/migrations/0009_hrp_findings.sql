-- HRP (Hallucination Risk Prevention) findings and quarantine tables
-- This migration creates tables for tracking AI hallucination risks and implementing quarantine

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS hrp_findings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  as_of timestamptz NOT NULL DEFAULT now(),
  topic text NOT NULL,                       -- e.g., "APR", "Warranty", "Price"
  prompt text NOT NULL,
  llm_output text NOT NULL,
  verifiable boolean NOT NULL DEFAULT false, -- did it cite/confirm facts?
  severity text NOT NULL,                    -- low | medium | high
  score numeric(5,2) NOT NULL,               -- 0..100 hallucination risk
  details_json jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_hrp_findings_tenant_asof ON hrp_findings(tenant_id, as_of DESC);

CREATE TABLE IF NOT EXISTS hrp_quarantine (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  topic text NOT NULL,
  reason text NOT NULL,
  severity text NOT NULL,                     -- high triggers hard block
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_hrp_quarantine_open ON hrp_quarantine(tenant_id, topic) WHERE active=true;

-- Enable Row Level Security
ALTER TABLE hrp_findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE hrp_quarantine ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DO $$ BEGIN
  CREATE POLICY hrp_findings_tenant_sel ON hrp_findings FOR SELECT USING (tenant_id = current_setting('app.tenant')::uuid);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY hrp_findings_tenant_ins ON hrp_findings FOR INSERT WITH CHECK (tenant_id = current_setting('app.tenant')::uuid);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY hrp_quarantine_tenant_sel ON hrp_quarantine FOR SELECT USING (tenant_id = current_setting('app.tenant')::uuid);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY hrp_quarantine_tenant_ins ON hrp_quarantine FOR INSERT WITH CHECK (tenant_id = current_setting('app.tenant')::uuid);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY hrp_quarantine_tenant_upd ON hrp_quarantine FOR UPDATE
  USING (tenant_id = current_setting('app.tenant')::uuid)
  WITH CHECK (tenant_id = current_setting('app.tenant')::uuid);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
