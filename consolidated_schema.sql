-- DealershipAI Consolidated Schema
-- Apply this directly in Supabase SQL Editor

-- 1. Policy Configuration System
CREATE TABLE IF NOT EXISTS policy_configs (
  tenant_id uuid PRIMARY KEY,
  version int NOT NULL DEFAULT 1,
  config jsonb NOT NULL,
  updated_by uuid,
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS policy_config_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  version int NOT NULL,
  config jsonb NOT NULL,
  updated_by uuid,
  updated_at timestamptz DEFAULT now()
);

CREATE OR REPLACE FUNCTION bump_policy_version()
RETURNS trigger AS $$
BEGIN
  INSERT INTO policy_config_versions(tenant_id, version, config, updated_by, updated_at)
  VALUES (NEW.tenant_id, NEW.version, NEW.config, NEW.updated_by, NEW.updated_at);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_policy_version ON policy_configs;
CREATE TRIGGER trg_policy_version
AFTER INSERT OR UPDATE ON policy_configs
FOR EACH ROW EXECUTE FUNCTION bump_policy_version();

-- 2. Knowledge Graph Materialized Views
CREATE MATERIALIZED VIEW IF NOT EXISTS v_hours_reliability AS
WITH gbp AS (
  SELECT n.id AS gbp_id, (n.props->>'place_id') AS place_id,
         (n.props->>'hours')::jsonb AS gbp_hours,
         (n.props->>'tenant_id') AS tenant_id,
         n.as_of
  FROM kg_nodes n
  WHERE n.kind = 'GBP'
),
engine_hours AS (
  SELECT ea.id AS answer_id, ea.props->>'engine' AS engine,
         (ea.props->>'hours')::jsonb AS engine_hours,
         ea.as_of, e.subj AS conflict_subj_id, e.obj AS conflict_obj_id
  FROM kg_nodes ea
  JOIN kg_edges e ON e.subj = ea.id AND e.pred = 'CONFLICTS_WITH'
  WHERE ea.kind = 'EngineAnswer'
    AND (e.props->>'field') = 'hours'
),
joined AS (
  SELECT g.tenant_id, g.place_id, g.gbp_hours, g.as_of AS gbp_as_of,
         eh.engine, eh.engine_hours, eh.as_of AS engine_as_of
  FROM kg_nodes p
  JOIN kg_edges rel ON rel.subj = p.id AND rel.pred = 'HAS_GBP'
  JOIN gbp g ON g.gbp_id = rel.obj
  JOIN engine_hours eh ON eh.conflict_subj_id = rel.obj
  WHERE p.kind = 'Dealer'
)
SELECT
  tenant_id,
  place_id,
  COUNT(*)::int AS comparisons,
  AVG( CASE WHEN engine_hours = gbp_hours THEN 1 ELSE 0 END )::numeric(5,2) AS match_rate,
  MAX(engine_as_of) AS last_engine_check,
  MAX(gbp_as_of) AS last_gbp_update
FROM joined
GROUP BY tenant_id, place_id
WITH NO DATA;

CREATE MATERIALIZED VIEW IF NOT EXISTS v_citation_depth_index AS
WITH cites AS (
  SELECT a.id AS answer_id, a.props->>'engine' AS engine,
         c.id AS cite_id, (c.props->>'source_domain') AS source_domain
  FROM kg_nodes a
  JOIN kg_edges ac ON ac.subj = a.id AND ac.pred = 'CITES'
  JOIN kg_nodes c ON c.id = ac.obj AND c.kind = 'Citation'
  WHERE a.kind = 'EngineAnswer'
),
targets AS (
  SELECT c.cite_id, p.id AS page_id, (p.props->>'type') AS page_type,
         (p.props->>'tenant_id') AS tenant_id
  FROM cites c
  JOIN kg_edges cr ON cr.subj = c.cite_id AND cr.pred = 'REFERS_TO'
  JOIN kg_nodes p ON p.id = cr.obj AND p.kind = 'Page'
),
weighted AS (
  SELECT t.tenant_id, c.engine, c.source_domain, t.page_type,
         CASE
           WHEN t.page_type = 'Homepage' THEN 1
           WHEN t.page_type = 'SRP' THEN 2
           WHEN t.page_type = 'VDP' THEN 3
           WHEN t.page_type IN ('OEM','GBP') THEN 2
           ELSE 1
         END AS depth_weight
  FROM cites c
  JOIN targets t ON t.cite_id = c.cite_id
)
SELECT
  tenant_id,
  engine,
  source_domain,
  SUM(depth_weight)::int AS citation_depth_score,
  COUNT(*)::int AS link_count,
  (SUM(depth_weight)::numeric / GREATEST(COUNT(*),1))::numeric(6,2) AS avg_depth_weight
FROM weighted
GROUP BY tenant_id, engine, source_domain
WITH NO DATA;

-- 3. SEO Metrics with Confidence Intervals
CREATE TABLE IF NOT EXISTS seo_variant_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  product_id text NOT NULL,
  variant_id text NOT NULL,
  as_of timestamptz DEFAULT now(),
  impressions bigint DEFAULT 0,
  clicks bigint DEFAULT 0,
  conversions bigint DEFAULT 0,
  revenue numeric(12,2),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS seo_variant_priors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  variant_id text UNIQUE NOT NULL,
  a float DEFAULT 1,
  b float DEFAULT 1,
  updated_at timestamptz DEFAULT now()
);

-- 4. Fee Taxonomy and Offer Integrity
CREATE TABLE IF NOT EXISTS fee_taxonomy (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  label text NOT NULL,
  disclosure_required boolean DEFAULT true,
  allowed_on_new boolean DEFAULT true,
  allowed_on_used boolean DEFAULT true,
  max_usd numeric(10,2),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS offer_integrity_audits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  vin text,
  vdp_url text,
  engine text,
  advertised_price numeric(12,2),
  engine_price numeric(12,2),
  otd_price_engine numeric(12,2),
  delta_price numeric(12,2),
  undisclosed_fees jsonb,
  severity int,
  rule text,
  details jsonb,
  created_at timestamptz DEFAULT now()
);

-- 5. OCI Live Meter View
CREATE MATERIALIZED VIEW IF NOT EXISTS v_oci_live AS
WITH latest_avi AS (
  SELECT DISTINCT ON (tenant_id) tenant_id, elasticity_usd_per_point
  FROM avi_reports ORDER BY tenant_id, as_of DESC
),
viol AS (
  SELECT tenant_id,
         COUNT(*) FILTER (WHERE severity=3) AS sev3,
         COUNT(*) FILTER (WHERE severity=2) AS sev2,
         COUNT(*) FILTER (WHERE severity=1) AS sev1
  FROM offer_integrity_audits
  WHERE created_at > now() - interval '28 days'
  GROUP BY tenant_id
)
SELECT v.tenant_id,
       COALESCE(a.elasticity_usd_per_point, 250) AS elasticity_usd_per_point,
       (COALESCE(a.elasticity_usd_per_point,250) * (v.sev3*2.0 + v.sev2*1.0 + v.sev1*0.5))::numeric(12,2) AS oci_28d_usd,
       v.sev1, v.sev2, v.sev3,
       now() AS computed_at
FROM viol v
LEFT JOIN latest_avi a ON a.tenant_id = v.tenant_id
WITH NO DATA;

-- 6. Indexes
CREATE INDEX IF NOT EXISTS idx_policy_configs_tenant ON policy_configs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_policy_versions_tenant_version ON policy_config_versions(tenant_id, version DESC);
CREATE INDEX IF NOT EXISTS idx_v_hours_reliability_tenant ON v_hours_reliability(tenant_id);
CREATE INDEX IF NOT EXISTS idx_v_cdi_tenant_engine ON v_citation_depth_index(tenant_id, engine);
CREATE INDEX IF NOT EXISTS idx_v_oci_live_tenant ON v_oci_live(tenant_id);
CREATE INDEX IF NOT EXISTS idx_seo_metrics_tenant_variant ON seo_variant_metrics(tenant_id, variant_id);
CREATE INDEX IF NOT EXISTS idx_offer_integrity_tenant ON offer_integrity_audits(tenant_id, created_at DESC);

-- 7. RLS Policies
ALTER TABLE policy_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE policy_config_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_variant_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_variant_priors ENABLE ROW LEVEL SECURITY;
ALTER TABLE offer_integrity_audits ENABLE ROW LEVEL SECURITY;

CREATE POLICY policy_configs_tenant_isolation ON policy_configs
  FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

CREATE POLICY policy_config_versions_tenant_isolation ON policy_config_versions
  FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

CREATE POLICY seo_metrics_tenant_isolation ON seo_variant_metrics
  FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

CREATE POLICY seo_priors_tenant_isolation ON seo_variant_priors
  FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

CREATE POLICY offer_integrity_tenant_isolation ON offer_integrity_audits
  FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- 8. Insert default fee taxonomy
INSERT INTO fee_taxonomy (code,label,disclosure_required,allowed_on_new,allowed_on_used,max_usd) VALUES
('DOC_FEE','Document Fee',true,true,true,999),
('DEST','Destination',true,true,false,3995),
('ADM','Additional Dealer Markup',true,true,true,NULL),
('ETCH','VIN Etch',true,true,true,699),
('NITRO','Nitrogen',true,true,true,399),
('ACCESSORY','Dealer Accessories',true,true,true,NULL)
ON CONFLICT (code) DO NOTHING;

-- 9. Refresh materialized views
REFRESH MATERIALIZED VIEW CONCURRENTLY v_hours_reliability;
REFRESH MATERIALIZED VIEW CONCURRENTLY v_citation_depth_index;
REFRESH MATERIALIZED VIEW CONCURRENTLY v_oci_live;
