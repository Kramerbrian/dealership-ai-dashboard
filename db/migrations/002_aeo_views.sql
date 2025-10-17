-- AEO (Answer Engine Optimization) Views
-- Creates materialized views for AEO leaderboard and breakdown analytics

-- AEO Surface Breakdown View
CREATE MATERIALIZED VIEW IF NOT EXISTS aeo_surface_breakdown AS
SELECT 
  tenant_id,
  DATE_TRUNC('day', observed_at) as date,
  engine,
  surface_type,
  COUNT(*) as query_count,
  SUM(CASE WHEN appeared THEN 1 ELSE 0 END) as appearances,
  ROUND(
    (SUM(CASE WHEN appeared THEN 1 ELSE 0 END)::numeric / COUNT(*)) * 100, 
    2
  ) as appearance_rate_pct,
  SUM(CASE WHEN cited THEN 1 ELSE 0 END) as citations,
  ROUND(
    (SUM(CASE WHEN cited THEN 1 ELSE 0 END)::numeric / NULLIF(SUM(CASE WHEN appeared THEN 1 ELSE 0 END), 0)) * 100, 
    2
  ) as citation_rate_pct
FROM aeo_queries 
WHERE observed_at >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY tenant_id, DATE_TRUNC('day', observed_at), engine, surface_type
ORDER BY tenant_id, date DESC, engine, surface_type;

-- AEO Domain First Appearances View
CREATE MATERIALIZED VIEW IF NOT EXISTS aeo_domain_first_appearances AS
SELECT 
  tenant_id,
  domain,
  engine,
  surface_type,
  MIN(observed_at) as first_appeared_at,
  COUNT(*) as total_queries,
  SUM(CASE WHEN appeared THEN 1 ELSE 0 END) as total_appearances,
  ROUND(
    (SUM(CASE WHEN appeared THEN 1 ELSE 0 END)::numeric / COUNT(*)) * 100, 
    2
  ) as overall_appearance_rate
FROM aeo_queries 
WHERE observed_at >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY tenant_id, domain, engine, surface_type
ORDER BY tenant_id, first_appeared_at DESC;

-- AEO Leaderboard View
CREATE MATERIALIZED VIEW IF NOT EXISTS aeo_leaderboard AS
SELECT 
  tenant_id,
  engine,
  COUNT(*) as total_queries,
  SUM(CASE WHEN appeared THEN 1 ELSE 0 END) as total_appearances,
  ROUND(
    (SUM(CASE WHEN appeared THEN 1 ELSE 0 END)::numeric / COUNT(*)) * 100, 
    2
  ) as appearance_rate_pct,
  SUM(CASE WHEN cited THEN 1 ELSE 0 END) as total_citations,
  ROUND(
    (SUM(CASE WHEN cited THEN 1 ELSE 0 END)::numeric / NULLIF(SUM(CASE WHEN appeared THEN 1 ELSE 0 END), 0)) * 100, 
    2
  ) as citation_rate_pct,
  AVG(CASE WHEN appeared THEN clicks_est ELSE NULL END) as avg_clicks_when_appeared,
  MAX(observed_at) as last_observed
FROM aeo_queries 
WHERE observed_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY tenant_id, engine
ORDER BY tenant_id, appearance_rate_pct DESC;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_aeo_surface_breakdown_tenant_date 
ON aeo_surface_breakdown (tenant_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_aeo_domain_first_appearances_tenant 
ON aeo_domain_first_appearances (tenant_id, first_appeared_at DESC);

CREATE INDEX IF NOT EXISTS idx_aeo_leaderboard_tenant 
ON aeo_leaderboard (tenant_id, appearance_rate_pct DESC);

-- Refresh the materialized views
REFRESH MATERIALIZED VIEW aeo_surface_breakdown;
REFRESH MATERIALIZED VIEW aeo_domain_first_appearances;
REFRESH MATERIALIZED VIEW aeo_leaderboard;