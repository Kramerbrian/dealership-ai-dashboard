-- Enable RLS on GEO signals tables
ALTER TABLE external_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE geo_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE geo_composite_scores ENABLE ROW LEVEL SECURITY;

-- External Sources RLS Policies
CREATE POLICY "external_sources_tenant_isolation" ON external_sources
  FOR ALL USING (tenant_id = current_setting('app.tenant')::uuid);

CREATE POLICY "external_sources_insert_owner_admin" ON external_sources
  FOR INSERT WITH CHECK (
    tenant_id = current_setting('app.tenant')::uuid AND
    current_setting('app.user_role') IN ('owner', 'admin')
  );

-- GEO Signals RLS Policies
CREATE POLICY "geo_signals_tenant_isolation" ON geo_signals
  FOR ALL USING (tenant_id = current_setting('app.tenant')::uuid);

CREATE POLICY "geo_signals_insert_owner_admin" ON geo_signals
  FOR INSERT WITH CHECK (
    tenant_id = current_setting('app.tenant')::uuid AND
    current_setting('app.user_role') IN ('owner', 'admin')
  );

-- GEO Composite Scores RLS Policies
CREATE POLICY "geo_composite_tenant_isolation" ON geo_composite_scores
  FOR ALL USING (tenant_id = current_setting('app.tenant')::uuid);

CREATE POLICY "geo_composite_insert_owner_admin" ON geo_composite_scores
  FOR INSERT WITH CHECK (
    tenant_id = current_setting('app.tenant')::uuid AND
    current_setting('app.user_role') IN ('owner', 'admin')
  );

-- Create indexes for performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_external_sources_tenant_provider 
  ON external_sources(tenant_id, provider);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_geo_signals_tenant_computed 
  ON geo_signals(tenant_id, computed_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_geo_composite_tenant_computed 
  ON geo_composite_scores(tenant_id, computed_at DESC);

-- Create function to automatically set tenant context
CREATE OR REPLACE FUNCTION set_tenant_context(tenant_uuid uuid, user_role text)
RETURNS void AS $$
BEGIN
  PERFORM set_config('app.tenant', tenant_uuid::text, true);
  PERFORM set_config('app.user_role', user_role, true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to clean up old GEO signals (keep last 12 weeks)
CREATE OR REPLACE FUNCTION cleanup_old_geo_signals()
RETURNS void AS $$
BEGIN
  DELETE FROM geo_signals 
  WHERE computed_at < NOW() - INTERVAL '12 weeks';
  
  DELETE FROM external_sources 
  WHERE fetched_at < NOW() - INTERVAL '12 weeks'
  AND id NOT IN (SELECT DISTINCT source_id FROM geo_signals);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Schedule cleanup job (run weekly)
-- This would typically be set up in your cron job system
-- SELECT cron.schedule('cleanup-geo-signals', '0 2 * * 0', 'SELECT cleanup_old_geo_signals();');
