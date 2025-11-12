-- AI Visibility Testing Historical Storage
-- Stores results from ChatGPT, Claude, Perplexity, and Gemini tests

-- Main table for AI visibility test runs
CREATE TABLE IF NOT EXISTS ai_visibility_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id TEXT NOT NULL,
  dealer_name TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,

  -- Aggregated scores
  overall_score INTEGER NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
  chatgpt_score INTEGER NOT NULL CHECK (chatgpt_score >= 0 AND chatgpt_score <= 100),
  claude_score INTEGER NOT NULL CHECK (claude_score >= 0 AND claude_score <= 100),
  perplexity_score INTEGER NOT NULL CHECK (perplexity_score >= 0 AND perplexity_score <= 100),
  gemini_score INTEGER NOT NULL CHECK (gemini_score >= 0 AND gemini_score <= 100),

  -- Metrics
  mention_rate INTEGER NOT NULL CHECK (mention_rate >= 0 AND mention_rate <= 100),
  avg_position DECIMAL(4, 1),
  avg_sentiment DECIMAL(3, 2) CHECK (avg_sentiment >= -1 AND avg_sentiment <= 1),
  avg_accuracy INTEGER CHECK (avg_accuracy >= 0 AND avg_accuracy <= 100),
  zero_click_rate INTEGER CHECK (zero_click_rate >= 0 AND zero_click_rate <= 100),

  -- Status
  status TEXT NOT NULL CHECK (status IN ('excellent', 'good', 'fair', 'poor')),
  test_type TEXT NOT NULL CHECK (test_type IN ('quick', 'comprehensive')),

  -- Metadata
  queries_tested INTEGER NOT NULL DEFAULT 0,
  total_tests INTEGER NOT NULL DEFAULT 0,
  avg_latency_ms INTEGER,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Individual platform test results (detailed)
CREATE TABLE IF NOT EXISTS ai_platform_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID NOT NULL REFERENCES ai_visibility_tests(id) ON DELETE CASCADE,

  platform TEXT NOT NULL CHECK (platform IN ('chatgpt', 'claude', 'perplexity', 'gemini')),
  query TEXT NOT NULL,

  -- Results
  mentioned BOOLEAN NOT NULL DEFAULT FALSE,
  position INTEGER,
  sentiment TEXT NOT NULL CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  accuracy INTEGER NOT NULL CHECK (accuracy >= 0 AND accuracy <= 100),

  -- Response data
  response_snippet TEXT,
  full_response TEXT,

  -- Performance
  latency_ms INTEGER NOT NULL,

  -- Timestamps
  tested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_visibility_dealer ON ai_visibility_tests(dealer_id);
CREATE INDEX IF NOT EXISTS idx_ai_visibility_created ON ai_visibility_tests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_visibility_dealer_created ON ai_visibility_tests(dealer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_platform_results_test ON ai_platform_results(test_id);
CREATE INDEX IF NOT EXISTS idx_ai_platform_results_platform ON ai_platform_results(platform);

-- View: Latest test results per dealer
CREATE OR REPLACE VIEW latest_ai_visibility_tests AS
SELECT DISTINCT ON (dealer_id)
  id,
  dealer_id,
  dealer_name,
  city,
  state,
  overall_score,
  chatgpt_score,
  claude_score,
  perplexity_score,
  gemini_score,
  mention_rate,
  avg_position,
  avg_sentiment,
  avg_accuracy,
  zero_click_rate,
  status,
  test_type,
  created_at
FROM ai_visibility_tests
ORDER BY dealer_id, created_at DESC;

-- View: AI visibility trends (compare latest 2 tests)
CREATE OR REPLACE VIEW ai_visibility_trends AS
WITH ranked_tests AS (
  SELECT
    *,
    ROW_NUMBER() OVER (PARTITION BY dealer_id ORDER BY created_at DESC) as rn
  FROM ai_visibility_tests
)
SELECT
  dealer_id,
  dealer_name,

  -- Latest scores
  MAX(overall_score) FILTER (WHERE rn = 1) as latest_overall,
  MAX(chatgpt_score) FILTER (WHERE rn = 1) as latest_chatgpt,
  MAX(claude_score) FILTER (WHERE rn = 1) as latest_claude,
  MAX(perplexity_score) FILTER (WHERE rn = 1) as latest_perplexity,
  MAX(gemini_score) FILTER (WHERE rn = 1) as latest_gemini,

  -- Previous scores
  MAX(overall_score) FILTER (WHERE rn = 2) as previous_overall,
  MAX(chatgpt_score) FILTER (WHERE rn = 2) as previous_chatgpt,
  MAX(claude_score) FILTER (WHERE rn = 2) as previous_claude,
  MAX(perplexity_score) FILTER (WHERE rn = 2) as previous_perplexity,
  MAX(gemini_score) FILTER (WHERE rn = 2) as previous_gemini,

  -- Trends
  CASE
    WHEN MAX(overall_score) FILTER (WHERE rn = 1) > MAX(overall_score) FILTER (WHERE rn = 2) THEN 'up'
    WHEN MAX(overall_score) FILTER (WHERE rn = 1) < MAX(overall_score) FILTER (WHERE rn = 2) THEN 'down'
    ELSE 'stable'
  END as overall_trend,

  CASE
    WHEN MAX(mention_rate) FILTER (WHERE rn = 1) > MAX(mention_rate) FILTER (WHERE rn = 2) THEN 'up'
    WHEN MAX(mention_rate) FILTER (WHERE rn = 1) < MAX(mention_rate) FILTER (WHERE rn = 2) THEN 'down'
    ELSE 'stable'
  END as mention_rate_trend,

  -- Latest timestamp
  MAX(created_at) FILTER (WHERE rn = 1) as latest_test_at
FROM ranked_tests
WHERE rn <= 2
GROUP BY dealer_id, dealer_name;

-- Function: Get latest AI visibility test with trends
CREATE OR REPLACE FUNCTION get_latest_ai_visibility(p_dealer_id TEXT)
RETURNS TABLE (
  id UUID,
  dealer_id TEXT,
  dealer_name TEXT,
  city TEXT,
  state TEXT,
  overall_score INTEGER,
  chatgpt_score INTEGER,
  claude_score INTEGER,
  perplexity_score INTEGER,
  gemini_score INTEGER,
  mention_rate INTEGER,
  avg_position DECIMAL,
  avg_sentiment DECIMAL,
  avg_accuracy INTEGER,
  zero_click_rate INTEGER,
  status TEXT,
  overall_trend TEXT,
  mention_rate_trend TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.id,
    t.dealer_id,
    t.dealer_name,
    t.city,
    t.state,
    t.overall_score,
    t.chatgpt_score,
    t.claude_score,
    t.perplexity_score,
    t.gemini_score,
    t.mention_rate,
    t.avg_position,
    t.avg_sentiment,
    t.avg_accuracy,
    t.zero_click_rate,
    t.status,
    tr.overall_trend::TEXT,
    tr.mention_rate_trend::TEXT,
    t.created_at
  FROM ai_visibility_tests t
  LEFT JOIN ai_visibility_trends tr ON tr.dealer_id = t.dealer_id
  WHERE t.dealer_id = p_dealer_id
  ORDER BY t.created_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get AI visibility statistics over time period
CREATE OR REPLACE FUNCTION get_ai_visibility_stats(
  p_dealer_id TEXT,
  p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
  avg_overall_score DECIMAL,
  max_overall_score INTEGER,
  min_overall_score INTEGER,
  avg_mention_rate DECIMAL,
  avg_zero_click_rate DECIMAL,
  avg_sentiment DECIMAL,
  test_count INTEGER,
  date_range TSTZRANGE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    AVG(overall_score)::DECIMAL as avg_overall_score,
    MAX(overall_score) as max_overall_score,
    MIN(overall_score) as min_overall_score,
    AVG(mention_rate)::DECIMAL as avg_mention_rate,
    AVG(zero_click_rate)::DECIMAL as avg_zero_click_rate,
    AVG(avg_sentiment)::DECIMAL as avg_sentiment,
    COUNT(*)::INTEGER as test_count,
    TSTZRANGE(MIN(created_at), MAX(created_at), '[]') as date_range
  FROM ai_visibility_tests
  WHERE dealer_id = p_dealer_id
    AND created_at >= NOW() - (p_days || ' days')::INTERVAL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get platform comparison stats
CREATE OR REPLACE FUNCTION get_platform_comparison(p_dealer_id TEXT)
RETURNS TABLE (
  platform TEXT,
  avg_score DECIMAL,
  mention_rate DECIMAL,
  avg_position DECIMAL,
  positive_sentiment_rate DECIMAL,
  test_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  WITH platform_stats AS (
    SELECT
      pr.platform,
      AVG(CASE
        WHEN pr.platform = 'chatgpt' THEN t.chatgpt_score
        WHEN pr.platform = 'claude' THEN t.claude_score
        WHEN pr.platform = 'perplexity' THEN t.perplexity_score
        WHEN pr.platform = 'gemini' THEN t.gemini_score
      END) as avg_score,
      AVG(CASE WHEN pr.mentioned THEN 1.0 ELSE 0.0 END) * 100 as mention_rate,
      AVG(pr.position) as avg_position,
      AVG(CASE WHEN pr.sentiment = 'positive' THEN 1.0 ELSE 0.0 END) * 100 as positive_rate,
      COUNT(*) as test_count
    FROM ai_platform_results pr
    JOIN ai_visibility_tests t ON t.id = pr.test_id
    WHERE t.dealer_id = p_dealer_id
    GROUP BY pr.platform
  )
  SELECT
    platform::TEXT,
    ROUND(avg_score, 1) as avg_score,
    ROUND(mention_rate, 1) as mention_rate,
    ROUND(avg_position, 1) as avg_position,
    ROUND(positive_rate, 1) as positive_sentiment_rate,
    test_count::INTEGER
  FROM platform_stats
  ORDER BY avg_score DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_ai_visibility_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ai_visibility_tests_updated_at
  BEFORE UPDATE ON ai_visibility_tests
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_visibility_updated_at();

-- Row Level Security (RLS)
ALTER TABLE ai_visibility_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_platform_results ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own dealer's tests
CREATE POLICY ai_visibility_tests_select ON ai_visibility_tests
  FOR SELECT
  USING (
    dealer_id = current_setting('app.current_dealer_id', true)
    OR current_setting('app.is_admin', true)::boolean = true
  );

-- Policy: Service role can insert tests
CREATE POLICY ai_visibility_tests_insert ON ai_visibility_tests
  FOR INSERT
  WITH CHECK (true);

-- Policy: Users can view their own dealer's platform results
CREATE POLICY ai_platform_results_select ON ai_platform_results
  FOR SELECT
  USING (
    test_id IN (
      SELECT id FROM ai_visibility_tests
      WHERE dealer_id = current_setting('app.current_dealer_id', true)
    )
    OR current_setting('app.is_admin', true)::boolean = true
  );

-- Policy: Service role can insert platform results
CREATE POLICY ai_platform_results_insert ON ai_platform_results
  FOR INSERT
  WITH CHECK (true);

-- Sample data for demo tenant
INSERT INTO ai_visibility_tests (
  dealer_id,
  dealer_name,
  city,
  state,
  overall_score,
  chatgpt_score,
  claude_score,
  perplexity_score,
  gemini_score,
  mention_rate,
  avg_position,
  avg_sentiment,
  avg_accuracy,
  zero_click_rate,
  status,
  test_type,
  queries_tested,
  total_tests,
  avg_latency_ms,
  created_at
) VALUES
  -- Test 1: Baseline
  (
    'demo-tenant',
    'Germain Toyota of Naples',
    'Naples',
    'FL',
    72,
    75,
    70,
    68,
    74,
    65,
    2.3,
    0.45,
    68,
    58,
    'good',
    'comprehensive',
    10,
    40,
    1850,
    NOW() - INTERVAL '7 days'
  ),
  -- Test 2: Improved
  (
    'demo-tenant',
    'Germain Toyota of Naples',
    'Naples',
    'FL',
    78,
    82,
    76,
    74,
    80,
    72,
    1.9,
    0.62,
    74,
    64,
    'good',
    'comprehensive',
    10,
    40,
    1720,
    NOW() - INTERVAL '1 day'
  );

-- Insert sample platform results for first test
INSERT INTO ai_platform_results (
  test_id,
  platform,
  query,
  mentioned,
  position,
  sentiment,
  accuracy,
  response_snippet,
  latency_ms,
  tested_at
) VALUES
  (
    (SELECT id FROM ai_visibility_tests WHERE dealer_id = 'demo-tenant' ORDER BY created_at LIMIT 1),
    'chatgpt',
    'Best car dealership in Naples, FL',
    true,
    2,
    'positive',
    75,
    'Germain Toyota of Naples is a well-established dealership known for excellent customer service...',
    1450,
    NOW() - INTERVAL '7 days'
  ),
  (
    (SELECT id FROM ai_visibility_tests WHERE dealer_id = 'demo-tenant' ORDER BY created_at LIMIT 1),
    'claude',
    'Best car dealership in Naples, FL',
    true,
    3,
    'neutral',
    70,
    'There are several reputable dealerships in Naples. Germain Toyota is one option...',
    1350,
    NOW() - INTERVAL '7 days'
  );

-- Grant permissions
GRANT SELECT ON ai_visibility_tests TO anon, authenticated;
GRANT SELECT ON ai_platform_results TO anon, authenticated;
GRANT SELECT ON latest_ai_visibility_tests TO anon, authenticated;
GRANT SELECT ON ai_visibility_trends TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_latest_ai_visibility TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_ai_visibility_stats TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_platform_comparison TO anon, authenticated;

-- Comments for documentation
COMMENT ON TABLE ai_visibility_tests IS 'Stores aggregated AI visibility test results across ChatGPT, Claude, Perplexity, and Gemini';
COMMENT ON TABLE ai_platform_results IS 'Stores individual platform test results with full response data';
COMMENT ON COLUMN ai_visibility_tests.overall_score IS 'Composite AI visibility score (0-100)';
COMMENT ON COLUMN ai_visibility_tests.mention_rate IS 'Percentage of queries where dealership was mentioned';
COMMENT ON COLUMN ai_visibility_tests.zero_click_rate IS 'Percentage of queries answered without external links';
COMMENT ON FUNCTION get_latest_ai_visibility IS 'Returns most recent AI visibility test with trend data';
COMMENT ON FUNCTION get_ai_visibility_stats IS 'Returns statistical aggregates over specified time period';
COMMENT ON FUNCTION get_platform_comparison IS 'Returns per-platform performance comparison';
