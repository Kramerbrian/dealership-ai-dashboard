-- Offer Integrity Audits for Dishonest Pricing Compliance
-- DealershipAI - Google Compliance & Risk Management

CREATE TABLE IF NOT EXISTS offer_integrity_audits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  vin text,
  vdp_url text,
  engine text,                               -- chatgpt/gemini/perplexity
  advertised_price numeric(12,2),
  engine_price numeric(12,2),
  otd_price_engine numeric(12,2),
  delta_price numeric(12,2),
  undisclosed_fees jsonb,                    -- [{code, label, est_usd}]
  severity int,                              -- 1=low,2=med,3=high
  rule text,                                 -- PRICE_DELTA, UNDISCLOSED_FEE, STRIKETHROUGH_ABUSE
  details jsonb,
  status text DEFAULT 'open',                -- open, resolved, false_positive
  resolved_at timestamptz,
  resolved_by uuid,
  resolution_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_offer_integrity_tenant ON offer_integrity_audits(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_offer_integrity_vin ON offer_integrity_audits(vin);
CREATE INDEX IF NOT EXISTS idx_offer_integrity_severity ON offer_integrity_audits(severity, status);
CREATE INDEX IF NOT EXISTS idx_offer_integrity_engine ON offer_integrity_audits(engine);

-- Enable RLS
ALTER TABLE offer_integrity_audits ENABLE ROW LEVEL SECURITY;

-- Create policies for multi-tenant access
DO $$ 
BEGIN
  CREATE POLICY offer_integrity_tenant_select ON offer_integrity_audits 
    FOR SELECT USING (tenant_id = current_setting('app.tenant')::uuid);
EXCEPTION 
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ 
BEGIN
  CREATE POLICY offer_integrity_tenant_insert ON offer_integrity_audits 
    FOR INSERT WITH CHECK (tenant_id = current_setting('app.tenant')::uuid);
EXCEPTION 
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ 
BEGIN
  CREATE POLICY offer_integrity_tenant_update ON offer_integrity_audits 
    FOR UPDATE USING (tenant_id = current_setting('app.tenant')::uuid)
    WITH CHECK (tenant_id = current_setting('app.tenant')::uuid);
EXCEPTION 
  WHEN duplicate_object THEN NULL;
END $$;

-- Create updated_at trigger
DO $$ 
BEGIN
  CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$ 
  BEGIN 
    NEW.updated_at = now(); 
    RETURN NEW; 
  END; 
  $$ LANGUAGE plpgsql;
END $$;

DO $$ 
BEGIN
  DROP TRIGGER IF EXISTS trg_offer_integrity_updated_at ON offer_integrity_audits;
  CREATE TRIGGER trg_offer_integrity_updated_at 
    BEFORE UPDATE ON offer_integrity_audits 
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
END $$;