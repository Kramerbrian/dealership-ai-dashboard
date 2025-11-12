-- Multi-Location Support System
-- Enables dealer groups to manage multiple dealership locations

-- Dealer groups table (parent organizations)
CREATE TABLE IF NOT EXISTS dealer_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Group info
  group_name TEXT NOT NULL,
  group_slug TEXT UNIQUE NOT NULL,

  -- Owner/admin info
  owner_id TEXT NOT NULL, -- Clerk user ID

  -- Group settings
  settings JSONB DEFAULT '{}'::jsonb,

  -- Branding
  logo_url TEXT,
  primary_color TEXT,

  -- Subscription/billing
  plan_tier TEXT CHECK (plan_tier IN ('free', 'pro', 'enterprise')) DEFAULT 'free',
  max_locations INTEGER DEFAULT 1,

  -- Status
  status TEXT CHECK (status IN ('active', 'suspended', 'cancelled')) DEFAULT 'active',

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Dealership locations table (individual dealerships within a group)
CREATE TABLE IF NOT EXISTS dealership_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_group_id UUID NOT NULL REFERENCES dealer_groups(id) ON DELETE CASCADE,

  -- Location identifier (legacy dealer_id compatibility)
  dealer_id TEXT NOT NULL UNIQUE,

  -- Dealership info
  dealership_name TEXT NOT NULL,
  domain TEXT NOT NULL,

  -- Location details
  street_address TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'US',

  -- Geographic coordinates
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),

  -- Contact info
  phone TEXT,
  email TEXT,

  -- Settings (can override group settings)
  settings JSONB DEFAULT '{}'::jsonb,

  -- Latest metrics (cached for performance)
  latest_schema_coverage INTEGER,
  latest_eeat_score INTEGER,
  latest_ai_visibility_score INTEGER,
  last_scanned_at TIMESTAMPTZ,

  -- Status
  status TEXT CHECK (status IN ('active', 'inactive', 'pending')) DEFAULT 'active',

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Location group members (users who can access specific locations)
CREATE TABLE IF NOT EXISTS location_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id UUID NOT NULL REFERENCES dealership_locations(id) ON DELETE CASCADE,

  -- User info
  user_id TEXT NOT NULL, -- Clerk user ID

  -- Access level
  role TEXT CHECK (role IN ('owner', 'admin', 'manager', 'viewer')) DEFAULT 'viewer',

  -- Permissions
  can_edit_settings BOOLEAN DEFAULT FALSE,
  can_view_reports BOOLEAN DEFAULT TRUE,
  can_manage_schema BOOLEAN DEFAULT FALSE,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Unique constraint: one user can only have one role per location
  UNIQUE(location_id, user_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_dealer_groups_owner ON dealer_groups(owner_id);
CREATE INDEX IF NOT EXISTS idx_dealer_groups_slug ON dealer_groups(group_slug);
CREATE INDEX IF NOT EXISTS idx_dealership_locations_group ON dealership_locations(dealer_group_id);
CREATE INDEX IF NOT EXISTS idx_dealership_locations_dealer_id ON dealership_locations(dealer_id);
CREATE INDEX IF NOT EXISTS idx_dealership_locations_city_state ON dealership_locations(city, state);
CREATE INDEX IF NOT EXISTS idx_location_members_location ON location_members(location_id);
CREATE INDEX IF NOT EXISTS idx_location_members_user ON location_members(user_id);

-- Update existing tables to reference dealership_locations

-- Add location reference to schema_scans
ALTER TABLE schema_scans
  ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES dealership_locations(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_schema_scans_location ON schema_scans(location_id);

-- Add location reference to ai_visibility_tests
ALTER TABLE ai_visibility_tests
  ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES dealership_locations(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_ai_visibility_tests_location ON ai_visibility_tests(location_id);

-- Add location reference to competitors
ALTER TABLE competitors
  ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES dealership_locations(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_competitors_location ON competitors(location_id);

-- View: Aggregate metrics across all locations in a group
CREATE OR REPLACE VIEW dealer_group_metrics AS
SELECT
  dg.id as group_id,
  dg.group_name,
  dg.group_slug,

  -- Location counts
  COUNT(dl.id) as total_locations,
  COUNT(dl.id) FILTER (WHERE dl.status = 'active') as active_locations,

  -- Average scores across all locations
  ROUND(AVG(dl.latest_schema_coverage))::INTEGER as avg_schema_coverage,
  ROUND(AVG(dl.latest_eeat_score))::INTEGER as avg_eeat_score,
  ROUND(AVG(dl.latest_ai_visibility_score))::INTEGER as avg_ai_visibility_score,

  -- Best and worst performing locations
  MAX(dl.latest_schema_coverage) as best_schema_coverage,
  MIN(dl.latest_schema_coverage) as worst_schema_coverage,

  -- Geographic spread
  COUNT(DISTINCT dl.state) as states_count,
  COUNT(DISTINCT dl.city) as cities_count,

  -- Last activity
  MAX(dl.last_scanned_at) as last_scan_at,

  dg.created_at,
  dg.status
FROM dealer_groups dg
LEFT JOIN dealership_locations dl ON dl.dealer_group_id = dg.id
GROUP BY dg.id, dg.group_name, dg.group_slug, dg.created_at, dg.status;

-- View: Location performance rankings within group
CREATE OR REPLACE VIEW location_group_rankings AS
WITH location_scores AS (
  SELECT
    dl.id as location_id,
    dl.dealer_group_id,
    dl.dealership_name,
    dl.city,
    dl.state,
    dl.latest_schema_coverage,
    dl.latest_eeat_score,
    dl.latest_ai_visibility_score,
    dl.last_scanned_at,

    -- Rankings within group
    ROW_NUMBER() OVER (PARTITION BY dl.dealer_group_id ORDER BY dl.latest_schema_coverage DESC NULLS LAST) as schema_rank,
    ROW_NUMBER() OVER (PARTITION BY dl.dealer_group_id ORDER BY dl.latest_eeat_score DESC NULLS LAST) as eeat_rank,
    ROW_NUMBER() OVER (PARTITION BY dl.dealer_group_id ORDER BY dl.latest_ai_visibility_score DESC NULLS LAST) as ai_rank
  FROM dealership_locations dl
  WHERE dl.status = 'active'
)
SELECT
  location_id,
  dealer_group_id,
  dealership_name,
  city,
  state,
  latest_schema_coverage,
  latest_eeat_score,
  latest_ai_visibility_score,
  schema_rank,
  eeat_rank,
  ai_rank,
  ROUND((schema_rank::numeric + eeat_rank::numeric + COALESCE(ai_rank, 999)::numeric) / 3, 1) as overall_rank,
  last_scanned_at
FROM location_scores;

-- View: Cross-location consistency checker
CREATE OR REPLACE VIEW location_consistency_analysis AS
WITH location_schemas AS (
  SELECT
    dl.dealer_group_id,
    dl.id as location_id,
    dl.dealership_name,
    ss.schema_types,
    ss.missing_schema_types,
    ss.schema_coverage
  FROM dealership_locations dl
  LEFT JOIN LATERAL (
    SELECT schema_types, missing_schema_types, schema_coverage
    FROM schema_scans
    WHERE dealer_id = dl.dealer_id
    ORDER BY created_at DESC
    LIMIT 1
  ) ss ON true
  WHERE dl.status = 'active'
),
group_schema_union AS (
  SELECT
    dealer_group_id,
    jsonb_agg(DISTINCT schema_type) as all_schema_types_in_group
  FROM location_schemas,
  jsonb_array_elements_text(COALESCE(schema_types, '[]'::jsonb)) as schema_type
  GROUP BY dealer_group_id
)
SELECT
  ls.dealer_group_id,
  ls.location_id,
  ls.dealership_name,
  ls.schema_coverage,

  -- Schemas present in this location
  ls.schema_types,

  -- Schemas missing from this location but present in other group locations
  (
    SELECT jsonb_agg(st)
    FROM jsonb_array_elements_text(gsu.all_schema_types_in_group) st
    WHERE NOT (ls.schema_types ? st)
  ) as missing_vs_group,

  -- Consistency score (percentage of group schemas this location has)
  CASE
    WHEN jsonb_array_length(gsu.all_schema_types_in_group) > 0 THEN
      ROUND(
        (jsonb_array_length(COALESCE(ls.schema_types, '[]'::jsonb))::numeric /
         jsonb_array_length(gsu.all_schema_types_in_group)::numeric) * 100
      )::INTEGER
    ELSE 0
  END as consistency_score
FROM location_schemas ls
JOIN group_schema_union gsu ON gsu.dealer_group_id = ls.dealer_group_id;

-- Function: Get all locations for a dealer group
CREATE OR REPLACE FUNCTION get_group_locations(p_group_id UUID)
RETURNS TABLE (
  location_id UUID,
  dealer_id TEXT,
  dealership_name TEXT,
  city TEXT,
  state TEXT,
  domain TEXT,
  latest_schema_coverage INTEGER,
  latest_eeat_score INTEGER,
  latest_ai_visibility_score INTEGER,
  last_scanned_at TIMESTAMPTZ,
  status TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    dl.id,
    dl.dealer_id,
    dl.dealership_name,
    dl.city,
    dl.state,
    dl.domain,
    dl.latest_schema_coverage,
    dl.latest_eeat_score,
    dl.latest_ai_visibility_score,
    dl.last_scanned_at,
    dl.status
  FROM dealership_locations dl
  WHERE dl.dealer_group_id = p_group_id
  ORDER BY dl.dealership_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get aggregate report for dealer group
CREATE OR REPLACE FUNCTION get_group_aggregate_report(p_group_id UUID)
RETURNS TABLE (
  group_name TEXT,
  total_locations INTEGER,
  active_locations INTEGER,
  avg_schema_coverage INTEGER,
  avg_eeat_score INTEGER,
  avg_ai_visibility_score INTEGER,
  best_performing_location TEXT,
  worst_performing_location TEXT,
  total_competitors_tracked INTEGER,
  last_scan_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  WITH metrics AS (
    SELECT
      dg.group_name,
      COUNT(dl.id)::INTEGER as total_locations,
      COUNT(dl.id) FILTER (WHERE dl.status = 'active')::INTEGER as active_locations,
      ROUND(AVG(dl.latest_schema_coverage))::INTEGER as avg_schema_coverage,
      ROUND(AVG(dl.latest_eeat_score))::INTEGER as avg_eeat_score,
      ROUND(AVG(dl.latest_ai_visibility_score))::INTEGER as avg_ai_visibility_score,
      MAX(dl.last_scanned_at) as last_scan_at
    FROM dealer_groups dg
    LEFT JOIN dealership_locations dl ON dl.dealer_group_id = dg.id
    WHERE dg.id = p_group_id
    GROUP BY dg.group_name
  ),
  best_location AS (
    SELECT dealership_name
    FROM dealership_locations
    WHERE dealer_group_id = p_group_id
    ORDER BY latest_schema_coverage DESC NULLS LAST
    LIMIT 1
  ),
  worst_location AS (
    SELECT dealership_name
    FROM dealership_locations
    WHERE dealer_group_id = p_group_id AND latest_schema_coverage IS NOT NULL
    ORDER BY latest_schema_coverage ASC
    LIMIT 1
  ),
  competitor_count AS (
    SELECT COUNT(*)::INTEGER as total
    FROM competitors c
    WHERE c.location_id IN (
      SELECT id FROM dealership_locations WHERE dealer_group_id = p_group_id
    )
  )
  SELECT
    m.group_name::TEXT,
    m.total_locations,
    m.active_locations,
    m.avg_schema_coverage,
    m.avg_eeat_score,
    m.avg_ai_visibility_score,
    bl.dealership_name::TEXT,
    wl.dealership_name::TEXT,
    cc.total,
    m.last_scan_at
  FROM metrics m
  CROSS JOIN best_location bl
  CROSS JOIN worst_location wl
  CROSS JOIN competitor_count cc;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Check user access to location
CREATE OR REPLACE FUNCTION user_has_location_access(
  p_user_id TEXT,
  p_location_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  has_access BOOLEAN;
BEGIN
  -- Check if user is group owner
  SELECT EXISTS(
    SELECT 1
    FROM dealership_locations dl
    JOIN dealer_groups dg ON dg.id = dl.dealer_group_id
    WHERE dl.id = p_location_id
    AND dg.owner_id = p_user_id
  ) INTO has_access;

  IF has_access THEN
    RETURN TRUE;
  END IF;

  -- Check if user is a location member
  SELECT EXISTS(
    SELECT 1
    FROM location_members
    WHERE location_id = p_location_id
    AND user_id = p_user_id
  ) INTO has_access;

  RETURN has_access;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Update updated_at timestamp for dealer_groups
CREATE OR REPLACE FUNCTION update_dealer_groups_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER dealer_groups_updated_at
  BEFORE UPDATE ON dealer_groups
  FOR EACH ROW
  EXECUTE FUNCTION update_dealer_groups_updated_at();

-- Trigger: Update updated_at timestamp for dealership_locations
CREATE OR REPLACE FUNCTION update_dealership_locations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER dealership_locations_updated_at
  BEFORE UPDATE ON dealership_locations
  FOR EACH ROW
  EXECUTE FUNCTION update_dealership_locations_updated_at();

-- Trigger: Update cached metrics on dealership_locations when scan completes
CREATE OR REPLACE FUNCTION update_location_cached_metrics()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE dealership_locations
  SET
    latest_schema_coverage = NEW.schema_coverage,
    latest_eeat_score = NEW.eeat_score,
    last_scanned_at = NEW.created_at
  WHERE dealer_id = NEW.dealer_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER schema_scans_update_location_metrics
  AFTER INSERT ON schema_scans
  FOR EACH ROW
  EXECUTE FUNCTION update_location_cached_metrics();

-- Trigger: Update cached AI visibility score on dealership_locations
CREATE OR REPLACE FUNCTION update_location_ai_visibility_metrics()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE dealership_locations
  SET
    latest_ai_visibility_score = NEW.overall_score,
    last_scanned_at = NEW.created_at
  WHERE dealer_id = NEW.dealer_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ai_visibility_tests_update_location_metrics
  AFTER INSERT ON ai_visibility_tests
  FOR EACH ROW
  EXECUTE FUNCTION update_location_ai_visibility_metrics();

-- Row Level Security (RLS)
ALTER TABLE dealer_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE dealership_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE location_members ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view groups they own or are members of
CREATE POLICY dealer_groups_select ON dealer_groups
  FOR SELECT
  USING (
    owner_id = current_setting('app.current_user_id', true)
    OR id IN (
      SELECT DISTINCT dl.dealer_group_id
      FROM dealership_locations dl
      JOIN location_members lm ON lm.location_id = dl.id
      WHERE lm.user_id = current_setting('app.current_user_id', true)
    )
    OR current_setting('app.is_admin', true)::boolean = true
  );

-- Policy: Only group owners can create/update/delete groups
CREATE POLICY dealer_groups_insert ON dealer_groups
  FOR INSERT
  WITH CHECK (owner_id = current_setting('app.current_user_id', true));

CREATE POLICY dealer_groups_update ON dealer_groups
  FOR UPDATE
  USING (
    owner_id = current_setting('app.current_user_id', true)
    OR current_setting('app.is_admin', true)::boolean = true
  );

CREATE POLICY dealer_groups_delete ON dealer_groups
  FOR DELETE
  USING (
    owner_id = current_setting('app.current_user_id', true)
    OR current_setting('app.is_admin', true)::boolean = true
  );

-- Policy: Users can view locations in groups they have access to
CREATE POLICY dealership_locations_select ON dealership_locations
  FOR SELECT
  USING (
    dealer_group_id IN (
      SELECT id FROM dealer_groups
      WHERE owner_id = current_setting('app.current_user_id', true)
    )
    OR id IN (
      SELECT location_id FROM location_members
      WHERE user_id = current_setting('app.current_user_id', true)
    )
    OR current_setting('app.is_admin', true)::boolean = true
  );

-- Policy: Group owners and location admins can manage locations
CREATE POLICY dealership_locations_insert ON dealership_locations
  FOR INSERT
  WITH CHECK (
    dealer_group_id IN (
      SELECT id FROM dealer_groups
      WHERE owner_id = current_setting('app.current_user_id', true)
    )
  );

CREATE POLICY dealership_locations_update ON dealership_locations
  FOR UPDATE
  USING (
    dealer_group_id IN (
      SELECT id FROM dealer_groups
      WHERE owner_id = current_setting('app.current_user_id', true)
    )
    OR id IN (
      SELECT location_id FROM location_members
      WHERE user_id = current_setting('app.current_user_id', true)
      AND role IN ('admin', 'owner')
    )
  );

CREATE POLICY dealership_locations_delete ON dealership_locations
  FOR DELETE
  USING (
    dealer_group_id IN (
      SELECT id FROM dealer_groups
      WHERE owner_id = current_setting('app.current_user_id', true)
    )
  );

-- Policy: Users can view members of locations they have access to
CREATE POLICY location_members_select ON location_members
  FOR SELECT
  USING (
    location_id IN (
      SELECT id FROM dealership_locations dl
      WHERE dl.dealer_group_id IN (
        SELECT id FROM dealer_groups
        WHERE owner_id = current_setting('app.current_user_id', true)
      )
    )
    OR user_id = current_setting('app.current_user_id', true)
    OR current_setting('app.is_admin', true)::boolean = true
  );

-- Policy: Group owners and location admins can manage members
CREATE POLICY location_members_insert ON location_members
  FOR INSERT
  WITH CHECK (
    location_id IN (
      SELECT id FROM dealership_locations dl
      WHERE dl.dealer_group_id IN (
        SELECT id FROM dealer_groups
        WHERE owner_id = current_setting('app.current_user_id', true)
      )
    )
    OR location_id IN (
      SELECT location_id FROM location_members
      WHERE user_id = current_setting('app.current_user_id', true)
      AND role IN ('admin', 'owner')
    )
  );

CREATE POLICY location_members_update ON location_members
  FOR UPDATE
  USING (
    location_id IN (
      SELECT id FROM dealership_locations dl
      WHERE dl.dealer_group_id IN (
        SELECT id FROM dealer_groups
        WHERE owner_id = current_setting('app.current_user_id', true)
      )
    )
    OR location_id IN (
      SELECT location_id FROM location_members
      WHERE user_id = current_setting('app.current_user_id', true)
      AND role IN ('admin', 'owner')
    )
  );

CREATE POLICY location_members_delete ON location_members
  FOR DELETE
  USING (
    location_id IN (
      SELECT id FROM dealership_locations dl
      WHERE dl.dealer_group_id IN (
        SELECT id FROM dealer_groups
        WHERE owner_id = current_setting('app.current_user_id', true)
      )
    )
  );

-- Sample data for demo tenant
INSERT INTO dealer_groups (
  group_name,
  group_slug,
  owner_id,
  plan_tier,
  max_locations
) VALUES (
  'Germain Automotive Group',
  'germain-auto',
  'demo-user',
  'enterprise',
  10
) ON CONFLICT DO NOTHING;

INSERT INTO dealership_locations (
  dealer_group_id,
  dealer_id,
  dealership_name,
  domain,
  street_address,
  city,
  state,
  postal_code,
  phone,
  email,
  latitude,
  longitude,
  latest_schema_coverage,
  latest_eeat_score,
  latest_ai_visibility_score,
  last_scanned_at
) VALUES
  -- Naples location (existing demo-tenant)
  (
    (SELECT id FROM dealer_groups WHERE group_slug = 'germain-auto' LIMIT 1),
    'demo-tenant',
    'Germain Toyota of Naples',
    'germaintoyotaofnaples.com',
    '13315 Tamiami Trail N',
    'Naples',
    'FL',
    '34110',
    '+1-239-643-1441',
    'info@germaintoyotaofnaples.com',
    26.2540,
    -81.8067,
    95,
    91,
    78,
    NOW() - INTERVAL '1 day'
  ),
  -- Fort Myers location
  (
    (SELECT id FROM dealer_groups WHERE group_slug = 'germain-auto' LIMIT 1),
    'germain-fort-myers',
    'Germain Honda of Fort Myers',
    'germainhondaoffortmyers.com',
    '4350 Cleveland Ave',
    'Fort Myers',
    'FL',
    '33901',
    '+1-239-939-1700',
    'info@germainhondaoffortmyers.com',
    26.6406,
    -81.8723,
    88,
    85,
    72,
    NOW() - INTERVAL '2 hours'
  ),
  -- Sarasota location
  (
    (SELECT id FROM dealer_groups WHERE group_slug = 'germain-auto' LIMIT 1),
    'germain-sarasota',
    'Germain Lexus of Sarasota',
    'germainlexusofsarasota.com',
    '8750 S Tamiami Trail',
    'Sarasota',
    'FL',
    '34238',
    '+1-941-926-6633',
    'info@germainlexusofsarasota.com',
    27.2639,
    -82.5267,
    82,
    79,
    68,
    NOW() - INTERVAL '3 hours'
  )
ON CONFLICT (dealer_id) DO NOTHING;

-- Add demo location members
INSERT INTO location_members (
  location_id,
  user_id,
  role,
  can_edit_settings,
  can_view_reports,
  can_manage_schema
) VALUES
  (
    (SELECT id FROM dealership_locations WHERE dealer_id = 'demo-tenant' LIMIT 1),
    'demo-manager',
    'manager',
    false,
    true,
    true
  ),
  (
    (SELECT id FROM dealership_locations WHERE dealer_id = 'germain-fort-myers' LIMIT 1),
    'demo-manager',
    'admin',
    true,
    true,
    true
  )
ON CONFLICT (location_id, user_id) DO NOTHING;

-- Grant permissions
GRANT SELECT ON dealer_groups TO anon, authenticated;
GRANT SELECT ON dealership_locations TO anon, authenticated;
GRANT SELECT ON location_members TO anon, authenticated;
GRANT SELECT ON dealer_group_metrics TO anon, authenticated;
GRANT SELECT ON location_group_rankings TO anon, authenticated;
GRANT SELECT ON location_consistency_analysis TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_group_locations TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_group_aggregate_report TO anon, authenticated;
GRANT EXECUTE ON FUNCTION user_has_location_access TO anon, authenticated;

-- Comments for documentation
COMMENT ON TABLE dealer_groups IS 'Parent organizations managing multiple dealership locations';
COMMENT ON TABLE dealership_locations IS 'Individual dealership locations within dealer groups';
COMMENT ON TABLE location_members IS 'User access control for specific dealership locations';
COMMENT ON VIEW dealer_group_metrics IS 'Aggregate performance metrics across all locations in a group';
COMMENT ON VIEW location_group_rankings IS 'Performance rankings of locations within their dealer group';
COMMENT ON VIEW location_consistency_analysis IS 'Cross-location schema consistency checker';
COMMENT ON FUNCTION get_group_locations IS 'Returns all locations for a dealer group with current metrics';
COMMENT ON FUNCTION get_group_aggregate_report IS 'Returns comprehensive aggregate report for dealer group';
COMMENT ON FUNCTION user_has_location_access IS 'Checks if user has access to a specific location';
