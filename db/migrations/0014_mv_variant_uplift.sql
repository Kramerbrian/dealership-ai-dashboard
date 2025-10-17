-- Materialized view for variant uplift analysis
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_variant_uplift AS
WITH w AS (
  SELECT 
    "tenantId", 
    "variantId", 
    date_trunc('week', "asOf")::date as bucket, 
    sum(impressions) as imp, 
    sum(clicks) as clk, 
    sum(conversions) as cnv 
  FROM "SeoVariantMetric" 
  GROUP BY 1, 2, 3
)
SELECT 
  w."tenantId", 
  w."variantId", 
  w.bucket, 
  imp, 
  clk, 
  cnv, 
  CASE WHEN imp > 0 THEN clk::numeric / imp ELSE 0 END as ctr, 
  CASE WHEN clk > 0 THEN cnv::numeric / clk ELSE 0 END as cvr 
FROM w;

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_mv_variant_uplift ON mv_variant_uplift("tenantId", "variantId", bucket);

-- Function to refresh the materialized view
CREATE OR REPLACE FUNCTION refresh_variant_uplift() RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW mv_variant_uplift;
END;
$$ LANGUAGE plpgsql;

-- RLS for the materialized view
ALTER MATERIALIZED VIEW mv_variant_uplift ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY mv_variant_uplift_tenant_select ON mv_variant_uplift FOR SELECT
  USING ("tenantId" = current_setting('app.tenant')::uuid);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
