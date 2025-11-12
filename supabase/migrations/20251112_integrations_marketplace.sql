-- Integration Marketplace System
-- Connects dealership data with external platforms (DMS, reviews, etc.)

-- Available integrations registry
CREATE TABLE IF NOT EXISTS integration_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Provider info
  provider_name TEXT NOT NULL UNIQUE,
  provider_slug TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL CHECK (category IN ('dms', 'reviews', 'analytics', 'crm', 'social', 'other')),

  -- Provider details
  description TEXT,
  logo_url TEXT,
  website_url TEXT,

  -- Capabilities
  capabilities JSONB DEFAULT '[]'::jsonb, -- ['pull_reviews', 'push_inventory', 'sync_customers', etc.]
  supported_auth_types JSONB DEFAULT '["api_key"]'::jsonb, -- ['api_key', 'oauth2', 'basic_auth']

  -- Configuration schema
  config_schema JSONB, -- JSON Schema for provider-specific configuration

  -- Status
  status TEXT CHECK (status IN ('active', 'beta', 'deprecated', 'coming_soon')) DEFAULT 'active',
  is_premium BOOLEAN DEFAULT FALSE,

  -- Metadata
  documentation_url TEXT,
  support_email TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User's active integrations
CREATE TABLE IF NOT EXISTS dealer_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id TEXT NOT NULL,
  provider_id UUID NOT NULL REFERENCES integration_providers(id) ON DELETE CASCADE,

  -- Configuration
  config JSONB NOT NULL DEFAULT '{}'::jsonb, -- Provider-specific config (encrypted credentials, endpoints, etc.)

  -- Sync settings
  sync_enabled BOOLEAN DEFAULT TRUE,
  sync_interval_minutes INTEGER DEFAULT 60, -- How often to sync data
  last_synced_at TIMESTAMPTZ,
  next_sync_at TIMESTAMPTZ,

  -- Status
  status TEXT CHECK (status IN ('active', 'paused', 'error', 'setup_required')) DEFAULT 'setup_required',
  error_message TEXT,
  error_count INTEGER DEFAULT 0,

  -- Metadata
  created_by TEXT, -- User ID who created this integration

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Unique constraint: one integration per dealer per provider
  UNIQUE(dealer_id, provider_id)
);

-- Integration sync history
CREATE TABLE IF NOT EXISTS integration_sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID NOT NULL REFERENCES dealer_integrations(id) ON DELETE CASCADE,

  -- Sync details
  sync_type TEXT NOT NULL CHECK (sync_type IN ('manual', 'scheduled', 'webhook')),
  direction TEXT NOT NULL CHECK (direction IN ('pull', 'push', 'bidirectional')),

  -- Results
  status TEXT NOT NULL CHECK (status IN ('success', 'partial', 'failed')),
  records_processed INTEGER DEFAULT 0,
  records_created INTEGER DEFAULT 0,
  records_updated INTEGER DEFAULT 0,
  records_failed INTEGER DEFAULT 0,

  -- Data details
  data_summary JSONB, -- Summary of what was synced
  error_details JSONB, -- Detailed error information

  -- Performance
  duration_ms INTEGER,

  -- Timestamps
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Review aggregation data (from external platforms)
CREATE TABLE IF NOT EXISTS aggregated_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id TEXT NOT NULL,
  integration_id UUID REFERENCES dealer_integrations(id) ON DELETE SET NULL,

  -- Review source
  platform TEXT NOT NULL CHECK (platform IN ('google', 'yelp', 'dealerrater', 'cargurus', 'edmunds', 'cars_com', 'facebook', 'other')),
  external_id TEXT, -- ID on the external platform
  review_url TEXT,

  -- Review content
  reviewer_name TEXT,
  rating DECIMAL(3, 2) NOT NULL CHECK (rating >= 0 AND rating <= 5),
  review_text TEXT,
  review_date TIMESTAMPTZ NOT NULL,

  -- Sentiment analysis
  sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  sentiment_score DECIMAL(5, 4), -- -1.0 to 1.0

  -- Response
  has_response BOOLEAN DEFAULT FALSE,
  response_text TEXT,
  response_date TIMESTAMPTZ,

  -- Metadata
  verified_purchase BOOLEAN,
  recommended BOOLEAN,

  -- Timestamps
  imported_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Unique constraint: one review per platform per external_id
  UNIQUE(platform, external_id)
);

-- Inventory sync data (from DMS)
CREATE TABLE IF NOT EXISTS inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id TEXT NOT NULL,
  integration_id UUID REFERENCES dealer_integrations(id) ON DELETE SET NULL,

  -- Vehicle details
  vin TEXT UNIQUE NOT NULL,
  stock_number TEXT,
  year INTEGER NOT NULL,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  trim TEXT,

  -- Specifications
  body_style TEXT,
  exterior_color TEXT,
  interior_color TEXT,
  mileage INTEGER,
  transmission TEXT,
  fuel_type TEXT,
  drivetrain TEXT,

  -- Pricing
  msrp DECIMAL(10, 2),
  sale_price DECIMAL(10, 2),
  internet_price DECIMAL(10, 2),

  -- Status
  inventory_status TEXT CHECK (inventory_status IN ('in_stock', 'sold', 'pending', 'incoming')) DEFAULT 'in_stock',
  is_certified BOOLEAN DEFAULT FALSE,
  is_new BOOLEAN DEFAULT TRUE,

  -- Media
  primary_image_url TEXT,
  image_urls JSONB DEFAULT '[]'::jsonb,

  -- Metadata
  description TEXT,
  features JSONB DEFAULT '[]'::jsonb,

  -- Timestamps
  last_synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_integration_providers_category ON integration_providers(category);
CREATE INDEX IF NOT EXISTS idx_integration_providers_status ON integration_providers(status);
CREATE INDEX IF NOT EXISTS idx_dealer_integrations_dealer ON dealer_integrations(dealer_id);
CREATE INDEX IF NOT EXISTS idx_dealer_integrations_provider ON dealer_integrations(provider_id);
CREATE INDEX IF NOT EXISTS idx_dealer_integrations_status ON dealer_integrations(status);
CREATE INDEX IF NOT EXISTS idx_integration_sync_logs_integration ON integration_sync_logs(integration_id);
CREATE INDEX IF NOT EXISTS idx_integration_sync_logs_started ON integration_sync_logs(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_aggregated_reviews_dealer ON aggregated_reviews(dealer_id);
CREATE INDEX IF NOT EXISTS idx_aggregated_reviews_platform ON aggregated_reviews(platform);
CREATE INDEX IF NOT EXISTS idx_aggregated_reviews_date ON aggregated_reviews(review_date DESC);
CREATE INDEX IF NOT EXISTS idx_inventory_items_dealer ON inventory_items(dealer_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_vin ON inventory_items(vin);
CREATE INDEX IF NOT EXISTS idx_inventory_items_status ON inventory_items(inventory_status);

-- View: Integration health status
CREATE OR REPLACE VIEW integration_health AS
SELECT
  di.id as integration_id,
  di.dealer_id,
  ip.provider_name,
  ip.category,
  di.status,
  di.sync_enabled,
  di.last_synced_at,
  di.next_sync_at,
  di.error_count,

  -- Recent sync stats
  (SELECT COUNT(*) FROM integration_sync_logs WHERE integration_id = di.id AND started_at > NOW() - INTERVAL '24 hours') as syncs_last_24h,
  (SELECT COUNT(*) FROM integration_sync_logs WHERE integration_id = di.id AND status = 'failed' AND started_at > NOW() - INTERVAL '24 hours') as failures_last_24h,

  -- Health score (0-100)
  CASE
    WHEN di.status = 'error' THEN 0
    WHEN di.status = 'setup_required' THEN 25
    WHEN di.status = 'paused' THEN 50
    WHEN di.error_count > 5 THEN 60
    WHEN di.last_synced_at < NOW() - INTERVAL '24 hours' THEN 70
    WHEN di.last_synced_at < NOW() - INTERVAL '6 hours' THEN 85
    ELSE 100
  END as health_score
FROM dealer_integrations di
JOIN integration_providers ip ON ip.id = di.provider_id;

-- View: Review aggregation summary
CREATE OR REPLACE VIEW review_aggregation_summary AS
SELECT
  dealer_id,
  platform,
  COUNT(*) as total_reviews,
  AVG(rating)::DECIMAL(3, 2) as avg_rating,
  COUNT(*) FILTER (WHERE sentiment = 'positive') as positive_count,
  COUNT(*) FILTER (WHERE sentiment = 'neutral') as neutral_count,
  COUNT(*) FILTER (WHERE sentiment = 'negative') as negative_count,
  COUNT(*) FILTER (WHERE has_response) as responded_count,
  MIN(review_date) as earliest_review,
  MAX(review_date) as latest_review,
  MAX(imported_at) as last_import
FROM aggregated_reviews
GROUP BY dealer_id, platform;

-- View: Inventory summary
CREATE OR REPLACE VIEW inventory_summary AS
SELECT
  dealer_id,
  COUNT(*) as total_vehicles,
  COUNT(*) FILTER (WHERE inventory_status = 'in_stock') as in_stock_count,
  COUNT(*) FILTER (WHERE inventory_status = 'sold') as sold_count,
  COUNT(*) FILTER (WHERE is_new = true) as new_count,
  COUNT(*) FILTER (WHERE is_new = false) as used_count,
  COUNT(*) FILTER (WHERE is_certified = true) as certified_count,
  AVG(sale_price)::DECIMAL(10, 2) as avg_price,
  MIN(sale_price)::DECIMAL(10, 2) as min_price,
  MAX(sale_price)::DECIMAL(10, 2) as max_price
FROM inventory_items
WHERE inventory_status = 'in_stock'
GROUP BY dealer_id;

-- Function: Trigger integration sync
CREATE OR REPLACE FUNCTION trigger_integration_sync(
  p_integration_id UUID,
  p_sync_type TEXT DEFAULT 'manual'
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  -- Create sync log entry
  INSERT INTO integration_sync_logs (
    integration_id,
    sync_type,
    direction,
    status
  ) VALUES (
    p_integration_id,
    p_sync_type,
    'pull', -- Default direction
    'success' -- Will be updated by actual sync process
  ) RETURNING id INTO v_log_id;

  -- Update integration next sync time
  UPDATE dealer_integrations
  SET next_sync_at = NOW() + (sync_interval_minutes || ' minutes')::INTERVAL
  WHERE id = p_integration_id;

  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get integration stats
CREATE OR REPLACE FUNCTION get_integration_stats(p_dealer_id TEXT)
RETURNS TABLE (
  total_integrations INTEGER,
  active_integrations INTEGER,
  error_integrations INTEGER,
  total_syncs_today INTEGER,
  failed_syncs_today INTEGER,
  avg_health_score DECIMAL,
  total_reviews_imported INTEGER,
  avg_review_rating DECIMAL,
  total_inventory_items INTEGER
) AS $$
BEGIN
  RETURN QUERY
  WITH integration_counts AS (
    SELECT
      COUNT(*)::INTEGER as total,
      COUNT(*) FILTER (WHERE status = 'active')::INTEGER as active,
      COUNT(*) FILTER (WHERE status = 'error')::INTEGER as errors
    FROM dealer_integrations
    WHERE dealer_id = p_dealer_id
  ),
  sync_counts AS (
    SELECT
      COUNT(*)::INTEGER as total_today,
      COUNT(*) FILTER (WHERE status = 'failed')::INTEGER as failed_today
    FROM integration_sync_logs isl
    JOIN dealer_integrations di ON di.id = isl.integration_id
    WHERE di.dealer_id = p_dealer_id
    AND isl.started_at > NOW() - INTERVAL '24 hours'
  ),
  health_avg AS (
    SELECT AVG(health_score)::DECIMAL as avg_health
    FROM integration_health
    WHERE dealer_id = p_dealer_id
  ),
  review_stats AS (
    SELECT
      COUNT(*)::INTEGER as total,
      AVG(rating)::DECIMAL(3, 2) as avg_rating
    FROM aggregated_reviews
    WHERE dealer_id = p_dealer_id
  ),
  inventory_count AS (
    SELECT COUNT(*)::INTEGER as total
    FROM inventory_items
    WHERE dealer_id = p_dealer_id
  )
  SELECT
    ic.total,
    ic.active,
    ic.errors,
    sc.total_today,
    sc.failed_today,
    ha.avg_health,
    rs.total,
    rs.avg_rating,
    inv.total
  FROM integration_counts ic
  CROSS JOIN sync_counts sc
  CROSS JOIN health_avg ha
  CROSS JOIN review_stats rs
  CROSS JOIN inventory_count inv;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_integrations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER integration_providers_updated_at
  BEFORE UPDATE ON integration_providers
  FOR EACH ROW
  EXECUTE FUNCTION update_integrations_updated_at();

CREATE TRIGGER dealer_integrations_updated_at
  BEFORE UPDATE ON dealer_integrations
  FOR EACH ROW
  EXECUTE FUNCTION update_integrations_updated_at();

CREATE TRIGGER inventory_items_updated_at
  BEFORE UPDATE ON inventory_items
  FOR EACH ROW
  EXECUTE FUNCTION update_integrations_updated_at();

-- Row Level Security (RLS)
ALTER TABLE integration_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE dealer_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE aggregated_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can view available integration providers
CREATE POLICY integration_providers_select ON integration_providers
  FOR SELECT
  USING (status IN ('active', 'beta'));

-- Policy: Users can view their own integrations
CREATE POLICY dealer_integrations_select ON dealer_integrations
  FOR SELECT
  USING (
    dealer_id = current_setting('app.current_dealer_id', true)
    OR current_setting('app.is_admin', true)::boolean = true
  );

-- Policy: Users can manage their own integrations
CREATE POLICY dealer_integrations_insert ON dealer_integrations
  FOR INSERT
  WITH CHECK (dealer_id = current_setting('app.current_dealer_id', true));

CREATE POLICY dealer_integrations_update ON dealer_integrations
  FOR UPDATE
  USING (dealer_id = current_setting('app.current_dealer_id', true));

CREATE POLICY dealer_integrations_delete ON dealer_integrations
  FOR DELETE
  USING (dealer_id = current_setting('app.current_dealer_id', true));

-- Policy: Users can view their own sync logs
CREATE POLICY integration_sync_logs_select ON integration_sync_logs
  FOR SELECT
  USING (
    integration_id IN (
      SELECT id FROM dealer_integrations
      WHERE dealer_id = current_setting('app.current_dealer_id', true)
    )
    OR current_setting('app.is_admin', true)::boolean = true
  );

-- Policy: Service role can insert sync logs
CREATE POLICY integration_sync_logs_insert ON integration_sync_logs
  FOR INSERT
  WITH CHECK (true);

-- Policy: Users can view their own reviews
CREATE POLICY aggregated_reviews_select ON aggregated_reviews
  FOR SELECT
  USING (
    dealer_id = current_setting('app.current_dealer_id', true)
    OR current_setting('app.is_admin', true)::boolean = true
  );

-- Policy: Service role can manage reviews
CREATE POLICY aggregated_reviews_insert ON aggregated_reviews
  FOR INSERT
  WITH CHECK (true);

-- Policy: Users can view their own inventory
CREATE POLICY inventory_items_select ON inventory_items
  FOR SELECT
  USING (
    dealer_id = current_setting('app.current_dealer_id', true)
    OR current_setting('app.is_admin', true)::boolean = true
  );

-- Policy: Service role can manage inventory
CREATE POLICY inventory_items_insert ON inventory_items
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY inventory_items_update ON inventory_items
  FOR UPDATE
  USING (true);

-- Sample integration providers
INSERT INTO integration_providers (
  provider_name,
  provider_slug,
  category,
  description,
  capabilities,
  supported_auth_types,
  status,
  is_premium
) VALUES
  (
    'Google My Business',
    'google-my-business',
    'reviews',
    'Sync reviews, ratings, and Q&A from your Google Business Profile',
    '["pull_reviews", "pull_photos", "pull_qa", "respond_to_reviews"]'::jsonb,
    '["oauth2"]'::jsonb,
    'active',
    false
  ),
  (
    'Yelp for Business',
    'yelp',
    'reviews',
    'Import reviews and ratings from Yelp',
    '["pull_reviews", "pull_photos"]'::jsonb,
    '["api_key"]'::jsonb,
    'active',
    false
  ),
  (
    'DealerRater',
    'dealerrater',
    'reviews',
    'Aggregate reviews from DealerRater automotive platform',
    '["pull_reviews", "pull_ratings"]'::jsonb,
    '["api_key"]'::jsonb,
    'active',
    true
  ),
  (
    'CDK Global',
    'cdk-global',
    'dms',
    'Sync inventory, customer data, and sales from CDK DMS',
    '["pull_inventory", "pull_customers", "pull_sales", "push_leads"]'::jsonb,
    '["api_key", "basic_auth"]'::jsonb,
    'beta',
    true
  ),
  (
    'Reynolds & Reynolds',
    'reynolds-reynolds',
    'dms',
    'Integrate with Reynolds ERA system for inventory and customer management',
    '["pull_inventory", "pull_customers", "push_leads"]'::jsonb,
    '["api_key"]'::jsonb,
    'beta',
    true
  ),
  (
    'Facebook Reviews',
    'facebook',
    'reviews',
    'Import reviews and recommendations from Facebook Page',
    '["pull_reviews", "pull_ratings", "respond_to_reviews"]'::jsonb,
    '["oauth2"]'::jsonb,
    'active',
    false
  )
ON CONFLICT (provider_slug) DO NOTHING;

-- Sample dealer integration (demo-tenant with Google My Business)
INSERT INTO dealer_integrations (
  dealer_id,
  provider_id,
  config,
  sync_enabled,
  sync_interval_minutes,
  last_synced_at,
  next_sync_at,
  status,
  created_by
) VALUES (
  'demo-tenant',
  (SELECT id FROM integration_providers WHERE provider_slug = 'google-my-business' LIMIT 1),
  '{"account_id": "demo-gmb-12345", "location_id": "ChIJXXXXXXXXXXXXXXXXXX"}'::jsonb,
  true,
  60,
  NOW() - INTERVAL '30 minutes',
  NOW() + INTERVAL '30 minutes',
  'active',
  'demo-user'
) ON CONFLICT (dealer_id, provider_id) DO NOTHING;

-- Sample reviews data
INSERT INTO aggregated_reviews (
  dealer_id,
  integration_id,
  platform,
  external_id,
  reviewer_name,
  rating,
  review_text,
  review_date,
  sentiment,
  sentiment_score,
  has_response
) VALUES
  (
    'demo-tenant',
    (SELECT id FROM dealer_integrations WHERE dealer_id = 'demo-tenant' LIMIT 1),
    'google',
    'google-review-1',
    'John Smith',
    5.0,
    'Excellent service! The sales team was very helpful and professional. Highly recommend.',
    NOW() - INTERVAL '5 days',
    'positive',
    0.92,
    true
  ),
  (
    'demo-tenant',
    (SELECT id FROM dealer_integrations WHERE dealer_id = 'demo-tenant' LIMIT 1),
    'google',
    'google-review-2',
    'Sarah Johnson',
    4.5,
    'Great experience overall. The process was smooth and staff was knowledgeable.',
    NOW() - INTERVAL '12 days',
    'positive',
    0.78,
    false
  ),
  (
    'demo-tenant',
    (SELECT id FROM dealer_integrations WHERE dealer_id = 'demo-tenant' LIMIT 1),
    'google',
    'google-review-3',
    'Mike Davis',
    2.0,
    'Service department took longer than expected. Not very satisfied with wait time.',
    NOW() - INTERVAL '20 days',
    'negative',
    -0.65,
    true
  )
ON CONFLICT (platform, external_id) DO NOTHING;

-- Grant permissions
GRANT SELECT ON integration_providers TO anon, authenticated;
GRANT SELECT ON dealer_integrations TO anon, authenticated;
GRANT SELECT ON integration_sync_logs TO anon, authenticated;
GRANT SELECT ON aggregated_reviews TO anon, authenticated;
GRANT SELECT ON inventory_items TO anon, authenticated;
GRANT SELECT ON integration_health TO anon, authenticated;
GRANT SELECT ON review_aggregation_summary TO anon, authenticated;
GRANT SELECT ON inventory_summary TO anon, authenticated;
GRANT EXECUTE ON FUNCTION trigger_integration_sync TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_integration_stats TO anon, authenticated;

-- Comments for documentation
COMMENT ON TABLE integration_providers IS 'Registry of available integration providers (Google, Yelp, DMS systems, etc.)';
COMMENT ON TABLE dealer_integrations IS 'Active integrations configured by dealers';
COMMENT ON TABLE integration_sync_logs IS 'Historical log of all integration sync operations';
COMMENT ON TABLE aggregated_reviews IS 'Reviews aggregated from multiple external platforms';
COMMENT ON TABLE inventory_items IS 'Vehicle inventory synced from DMS systems';
COMMENT ON VIEW integration_health IS 'Real-time health status of all active integrations';
COMMENT ON VIEW review_aggregation_summary IS 'Summary statistics of reviews per platform';
COMMENT ON VIEW inventory_summary IS 'Inventory statistics and pricing summary';
COMMENT ON FUNCTION trigger_integration_sync IS 'Manually trigger a sync for a specific integration';
COMMENT ON FUNCTION get_integration_stats IS 'Get comprehensive integration statistics for a dealer';
