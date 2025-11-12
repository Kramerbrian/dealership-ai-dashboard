/**
 * Schema Scan History Tables
 *
 * Stores historical schema scan results for trend analysis and tracking.
 */

-- Create schema_scans table for storing scan results
CREATE TABLE IF NOT EXISTS schema_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id TEXT NOT NULL,
  domain TEXT NOT NULL,
  schema_coverage INTEGER NOT NULL CHECK (schema_coverage >= 0 AND schema_coverage <= 100),
  eeat_score INTEGER NOT NULL CHECK (eeat_score >= 0 AND eeat_score <= 100),
  status TEXT NOT NULL CHECK (status IN ('healthy', 'warning', 'critical')),
  eeat_signals JSONB NOT NULL,
  recommendations JSONB,
  schema_types JSONB,
  missing_schema_types JSONB,
  pages_scanned INTEGER NOT NULL DEFAULT 0,
  pages_with_schema INTEGER NOT NULL DEFAULT 0,
  total_pages INTEGER NOT NULL DEFAULT 0,
  scan_duration_ms INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_schema_scans_dealer_id ON schema_scans(dealer_id);
CREATE INDEX IF NOT EXISTS idx_schema_scans_domain ON schema_scans(domain);
CREATE INDEX IF NOT EXISTS idx_schema_scans_created_at ON schema_scans(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_schema_scans_dealer_created ON schema_scans(dealer_id, created_at DESC);

-- Create schema_scan_pages table for per-page details
CREATE TABLE IF NOT EXISTS schema_scan_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id UUID NOT NULL REFERENCES schema_scans(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  has_schema BOOLEAN NOT NULL DEFAULT FALSE,
  schema_types JSONB,
  schemas JSONB,
  errors JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for scan_id
CREATE INDEX IF NOT EXISTS idx_schema_scan_pages_scan_id ON schema_scan_pages(scan_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for auto-updating updated_at
CREATE TRIGGER update_schema_scans_updated_at BEFORE UPDATE ON schema_scans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create view for latest scans per dealer
CREATE OR REPLACE VIEW latest_schema_scans AS
SELECT DISTINCT ON (dealer_id)
  id,
  dealer_id,
  domain,
  schema_coverage,
  eeat_score,
  status,
  eeat_signals,
  recommendations,
  schema_types,
  missing_schema_types,
  pages_scanned,
  pages_with_schema,
  total_pages,
  scan_duration_ms,
  created_at,
  updated_at
FROM schema_scans
ORDER BY dealer_id, created_at DESC;

-- Create view for trend calculation
CREATE OR REPLACE VIEW schema_scan_trends AS
SELECT
  dealer_id,
  domain,

  -- Latest scan
  MAX(schema_coverage) FILTER (WHERE rn = 1) as latest_coverage,
  MAX(eeat_score) FILTER (WHERE rn = 1) as latest_eeat,
  MAX(created_at) FILTER (WHERE rn = 1) as latest_scan_date,

  -- Previous scan
  MAX(schema_coverage) FILTER (WHERE rn = 2) as previous_coverage,
  MAX(eeat_score) FILTER (WHERE rn = 2) as previous_eeat,
  MAX(created_at) FILTER (WHERE rn = 2) as previous_scan_date,

  -- Trend calculations
  CASE
    WHEN MAX(schema_coverage) FILTER (WHERE rn = 1) > MAX(schema_coverage) FILTER (WHERE rn = 2) THEN 'up'
    WHEN MAX(schema_coverage) FILTER (WHERE rn = 1) < MAX(schema_coverage) FILTER (WHERE rn = 2) THEN 'down'
    ELSE 'stable'
  END as coverage_trend,

  CASE
    WHEN MAX(eeat_score) FILTER (WHERE rn = 1) > MAX(eeat_score) FILTER (WHERE rn = 2) THEN 'up'
    WHEN MAX(eeat_score) FILTER (WHERE rn = 1) < MAX(eeat_score) FILTER (WHERE rn = 2) THEN 'down'
    ELSE 'stable'
  END as eeat_trend

FROM (
  SELECT
    *,
    ROW_NUMBER() OVER (PARTITION BY dealer_id ORDER BY created_at DESC) as rn
  FROM schema_scans
) ranked
WHERE rn <= 2
GROUP BY dealer_id, domain;

-- Add RLS (Row Level Security) policies
ALTER TABLE schema_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE schema_scan_pages ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own dealer's scans
CREATE POLICY "Users can read own dealer scans" ON schema_scans
  FOR SELECT
  USING (auth.jwt() ->> 'dealerId' = dealer_id OR auth.jwt() ->> 'role' = 'admin');

-- Policy: Service role can insert scans
CREATE POLICY "Service can insert scans" ON schema_scans
  FOR INSERT
  WITH CHECK (true);

-- Policy: Users can read their own scan pages
CREATE POLICY "Users can read own scan pages" ON schema_scan_pages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM schema_scans
      WHERE schema_scans.id = schema_scan_pages.scan_id
      AND (auth.jwt() ->> 'dealerId' = schema_scans.dealer_id OR auth.jwt() ->> 'role' = 'admin')
    )
  );

-- Policy: Service role can insert scan pages
CREATE POLICY "Service can insert scan pages" ON schema_scan_pages
  FOR INSERT
  WITH CHECK (true);

-- Create function to get latest scan for a dealer
CREATE OR REPLACE FUNCTION get_latest_scan(p_dealer_id TEXT)
RETURNS TABLE (
  id UUID,
  dealer_id TEXT,
  domain TEXT,
  schema_coverage INTEGER,
  eeat_score INTEGER,
  status TEXT,
  eeat_signals JSONB,
  recommendations JSONB,
  schema_types JSONB,
  missing_schema_types JSONB,
  coverage_trend TEXT,
  eeat_trend TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id,
    s.dealer_id,
    s.domain,
    s.schema_coverage,
    s.eeat_score,
    s.status,
    s.eeat_signals,
    s.recommendations,
    s.schema_types,
    s.missing_schema_types,
    t.coverage_trend::TEXT,
    t.eeat_trend::TEXT,
    s.created_at
  FROM schema_scans s
  LEFT JOIN schema_scan_trends t ON t.dealer_id = s.dealer_id
  WHERE s.dealer_id = p_dealer_id
  ORDER BY s.created_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to calculate average scores over time period
CREATE OR REPLACE FUNCTION get_scan_stats(p_dealer_id TEXT, p_days INTEGER DEFAULT 30)
RETURNS TABLE (
  avg_coverage NUMERIC,
  avg_eeat NUMERIC,
  min_coverage INTEGER,
  max_coverage INTEGER,
  min_eeat INTEGER,
  max_eeat INTEGER,
  scan_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    AVG(schema_coverage)::NUMERIC(5,2) as avg_coverage,
    AVG(eeat_score)::NUMERIC(5,2) as avg_eeat,
    MIN(schema_coverage) as min_coverage,
    MAX(schema_coverage) as max_coverage,
    MIN(eeat_score) as min_eeat,
    MAX(eeat_score) as max_eeat,
    COUNT(*)::BIGINT as scan_count
  FROM schema_scans
  WHERE dealer_id = p_dealer_id
    AND created_at >= NOW() - (p_days || ' days')::INTERVAL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT SELECT ON schema_scans TO anon, authenticated;
GRANT SELECT ON schema_scan_pages TO anon, authenticated;
GRANT SELECT ON latest_schema_scans TO anon, authenticated;
GRANT SELECT ON schema_scan_trends TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_latest_scan(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_scan_stats(TEXT, INTEGER) TO anon, authenticated;

-- Insert sample data for testing
INSERT INTO schema_scans (
  dealer_id,
  domain,
  schema_coverage,
  eeat_score,
  status,
  eeat_signals,
  recommendations,
  schema_types,
  missing_schema_types,
  pages_scanned,
  pages_with_schema,
  total_pages,
  created_at
) VALUES
  (
    'demo-tenant',
    'dealershipai.com',
    92,
    88,
    'healthy',
    '{"experience": 90, "expertise": 86, "authoritativeness": 89, "trustworthiness": 88}'::JSONB,
    '["Add BreadcrumbList schema to all pages"]'::JSONB,
    '["LocalBusiness", "Organization", "WebSite", "FAQPage", "HowTo", "SoftwareApplication"]'::JSONB,
    '["Product", "Review"]'::JSONB,
    10,
    9,
    10,
    NOW() - INTERVAL '1 day'
  ),
  (
    'demo-tenant',
    'dealershipai.com',
    95,
    91,
    'healthy',
    '{"experience": 93, "expertise": 89, "authoritativeness": 92, "trustworthiness": 91}'::JSONB,
    '[]'::JSONB,
    '["LocalBusiness", "Organization", "WebSite", "FAQPage", "HowTo", "SoftwareApplication", "BreadcrumbList"]'::JSONB,
    '["Product", "Review"]'::JSONB,
    10,
    10,
    10,
    NOW()
  );

COMMENT ON TABLE schema_scans IS 'Stores historical schema scan results for tracking trends and improvements';
COMMENT ON TABLE schema_scan_pages IS 'Stores per-page schema scan details';
COMMENT ON VIEW latest_schema_scans IS 'Shows the most recent scan for each dealer';
COMMENT ON VIEW schema_scan_trends IS 'Calculates trends by comparing latest two scans';
COMMENT ON FUNCTION get_latest_scan(TEXT) IS 'Returns the most recent scan for a dealer with trend information';
COMMENT ON FUNCTION get_scan_stats(TEXT, INTEGER) IS 'Returns statistical aggregates for a dealer over a time period';
