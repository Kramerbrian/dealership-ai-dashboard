-- Idempotency and causality tracking
CREATE TABLE IF NOT EXISTS idempotency_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  route text NOT NULL,
  key text NOT NULL,
  body_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, route, key)
);

-- Enable RLS
ALTER TABLE idempotency_events ENABLE ROW LEVEL SECURITY;

-- Create RLS policy
CREATE POLICY idem_rw ON idempotency_events
  USING (tenant_id = coalesce(current_setting('request.jwt.claims', true)::json->>'tenant_id',''))
  WITH CHECK (tenant_id = coalesce(current_setting('request.jwt.claims', true)::json->>'tenant_id',''));

-- Causal deduplication index
CREATE UNIQUE INDEX IF NOT EXISTS ux_metric_causal
  ON "SeoVariantMetric"(tenantId, causalId) WHERE causalId IS NOT NULL;

-- Weekly aggregation materialized view
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_weekly_variant AS
SELECT tenantId, variantId,
       date_trunc('week', "asOf")::date AS bucket,
       sum(impressions) AS impressions,
       sum(clicks) AS clicks,
       sum(conversions) AS conversions,
       sum(revenue) AS revenue
FROM "SeoVariantMetric"
GROUP BY 1,2,3;

CREATE INDEX IF NOT EXISTS idx_mv_weekly ON mv_weekly_variant(tenantId, variantId, bucket);

-- Refresh function for materialized view
CREATE OR REPLACE FUNCTION refresh_weekly_variant()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW mv_weekly_variant;
END;
$$ LANGUAGE plpgsql;
