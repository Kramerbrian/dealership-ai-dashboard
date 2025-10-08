-- Create external_sources table
CREATE TABLE IF NOT EXISTS external_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  provider VARCHAR(64) NOT NULL, -- "seopowersuite:blog", "google:news", etc.
  url TEXT NOT NULL,
  title TEXT,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  content_hash VARCHAR(64) NOT NULL, -- store only hashes/metadata, not full article
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create geo_signals table
CREATE TABLE IF NOT EXISTS geo_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  source_id UUID REFERENCES external_sources(id) ON DELETE CASCADE NOT NULL,
  -- normalized 0–100 scores
  geo_checklist_score INTEGER NOT NULL CHECK (geo_checklist_score >= 0 AND geo_checklist_score <= 100),
  aio_exposure_pct NUMERIC(5,2) NOT NULL CHECK (aio_exposure_pct >= 0 AND aio_exposure_pct <= 100), -- 0–100
  topical_depth_score INTEGER NOT NULL CHECK (topical_depth_score >= 0 AND topical_depth_score <= 100), -- 0–100
  kg_present BOOLEAN NOT NULL DEFAULT false,
  kg_completeness INTEGER NOT NULL CHECK (kg_completeness >= 0 AND kg_completeness <= 100), -- 0–100
  mention_velocity_4w INTEGER NOT NULL DEFAULT 0, -- count
  extractability_score INTEGER NOT NULL CHECK (extractability_score >= 0 AND extractability_score <= 100), -- 0–100
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_external_sources_tenant_id ON external_sources(tenant_id);
CREATE INDEX IF NOT EXISTS idx_external_sources_provider ON external_sources(provider);
CREATE INDEX IF NOT EXISTS idx_external_sources_fetched_at ON external_sources(fetched_at);
CREATE INDEX IF NOT EXISTS idx_external_sources_content_hash ON external_sources(content_hash);

CREATE INDEX IF NOT EXISTS idx_geo_signals_tenant_id ON geo_signals(tenant_id);
CREATE INDEX IF NOT EXISTS idx_geo_signals_source_id ON geo_signals(source_id);
CREATE INDEX IF NOT EXISTS idx_geo_signals_geo_checklist_score ON geo_signals(geo_checklist_score);
CREATE INDEX IF NOT EXISTS idx_geo_signals_created_at ON geo_signals(created_at);

-- Add RLS policies for multi-tenant security
ALTER TABLE external_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE geo_signals ENABLE ROW LEVEL SECURITY;

-- RLS policies for external_sources
CREATE POLICY "Users can view external_sources for their tenant" ON external_sources
  FOR SELECT USING (tenant_id IN (
    SELECT tenant_id FROM users WHERE clerk_id = auth.jwt() ->> 'sub'
  ));

CREATE POLICY "Users can insert external_sources for their tenant" ON external_sources
  FOR INSERT WITH CHECK (tenant_id IN (
    SELECT tenant_id FROM users WHERE clerk_id = auth.jwt() ->> 'sub'
  ));

CREATE POLICY "Users can update external_sources for their tenant" ON external_sources
  FOR UPDATE USING (tenant_id IN (
    SELECT tenant_id FROM users WHERE clerk_id = auth.jwt() ->> 'sub'
  ));

CREATE POLICY "Users can delete external_sources for their tenant" ON external_sources
  FOR DELETE USING (tenant_id IN (
    SELECT tenant_id FROM users WHERE clerk_id = auth.jwt() ->> 'sub'
  ));

-- RLS policies for geo_signals
CREATE POLICY "Users can view geo_signals for their tenant" ON geo_signals
  FOR SELECT USING (tenant_id IN (
    SELECT tenant_id FROM users WHERE clerk_id = auth.jwt() ->> 'sub'
  ));

CREATE POLICY "Users can insert geo_signals for their tenant" ON geo_signals
  FOR INSERT WITH CHECK (tenant_id IN (
    SELECT tenant_id FROM users WHERE clerk_id = auth.jwt() ->> 'sub'
  ));

CREATE POLICY "Users can update geo_signals for their tenant" ON geo_signals
  FOR UPDATE USING (tenant_id IN (
    SELECT tenant_id FROM users WHERE clerk_id = auth.jwt() ->> 'sub'
  ));

CREATE POLICY "Users can delete geo_signals for their tenant" ON geo_signals
  FOR DELETE USING (tenant_id IN (
    SELECT tenant_id FROM users WHERE clerk_id = auth.jwt() ->> 'sub'
  ));

-- Insert some sample data for testing
INSERT INTO external_sources (tenant_id, provider, url, title, content_hash) VALUES
  ('550e8400-e29b-41d4-a716-446655440000', 'seopowersuite:blog', 'https://example.com/blog/post1', 'SEO Best Practices for Dealerships', 'hash1'),
  ('550e8400-e29b-41d4-a716-446655440000', 'google:news', 'https://news.google.com/article1', 'Local Car Dealership News', 'hash2'),
  ('550e8400-e29b-41d4-a716-446655440000', 'bing:web', 'https://bing.com/result1', 'Dealership Marketing Tips', 'hash3'),
  ('550e8400-e29b-41d4-a716-446655440000', 'yahoo:finance', 'https://finance.yahoo.com/news1', 'Auto Industry Trends', 'hash4')
ON CONFLICT DO NOTHING;

-- Insert sample geo signals data
INSERT INTO geo_signals (tenant_id, source_id, geo_checklist_score, aio_exposure_pct, topical_depth_score, kg_present, kg_completeness, mention_velocity_4w, extractability_score)
SELECT 
  '550e8400-e29b-41d4-a716-446655440000',
  es.id,
  FLOOR(RANDOM() * 40) + 60, -- 60-100
  ROUND((RANDOM() * 30 + 70)::numeric, 2), -- 70-100
  FLOOR(RANDOM() * 35) + 65, -- 65-100
  RANDOM() > 0.3, -- 70% true
  FLOOR(RANDOM() * 25) + 75, -- 75-100
  FLOOR(RANDOM() * 20) + 5, -- 5-25
  FLOOR(RANDOM() * 30) + 70 -- 70-100
FROM external_sources es
WHERE es.tenant_id = '550e8400-e29b-41d4-a716-446655440000'
ON CONFLICT DO NOTHING;
