-- filename: db/migrations/0010_view_hours_reliability.sql
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

CREATE INDEX IF NOT EXISTS idx_v_hours_reliability_tenant ON v_hours_reliability(tenant_id);
