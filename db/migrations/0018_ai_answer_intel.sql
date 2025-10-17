CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS ai_answer_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  engine text NOT NULL CHECK (engine IN ('google_sge','perplexity','gemini','chatgpt','copilot','claude')),
  query text NOT NULL,
  appeared boolean NOT NULL,
  cited boolean NOT NULL,
  clicks_est numeric(6,2) NULL,
  sample_size int NOT NULL DEFAULT 1,
  observed_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ai_snippet_share (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  engine text NOT NULL,
  snippet_type text NOT NULL CHECK (snippet_type IN ('overview','snippet','paa','featured','inline_citation')),
  share_pct numeric(5,2) NOT NULL,
  window_days int NOT NULL DEFAULT 28,
  as_of date NOT NULL DEFAULT CURRENT_DATE
);

CREATE MATERIALIZED VIEW IF NOT EXISTS ai_zero_click_impact_mv AS
SELECT
  tenant_id,
  CURRENT_DATE AS as_of,
  28 AS window_days,
  (SUM(CASE WHEN appeared THEN 1 ELSE 0 END)::numeric / NULLIF(COUNT(*),0)) * 100 AS aiv_pct,
  (SUM(CASE WHEN appeared AND cited THEN 1 ELSE 0 END)::numeric / NULLIF(SUM(CASE WHEN appeared THEN 1 ELSE 0 END),0)) * 100 AS citation_share_pct,
  GREATEST(0, ((SUM(CASE WHEN appeared THEN 1 ELSE 0 END)::numeric / NULLIF(COUNT(*),0)) * 0.345) * 100
           * (1 - (COALESCE(AVG(CASE WHEN appeared THEN (CASE WHEN cited THEN 1 ELSE 0 END) END),0)))) AS zero_click_siphon_pct
FROM ai_answer_events
WHERE observed_at >= NOW() - INTERVAL '28 days'
GROUP BY tenant_id;

CREATE INDEX IF NOT EXISTS idx_ai_answer_events_tenant_time ON ai_answer_events (tenant_id, observed_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_snippet_share_tenant_date ON ai_snippet_share (tenant_id, as_of DESC);