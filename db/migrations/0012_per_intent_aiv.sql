-- Per-intent AIV tracking with revenue-weighted scoring
CREATE TABLE IF NOT EXISTS aiv_intents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  as_of date NOT NULL,
  sales_pct numeric(5,2) NOT NULL,
  service_pct numeric(5,2) NOT NULL,
  finance_pct numeric(5,2) NOT NULL,
  parts_pct numeric(5,2) NOT NULL,
  weighted_pct numeric(5,2) GENERATED ALWAYS AS
    (LEAST(100, sales_pct*0.5 + service_pct*0.2 + finance_pct*0.2 + parts_pct*0.1)) STORED,
  UNIQUE (tenant_id, as_of)
);

-- Enable RLS
ALTER TABLE aiv_intents ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY aiv_intents_tenant_select ON aiv_intents
  FOR SELECT USING (tenant_id = current_setting('app.tenant')::uuid);

CREATE POLICY aiv_intents_tenant_insert ON aiv_intents
  FOR INSERT WITH CHECK (tenant_id = current_setting('app.tenant')::uuid);

-- Create index
CREATE INDEX IF NOT EXISTS idx_aiv_intents_tenant ON aiv_intents(tenant_id, as_of DESC);
