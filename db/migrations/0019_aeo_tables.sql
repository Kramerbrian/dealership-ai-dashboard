-- AEO (AI Engine Overview) Tables
CREATE TABLE IF NOT EXISTS aeo_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  run_date date NOT NULL DEFAULT CURRENT_DATE,
  total_queries integer NOT NULL DEFAULT 0,
  aeo_impression_rate decimal(5,2),
  ours_first_rate decimal(5,2),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, run_date)
);

CREATE TABLE IF NOT EXISTS aeo_queries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id uuid NOT NULL REFERENCES aeo_runs(id) ON DELETE CASCADE,
  query text NOT NULL,
  surface_type text CHECK (surface_type IN ('aeo', 'fs', 'paa', 'local', 'none')),
  aeo_present boolean NOT NULL DEFAULT false,
  fs boolean NOT NULL DEFAULT false,
  paa boolean NOT NULL DEFAULT false,
  local_pack boolean NOT NULL DEFAULT false,
  first_dealer_domain text,
  ours_first boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS Policies
ALTER TABLE aeo_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE aeo_queries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own AEO runs" ON aeo_runs
  FOR SELECT USING (tenant_id = auth.jwt() ->> 'tenant_id'::text);

CREATE POLICY "Users can insert their own AEO runs" ON aeo_runs
  FOR INSERT WITH CHECK (tenant_id = auth.jwt() ->> 'tenant_id'::text);

CREATE POLICY "Users can view their own AEO queries" ON aeo_queries
  FOR SELECT USING (
    run_id IN (
      SELECT id FROM aeo_runs 
      WHERE tenant_id = auth.jwt() ->> 'tenant_id'::text
    )
  );

CREATE POLICY "Users can insert their own AEO queries" ON aeo_queries
  FOR INSERT WITH CHECK (
    run_id IN (
      SELECT id FROM aeo_runs 
      WHERE tenant_id = auth.jwt() ->> 'tenant_id'::text
    )
  );

-- Indexes
CREATE INDEX idx_aeo_runs_tenant_date ON aeo_runs(tenant_id, run_date);
CREATE INDEX idx_aeo_queries_run_id ON aeo_queries(run_id);
CREATE INDEX idx_aeo_queries_surface_type ON aeo_queries(surface_type);
