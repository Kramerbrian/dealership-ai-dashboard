-- AEO Base Tables Migration
-- Creates the foundation tables for Answer Engine Optimization tracking

-- Table for AEO run metadata
CREATE TABLE IF NOT EXISTS aeo_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  run_date date NOT NULL,
  run_timestamp timestamptz DEFAULT now(),
  total_queries int DEFAULT 0,
  queries_with_surfaces int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table for individual AEO query results
CREATE TABLE IF NOT EXISTS aeo_queries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id uuid NOT NULL REFERENCES aeo_runs(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL,
  query_text text NOT NULL,
  query_hash text NOT NULL, -- For deduplication
  
  -- Answer surface presence flags
  aeo_present boolean DEFAULT false,
  fs boolean DEFAULT false, -- Featured Snippets
  paa boolean DEFAULT false, -- People Also Ask
  local_pack boolean DEFAULT false,
  surface_type text, -- 'aeo', 'fs', 'paa', 'local', 'none'
  
  -- Domain tracking
  first_dealer_domain text,
  ours_first boolean DEFAULT false,
  
  -- Additional metadata
  search_engine text DEFAULT 'google',
  location text,
  device_type text DEFAULT 'desktop',
  
  created_at timestamptz DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_aeo_runs_tenant_date ON aeo_runs(tenant_id, run_date DESC);
CREATE INDEX IF NOT EXISTS idx_aeo_queries_run_id ON aeo_queries(run_id);
CREATE INDEX IF NOT EXISTS idx_aeo_queries_tenant_hash ON aeo_queries(tenant_id, query_hash);
CREATE INDEX IF NOT EXISTS idx_aeo_queries_surface_type ON aeo_queries(surface_type);
CREATE INDEX IF NOT EXISTS idx_aeo_queries_domain ON aeo_queries(first_dealer_domain);

-- RLS (Row Level Security) policies
ALTER TABLE aeo_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE aeo_queries ENABLE ROW LEVEL SECURITY;

-- RLS policies for tenant isolation
CREATE POLICY "Users can view their own tenant's aeo_runs" ON aeo_runs
  FOR SELECT USING (tenant_id = auth.jwt() ->> 'tenant_id'::text);

CREATE POLICY "Users can view their own tenant's aeo_queries" ON aeo_queries
  FOR SELECT USING (tenant_id = auth.jwt() ->> 'tenant_id'::text);

-- Update trigger for aeo_runs
CREATE OR REPLACE FUNCTION update_aeo_runs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_aeo_runs_updated_at
  BEFORE UPDATE ON aeo_runs
  FOR EACH ROW
  EXECUTE FUNCTION update_aeo_runs_updated_at();
