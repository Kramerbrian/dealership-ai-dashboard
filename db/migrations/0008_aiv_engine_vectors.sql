-- AIV Engine Vectors for per-engine bias tracking
CREATE TABLE IF NOT EXISTS aiv_engine_vectors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  as_of date NOT NULL,
  chatgpt_pct numeric(5,2) NOT NULL,
  gemini_pct numeric(5,2) NOT NULL,
  perplexity_pct numeric(5,2) NOT NULL,
  copilot_pct numeric(5,2) NOT NULL,
  iqr_mean_pct numeric(5,2) NOT NULL,        -- consensus
  spread_pct numeric(5,2) NOT NULL,          -- max-min
  created_at timestamptz DEFAULT now(),
  UNIQUE (tenant_id, as_of)
);

-- Enable RLS
ALTER TABLE aiv_engine_vectors ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY aiv_engine_vectors_tenant_select ON aiv_engine_vectors
  FOR SELECT USING (tenant_id = current_setting('app.tenant')::uuid);

CREATE POLICY aiv_engine_vectors_tenant_insert ON aiv_engine_vectors
  FOR INSERT WITH CHECK (tenant_id = current_setting('app.tenant')::uuid);

CREATE POLICY aiv_engine_vectors_tenant_update ON aiv_engine_vectors
  FOR UPDATE USING (tenant_id = current_setting('app.tenant')::uuid);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_aiv_engines_tenant ON aiv_engine_vectors(tenant_id, as_of DESC);
