-- Competitor Tracking System
-- Stores competitor information and comparative analytics

-- Competitors table
CREATE TABLE IF NOT EXISTS competitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id TEXT NOT NULL,

  -- Competitor info
  competitor_name TEXT NOT NULL,
  competitor_domain TEXT NOT NULL,
  competitor_url TEXT NOT NULL,

  -- Location data
  city TEXT,
  state TEXT,
  distance_miles INTEGER,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),

  -- Contact info
  phone TEXT,
  address TEXT,

  -- Latest scan results
  last_scanned_at TIMESTAMPTZ,
  schema_coverage INTEGER CHECK (schema_coverage >= 0 AND schema_coverage <= 100),
  eeat_score INTEGER CHECK (eeat_score >= 0 AND eeat_score <= 100),
  ai_visibility_score INTEGER CHECK (ai_visibility_score >= 0 AND ai_visibility_score <= 100),

  -- Status tracking
  status TEXT CHECK (status IN ('active', 'inactive', 'pending')) DEFAULT 'active',
  scan_status TEXT CHECK (scan_status IN ('success', 'failed', 'pending')) DEFAULT 'pending',

  -- Additional data
  notes TEXT,
  tags JSONB DEFAULT '[]'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Competitor scan history (tracks changes over time)
CREATE TABLE IF NOT EXISTS competitor_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competitor_id UUID NOT NULL REFERENCES competitors(id) ON DELETE CASCADE,

  -- Scan results
  schema_coverage INTEGER NOT NULL CHECK (schema_coverage >= 0 AND schema_coverage <= 100),
  eeat_score INTEGER NOT NULL CHECK (eeat_score >= 0 AND eeat_score <= 100),
  ai_visibility_score INTEGER CHECK (ai_visibility_score >= 0 AND ai_visibility_score <= 100),

  -- Detailed metrics
  schema_types JSONB DEFAULT '[]'::jsonb,
  missing_schema_types JSONB DEFAULT '[]'::jsonb,
  eeat_signals JSONB,
  ai_platform_scores JSONB,

  -- Scan metadata
  scan_duration_ms INTEGER,
  pages_scanned INTEGER DEFAULT 0,

  -- Timestamps
  scanned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_competitors_dealer ON competitors(dealer_id);
CREATE INDEX IF NOT EXISTS idx_competitors_domain ON competitors(competitor_domain);
CREATE INDEX IF NOT EXISTS idx_competitors_city_state ON competitors(city, state);
CREATE INDEX IF NOT EXISTS idx_competitors_last_scan ON competitors(last_scanned_at DESC);
CREATE INDEX IF NOT EXISTS idx_competitor_scans_competitor ON competitor_scans(competitor_id);
CREATE INDEX IF NOT EXISTS idx_competitor_scans_created ON competitor_scans(created_at DESC);

-- View: Latest competitor data with rankings
CREATE OR REPLACE VIEW competitor_rankings AS
WITH latest_scans AS (
  SELECT DISTINCT ON (c.id)
    c.id as competitor_id,
    c.dealer_id,
    c.competitor_name,
    c.competitor_domain,
    c.schema_coverage,
    c.eeat_score,
    c.ai_visibility_score,
    c.last_scanned_at,
    c.status
  FROM competitors c
  WHERE c.status = 'active'
  ORDER BY c.id, c.last_scanned_at DESC
),
ranked AS (
  SELECT
    *,
    ROW_NUMBER() OVER (PARTITION BY dealer_id ORDER BY schema_coverage DESC) as schema_rank,
    ROW_NUMBER() OVER (PARTITION BY dealer_id ORDER BY eeat_score DESC) as eeat_rank,
    ROW_NUMBER() OVER (PARTITION BY dealer_id ORDER BY ai_visibility_score DESC) as ai_rank
  FROM latest_scans
)
SELECT
  competitor_id,
  dealer_id,
  competitor_name,
  competitor_domain,
  schema_coverage,
  eeat_score,
  ai_visibility_score,
  schema_rank,
  eeat_rank,
  ai_rank,
  ROUND((schema_rank::numeric + eeat_rank::numeric + ai_rank::numeric) / 3, 1) as overall_rank,
  last_scanned_at,
  status
FROM ranked;

-- View: Competitive gap analysis
CREATE OR REPLACE VIEW competitive_gaps AS
WITH dealer_scores AS (
  SELECT DISTINCT ON (dealer_id)
    dealer_id,
    schema_coverage as dealer_schema,
    eeat_score as dealer_eeat,
    created_at
  FROM schema_scans
  ORDER BY dealer_id, created_at DESC
),
competitor_avg AS (
  SELECT
    dealer_id,
    AVG(schema_coverage) as avg_competitor_schema,
    AVG(eeat_score) as avg_competitor_eeat,
    MAX(schema_coverage) as max_competitor_schema,
    MAX(eeat_score) as max_competitor_eeat,
    COUNT(*) as total_competitors
  FROM competitors
  WHERE status = 'active' AND schema_coverage IS NOT NULL
  GROUP BY dealer_id
)
SELECT
  d.dealer_id,
  d.dealer_schema,
  d.dealer_eeat,
  c.avg_competitor_schema,
  c.avg_competitor_eeat,
  c.max_competitor_schema,
  c.max_competitor_eeat,
  c.total_competitors,
  -- Gap calculations
  (d.dealer_schema - c.avg_competitor_schema) as schema_gap_vs_avg,
  (d.dealer_eeat - c.avg_competitor_eeat) as eeat_gap_vs_avg,
  (d.dealer_schema - c.max_competitor_schema) as schema_gap_vs_best,
  (d.dealer_eeat - c.max_competitor_eeat) as eeat_gap_vs_best,
  -- Position indicators
  CASE
    WHEN d.dealer_schema > c.max_competitor_schema THEN 'leading'
    WHEN d.dealer_schema >= c.avg_competitor_schema THEN 'above_average'
    WHEN d.dealer_schema >= (c.avg_competitor_schema * 0.9) THEN 'competitive'
    ELSE 'lagging'
  END as market_position
FROM dealer_scores d
LEFT JOIN competitor_avg c ON c.dealer_id = d.dealer_id;

-- Function: Get competitor comparison for dealer
CREATE OR REPLACE FUNCTION get_competitor_comparison(p_dealer_id TEXT)
RETURNS TABLE (
  your_schema_coverage INTEGER,
  your_eeat_score INTEGER,
  your_ai_visibility INTEGER,
  avg_competitor_schema DECIMAL,
  avg_competitor_eeat DECIMAL,
  avg_competitor_ai DECIMAL,
  best_competitor_schema INTEGER,
  best_competitor_eeat INTEGER,
  best_competitor_ai INTEGER,
  your_schema_rank INTEGER,
  your_eeat_rank INTEGER,
  your_ai_rank INTEGER,
  total_competitors INTEGER,
  market_position TEXT
) AS $$
BEGIN
  RETURN QUERY
  WITH dealer_latest AS (
    SELECT DISTINCT ON (dealer_id)
      dealer_id,
      schema_coverage,
      eeat_score,
      0 as ai_visibility_score -- Placeholder; join with AI visibility table if needed
    FROM schema_scans
    WHERE dealer_id = p_dealer_id
    ORDER BY dealer_id, created_at DESC
  ),
  competitor_stats AS (
    SELECT
      AVG(schema_coverage)::DECIMAL as avg_schema,
      AVG(eeat_score)::DECIMAL as avg_eeat,
      AVG(ai_visibility_score)::DECIMAL as avg_ai,
      MAX(schema_coverage) as max_schema,
      MAX(eeat_score) as max_eeat,
      MAX(ai_visibility_score) as max_ai,
      COUNT(*) as total
    FROM competitors
    WHERE dealer_id = p_dealer_id AND status = 'active'
  ),
  rankings AS (
    SELECT
      COALESCE(
        (SELECT COUNT(*) + 1 FROM competitors
         WHERE dealer_id = p_dealer_id
         AND status = 'active'
         AND schema_coverage > (SELECT schema_coverage FROM dealer_latest)),
        1
      ) as schema_rank,
      COALESCE(
        (SELECT COUNT(*) + 1 FROM competitors
         WHERE dealer_id = p_dealer_id
         AND status = 'active'
         AND eeat_score > (SELECT eeat_score FROM dealer_latest)),
        1
      ) as eeat_rank,
      1 as ai_rank -- Placeholder
  )
  SELECT
    d.schema_coverage::INTEGER,
    d.eeat_score::INTEGER,
    d.ai_visibility_score::INTEGER,
    cs.avg_schema,
    cs.avg_eeat,
    cs.avg_ai,
    cs.max_schema::INTEGER,
    cs.max_eeat::INTEGER,
    cs.max_ai::INTEGER,
    r.schema_rank::INTEGER,
    r.eeat_rank::INTEGER,
    r.ai_rank::INTEGER,
    cs.total::INTEGER,
    CASE
      WHEN d.schema_coverage > cs.max_schema THEN 'Market Leader'
      WHEN d.schema_coverage >= cs.avg_schema THEN 'Above Average'
      WHEN d.schema_coverage >= (cs.avg_schema * 0.9) THEN 'Competitive'
      ELSE 'Below Average'
    END::TEXT
  FROM dealer_latest d
  CROSS JOIN competitor_stats cs
  CROSS JOIN rankings r;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Auto-discover competitors in same market
CREATE OR REPLACE FUNCTION discover_local_competitors(
  p_dealer_id TEXT,
  p_city TEXT,
  p_state TEXT,
  p_max_distance_miles INTEGER DEFAULT 25
)
RETURNS TABLE (
  suggested_domain TEXT,
  suggested_name TEXT,
  estimated_distance INTEGER
) AS $$
BEGIN
  -- This is a placeholder for actual competitor discovery logic
  -- In production, this would integrate with Google Places API, Yelp, etc.
  RETURN QUERY
  SELECT
    'competitor-example.com'::TEXT as suggested_domain,
    'Example Competitor Dealership'::TEXT as suggested_name,
    10::INTEGER as estimated_distance
  LIMIT 0; -- Return empty set for now
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_competitors_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER competitors_updated_at
  BEFORE UPDATE ON competitors
  FOR EACH ROW
  EXECUTE FUNCTION update_competitors_updated_at();

-- Row Level Security (RLS)
ALTER TABLE competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitor_scans ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own dealer's competitors
CREATE POLICY competitors_select ON competitors
  FOR SELECT
  USING (
    dealer_id = current_setting('app.current_dealer_id', true)
    OR current_setting('app.is_admin', true)::boolean = true
  );

-- Policy: Users can manage their own competitors
CREATE POLICY competitors_insert ON competitors
  FOR INSERT
  WITH CHECK (
    dealer_id = current_setting('app.current_dealer_id', true)
    OR current_setting('app.is_admin', true)::boolean = true
  );

CREATE POLICY competitors_update ON competitors
  FOR UPDATE
  USING (
    dealer_id = current_setting('app.current_dealer_id', true)
    OR current_setting('app.is_admin', true)::boolean = true
  );

CREATE POLICY competitors_delete ON competitors
  FOR DELETE
  USING (
    dealer_id = current_setting('app.current_dealer_id', true)
    OR current_setting('app.is_admin', true)::boolean = true
  );

-- Policy: Users can view their competitors' scan history
CREATE POLICY competitor_scans_select ON competitor_scans
  FOR SELECT
  USING (
    competitor_id IN (
      SELECT id FROM competitors
      WHERE dealer_id = current_setting('app.current_dealer_id', true)
    )
    OR current_setting('app.is_admin', true)::boolean = true
  );

-- Policy: Service role can insert scan history
CREATE POLICY competitor_scans_insert ON competitor_scans
  FOR INSERT
  WITH CHECK (true);

-- Sample data for demo tenant
INSERT INTO competitors (
  dealer_id,
  competitor_name,
  competitor_domain,
  competitor_url,
  city,
  state,
  distance_miles,
  schema_coverage,
  eeat_score,
  ai_visibility_score,
  last_scanned_at,
  scan_status,
  status
) VALUES
  -- Competitor 1: Strong performer
  (
    'demo-tenant',
    'Prime Auto Group',
    'primeautogroup.com',
    'https://primeautogroup.com',
    'Naples',
    'FL',
    5,
    98,
    94,
    89,
    NOW() - INTERVAL '2 hours',
    'success',
    'active'
  ),
  -- Competitor 2: Average performer
  (
    'demo-tenant',
    'Sunshine Motors',
    'sunshinemotors.com',
    'https://sunshinemotors.com',
    'Naples',
    'FL',
    8,
    85,
    82,
    78,
    NOW() - INTERVAL '3 hours',
    'success',
    'active'
  ),
  -- Competitor 3: Below average
  (
    'demo-tenant',
    'Coastal Automotive',
    'coastalautomotive.com',
    'https://coastalautomotive.com',
    'Naples',
    'FL',
    12,
    72,
    68,
    65,
    NOW() - INTERVAL '4 hours',
    'success',
    'active'
  );

-- Insert historical scan data for competitors
INSERT INTO competitor_scans (
  competitor_id,
  schema_coverage,
  eeat_score,
  ai_visibility_score,
  schema_types,
  missing_schema_types,
  pages_scanned,
  scan_duration_ms,
  scanned_at
) VALUES
  -- Prime Auto Group (improving over time)
  (
    (SELECT id FROM competitors WHERE competitor_domain = 'primeautogroup.com' LIMIT 1),
    95,
    92,
    87,
    '["LocalBusiness", "Product", "Review", "FAQPage", "BreadcrumbList"]'::jsonb,
    '["Organization"]'::jsonb,
    10,
    2800,
    NOW() - INTERVAL '7 days'
  ),
  (
    (SELECT id FROM competitors WHERE competitor_domain = 'primeautogroup.com' LIMIT 1),
    98,
    94,
    89,
    '["LocalBusiness", "Product", "Review", "FAQPage", "BreadcrumbList", "Organization"]'::jsonb,
    '[]'::jsonb,
    10,
    2650,
    NOW() - INTERVAL '2 hours'
  );

-- Grant permissions
GRANT SELECT ON competitors TO anon, authenticated;
GRANT SELECT ON competitor_scans TO anon, authenticated;
GRANT SELECT ON competitor_rankings TO anon, authenticated;
GRANT SELECT ON competitive_gaps TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_competitor_comparison TO anon, authenticated;
GRANT EXECUTE ON FUNCTION discover_local_competitors TO anon, authenticated;

-- Comments for documentation
COMMENT ON TABLE competitors IS 'Stores competitor dealership information and latest scan results';
COMMENT ON TABLE competitor_scans IS 'Historical scan data for competitors to track changes over time';
COMMENT ON VIEW competitor_rankings IS 'Rankings of competitors by schema, E-E-A-T, and AI visibility scores';
COMMENT ON VIEW competitive_gaps IS 'Gap analysis comparing dealer performance vs competitors';
COMMENT ON FUNCTION get_competitor_comparison IS 'Returns comprehensive comparison of dealer vs competitors';
COMMENT ON FUNCTION discover_local_competitors IS 'Auto-discovers potential competitors in the same market';
