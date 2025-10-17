-- OCI Live Materialized View
-- DealershipAI - Real-time Opportunity Cost of Inaction

-- Opportunity Cost of Inaction ($) from open violations x elasticity
CREATE MATERIALIZED VIEW IF NOT EXISTS v_oci_live AS
WITH latest_avi AS (
  SELECT DISTINCT ON (tenant_id) tenant_id, elasticity_usd_per_point
  FROM avi_reports ORDER BY tenant_id, as_of DESC
),
viol AS (
  SELECT tenant_id,
         COUNT(*) FILTER (WHERE severity=3 AND status='open') AS sev3,
         COUNT(*) FILTER (WHERE severity=2 AND status='open') AS sev2,
         COUNT(*) FILTER (WHERE severity=1 AND status='open') AS sev1,
         COUNT(*) FILTER (WHERE status='open') AS total_open
  FROM offer_integrity_audits
  WHERE created_at > now() - interval '28 days'
  GROUP BY tenant_id
)
SELECT v.tenant_id,
       COALESCE(a.elasticity_usd_per_point, 250) AS elasticity_usd_per_point,
       (COALESCE(a.elasticity_usd_per_point,250) * (v.sev3*2.0 + v.sev2*1.0 + v.sev1*0.5))::numeric(12,2) AS oci_28d_usd,
       v.sev1, v.sev2, v.sev3, v.total_open,
       now() AS computed_at
FROM viol v
LEFT JOIN latest_avi a ON a.tenant_id = v.tenant_id
WITH NO DATA;

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_v_oci_live_tenant ON v_oci_live(tenant_id);

-- Create function to refresh the materialized view
CREATE OR REPLACE FUNCTION refresh_oci_live()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW v_oci_live;
END;
$$ LANGUAGE plpgsql;

-- Create function to get OCI for a specific tenant
CREATE OR REPLACE FUNCTION get_oci_live(p_tenant_id uuid)
RETURNS TABLE (
  tenant_id uuid,
  elasticity_usd_per_point numeric,
  oci_28d_usd numeric,
  sev1 bigint,
  sev2 bigint,
  sev3 bigint,
  total_open bigint,
  computed_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM v_oci_live 
  WHERE v_oci_live.tenant_id = p_tenant_id;
END;
$$ LANGUAGE plpgsql;