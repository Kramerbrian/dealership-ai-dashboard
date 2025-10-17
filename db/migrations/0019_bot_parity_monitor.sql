-- Bot Parity Monitor - Track differences between search engine bots
CREATE TABLE IF NOT EXISTS bot_parity_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  url text NOT NULL,
  check_date timestamptz NOT NULL DEFAULT now(),
  googlebot_content_hash text,
  gptbot_content_hash text,
  perplexitybot_content_hash text,
  googlebot_status_code int,
  gptbot_status_code int,
  perplexitybot_status_code int,
  googlebot_response_time_ms int,
  gptbot_response_time_ms int,
  perplexitybot_response_time_ms int,
  content_differences jsonb, -- stores diff details
  parity_score numeric(5,2), -- 0-100 score
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bot_user_agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bot_name text NOT NULL UNIQUE,
  user_agent text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Insert known bot user agents
INSERT INTO bot_user_agents (bot_name, user_agent) VALUES
  ('googlebot', 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'),
  ('gptbot', 'GPTBot'),
  ('perplexitybot', 'PerplexityBot'),
  ('bingbot', 'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)'),
  ('claudebot', 'ClaudeBot')
ON CONFLICT (bot_name) DO NOTHING;

-- Materialized view for bot parity analytics
CREATE MATERIALIZED VIEW bot_parity_analytics_mv AS
SELECT 
  tenant_id,
  DATE_TRUNC('day', check_date) as check_day,
  COUNT(*) as total_checks,
  AVG(parity_score) as avg_parity_score,
  COUNT(CASE WHEN parity_score < 80 THEN 1 END) as low_parity_count,
  COUNT(CASE WHEN googlebot_status_code != 200 THEN 1 END) as googlebot_errors,
  COUNT(CASE WHEN gptbot_status_code != 200 THEN 1 END) as gptbot_errors,
  COUNT(CASE WHEN perplexitybot_status_code != 200 THEN 1 END) as perplexitybot_errors,
  AVG(googlebot_response_time_ms) as avg_googlebot_response_time,
  AVG(gptbot_response_time_ms) as avg_gptbot_response_time,
  AVG(perplexitybot_response_time_ms) as avg_perplexitybot_response_time
FROM bot_parity_checks
WHERE check_date >= NOW() - INTERVAL '30 days'
GROUP BY tenant_id, DATE_TRUNC('day', check_date);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_bot_parity_checks_tenant_date ON bot_parity_checks (tenant_id, check_date DESC);
CREATE INDEX IF NOT EXISTS idx_bot_parity_checks_parity_score ON bot_parity_checks (parity_score);
CREATE INDEX IF NOT EXISTS idx_bot_parity_analytics_mv_tenant_day ON bot_parity_analytics_mv (tenant_id, check_day DESC);

-- Function to refresh the materialized view
CREATE OR REPLACE FUNCTION refresh_bot_parity_analytics()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY bot_parity_analytics_mv;
END;
$$ LANGUAGE plpgsql;
