-- filename: db/migrations/0011_view_citation_depth_index.sql
-- Depth weights: Homepage=1, SRP=2, VDP=3, OEM/GBP=2 (tune later)
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

CREATE INDEX IF NOT EXISTS idx_v_cdi_tenant_engine ON v_citation_depth_index(tenant_id, engine);
