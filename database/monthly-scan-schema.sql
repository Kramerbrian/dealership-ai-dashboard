-- DealershipAI Monthly Scan System Database Schema
-- Enhanced schema for competitive intelligence and monthly scanning

-- Dealers table (enhanced)
CREATE TABLE dealers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  website TEXT NOT NULL UNIQUE,
  brand TEXT, -- 'Toyota', 'Ford', etc.
  city TEXT,
  state TEXT,
  tier VARCHAR(20) DEFAULT 'free' CHECK (tier IN ('free', 'pro', 'enterprise')),
  locations INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Monthly scans table (one per dealer per month)
CREATE TABLE monthly_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id UUID REFERENCES dealers(id) ON DELETE CASCADE,
  scan_date DATE NOT NULL,
  visibility_score INTEGER CHECK (visibility_score >= 0 AND visibility_score <= 100),
  total_mentions INTEGER DEFAULT 0,
  avg_rank DECIMAL(5,2),
  sentiment_score DECIMAL(3,2) CHECK (sentiment_score >= -1 AND sentiment_score <= 1),
  total_citations INTEGER DEFAULT 0,
  scan_status VARCHAR(20) DEFAULT 'pending' CHECK (scan_status IN ('pending', 'processing', 'completed', 'failed')),
  processing_time INTEGER, -- seconds
  cost_usd DECIMAL(10,4) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(dealer_id, scan_date)
);

-- Platform results (detailed breakdown per platform)
CREATE TABLE platform_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id UUID REFERENCES monthly_scans(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('chatgpt', 'claude', 'perplexity', 'gemini', 'google-sge', 'grok')),
  mentions INTEGER DEFAULT 0,
  avg_rank DECIMAL(5,2),
  sentiment DECIMAL(3,2) CHECK (sentiment >= -1 AND sentiment <= 1),
  citations JSONB, -- Array of source URLs and details
  response_time INTEGER, -- milliseconds
  tokens_used INTEGER,
  cost_usd DECIMAL(10,4) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Queries tracked (50 top dealer queries)
CREATE TABLE tracked_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query_text TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL CHECK (category IN ('research', 'comparison', 'purchase', 'service')),
  intent_type TEXT NOT NULL CHECK (intent_type IN ('informational', 'navigational', 'transactional')),
  monthly_volume INTEGER DEFAULT 0,
  priority INTEGER DEFAULT 1 CHECK (priority >= 1 AND priority <= 5),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Query results (which dealers appear for which queries)
CREATE TABLE query_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query_id UUID REFERENCES tracked_queries(id) ON DELETE CASCADE,
  dealer_id UUID REFERENCES dealers(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  rank INTEGER,
  mention_text TEXT,
  sentiment DECIMAL(3,2) CHECK (sentiment >= -1 AND sentiment <= 1),
  scan_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(query_id, dealer_id, platform, scan_date)
);

-- Scan batches (for queue management)
CREATE TABLE scan_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_number INTEGER NOT NULL,
  total_batches INTEGER NOT NULL,
  dealers_count INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scan queue (for processing order)
CREATE TABLE scan_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID REFERENCES scan_batches(id) ON DELETE CASCADE,
  dealer_id UUID REFERENCES dealers(id) ON DELETE CASCADE,
  priority INTEGER DEFAULT 1,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  next_retry_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- API usage tracking (for cost monitoring)
CREATE TABLE api_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  tokens_input INTEGER DEFAULT 0,
  tokens_output INTEGER DEFAULT 0,
  cost_usd DECIMAL(10,6) DEFAULT 0,
  response_time INTEGER, -- milliseconds
  success BOOLEAN DEFAULT true,
  error_code VARCHAR(20),
  scan_id UUID REFERENCES monthly_scans(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Competitor analysis (derived from scan data)
CREATE TABLE competitor_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id UUID REFERENCES dealers(id) ON DELETE CASCADE,
  competitor_id UUID REFERENCES dealers(id) ON DELETE CASCADE,
  scan_date DATE NOT NULL,
  visibility_gap INTEGER, -- How much better/worse than competitor
  mention_gap INTEGER,
  rank_gap DECIMAL(5,2),
  market_share_estimate DECIMAL(5,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(dealer_id, competitor_id, scan_date)
);

-- Performance indexes
CREATE INDEX idx_monthly_scans_date ON monthly_scans(scan_date DESC);
CREATE INDEX idx_monthly_scans_dealer ON monthly_scans(dealer_id, scan_date DESC);
CREATE INDEX idx_platform_results_scan ON platform_results(scan_id);
CREATE INDEX idx_platform_results_platform ON platform_results(platform, created_at DESC);
CREATE INDEX idx_query_results_dealer ON query_results(dealer_id, scan_date DESC);
CREATE INDEX idx_query_results_query ON query_results(query_id, scan_date DESC);
CREATE INDEX idx_scan_queue_status ON scan_queue(status, priority DESC);
CREATE INDEX idx_api_usage_platform ON api_usage(platform, created_at DESC);
CREATE INDEX idx_competitor_analysis_dealer ON competitor_analysis(dealer_id, scan_date DESC);

-- Views for analytics
CREATE VIEW monthly_leaderboard AS
SELECT 
  d.id,
  d.name,
  d.brand,
  d.city,
  d.state,
  d.tier,
  ms.visibility_score,
  ms.total_mentions,
  ms.avg_rank,
  ms.sentiment_score,
  ms.total_citations,
  ms.scan_date,
  ROW_NUMBER() OVER (ORDER BY ms.visibility_score DESC) as rank
FROM dealers d
INNER JOIN monthly_scans ms ON d.id = ms.dealer_id
WHERE ms.scan_status = 'completed'
ORDER BY ms.visibility_score DESC;

CREATE VIEW platform_performance AS
SELECT 
  pr.platform,
  COUNT(DISTINCT pr.scan_id) as total_scans,
  AVG(pr.mentions) as avg_mentions,
  AVG(pr.avg_rank) as avg_rank,
  AVG(pr.sentiment) as avg_sentiment,
  SUM(pr.cost_usd) as total_cost,
  AVG(pr.response_time) as avg_response_time
FROM platform_results pr
WHERE pr.created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY pr.platform
ORDER BY total_scans DESC;

CREATE VIEW dealer_trends AS
SELECT 
  d.id,
  d.name,
  ms.scan_date,
  ms.visibility_score,
  LAG(ms.visibility_score) OVER (PARTITION BY d.id ORDER BY ms.scan_date) as prev_score,
  ms.visibility_score - LAG(ms.visibility_score) OVER (PARTITION BY d.id ORDER BY ms.scan_date) as score_change,
  ROUND(
    (ms.visibility_score - LAG(ms.visibility_score) OVER (PARTITION BY d.id ORDER BY ms.scan_date)) / 
    NULLIF(LAG(ms.visibility_score) OVER (PARTITION BY d.id ORDER BY ms.scan_date), 0) * 100, 2
  ) as percent_change
FROM dealers d
INNER JOIN monthly_scans ms ON d.id = ms.dealer_id
WHERE ms.scan_status = 'completed'
ORDER BY d.id, ms.scan_date DESC;

-- Insert top 50 dealer queries
INSERT INTO tracked_queries (query_text, category, intent_type, priority) VALUES
-- Research Intent (20 queries)
('best Toyota dealer near me', 'research', 'informational', 5),
('Honda dealer reviews', 'research', 'informational', 5),
('most reliable car dealership', 'research', 'informational', 5),
('should I buy used or new car', 'research', 'informational', 4),
('best time to buy a car', 'research', 'informational', 4),
('car dealership reputation check', 'research', 'informational', 4),
('which car brand is most reliable', 'research', 'informational', 4),
('car dealer customer service ratings', 'research', 'informational', 4),
('best car dealership for first time buyer', 'research', 'informational', 4),
('car dealer warranty comparison', 'research', 'informational', 3),
('most trusted car dealership', 'research', 'informational', 3),
('car dealer financing options', 'research', 'informational', 3),
('best car dealership for trade-ins', 'research', 'informational', 3),
('car dealer maintenance services', 'research', 'informational', 3),
('most honest car dealership', 'research', 'informational', 3),
('car dealer price negotiation tips', 'research', 'informational', 3),
('best car dealership for luxury cars', 'research', 'informational', 3),
('car dealer extended warranty', 'research', 'informational', 3),
('most recommended car dealership', 'research', 'informational', 3),
('car dealer service department quality', 'research', 'informational', 3),

-- Comparison Intent (15 queries)
('Toyota vs Honda dealer comparison', 'comparison', 'informational', 5),
('certified pre-owned vs new car', 'comparison', 'informational', 4),
('dealer financing vs bank loan', 'comparison', 'informational', 4),
('Ford vs Chevy dealer quality', 'comparison', 'informational', 4),
('luxury vs economy car dealership', 'comparison', 'informational', 4),
('used car dealer vs new car dealer', 'comparison', 'informational', 4),
('independent vs franchise dealer', 'comparison', 'informational', 4),
('car dealer vs private seller', 'comparison', 'informational', 4),
('lease vs buy from dealer', 'comparison', 'informational', 4),
('car dealer vs carmax', 'comparison', 'informational', 3),
('dealership vs online car buying', 'comparison', 'informational', 3),
('car dealer vs carvana', 'comparison', 'informational', 3),
('franchise vs independent service', 'comparison', 'informational', 3),
('car dealer vs auction', 'comparison', 'informational', 3),
('dealership vs broker', 'comparison', 'informational', 3),

-- Purchase Intent (15 queries)
('Ford F-150 inventory near me', 'purchase', 'transactional', 5),
('best lease deals Toyota', 'purchase', 'transactional', 5),
('Honda dealer trade-in offers', 'purchase', 'transactional', 5),
('BMW dealer financing rates', 'purchase', 'transactional', 4),
('Chevy Silverado dealer inventory', 'purchase', 'transactional', 4),
('Audi dealer lease specials', 'purchase', 'transactional', 4),
('Mercedes dealer certified pre-owned', 'purchase', 'transactional', 4),
('Nissan dealer cash back offers', 'purchase', 'transactional', 4),
('Hyundai dealer warranty deals', 'purchase', 'transactional', 4),
('Kia dealer financing approval', 'purchase', 'transactional', 4),
('Subaru dealer AWD inventory', 'purchase', 'transactional', 4),
('Mazda dealer CX-5 deals', 'purchase', 'transactional', 4),
('Volkswagen dealer diesel options', 'purchase', 'transactional', 4),
('Infiniti dealer luxury inventory', 'purchase', 'transactional', 4),
('Acura dealer performance models', 'purchase', 'transactional', 4);

-- Functions for scan management
CREATE OR REPLACE FUNCTION create_monthly_scan_batch()
RETURNS UUID AS $$
DECLARE
  batch_id UUID;
  dealer_count INTEGER;
  batch_size INTEGER := 20;
  total_batches INTEGER;
BEGIN
  -- Get total dealer count
  SELECT COUNT(*) INTO dealer_count FROM dealers WHERE tier != 'free';
  
  -- Calculate total batches needed
  total_batches := CEIL(dealer_count::DECIMAL / batch_size);
  
  -- Create batch record
  INSERT INTO scan_batches (batch_number, total_batches, dealers_count, status)
  VALUES (1, total_batches, dealer_count, 'pending')
  RETURNING id INTO batch_id;
  
  -- Create queue entries for each dealer
  INSERT INTO scan_queue (batch_id, dealer_id, priority)
  SELECT 
    batch_id,
    d.id,
    CASE 
      WHEN d.tier = 'enterprise' THEN 1
      WHEN d.tier = 'pro' THEN 2
      ELSE 3
    END
  FROM dealers d
  WHERE d.tier != 'free'
  ORDER BY 
    CASE d.tier 
      WHEN 'enterprise' THEN 1
      WHEN 'pro' THEN 2
      ELSE 3
    END,
    d.created_at;
  
  RETURN batch_id;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate visibility score
CREATE OR REPLACE FUNCTION calculate_visibility_score(
  p_mentions INTEGER,
  p_avg_rank DECIMAL,
  p_sentiment DECIMAL,
  p_citations INTEGER
) RETURNS INTEGER AS $$
DECLARE
  mention_score DECIMAL;
  rank_score DECIMAL;
  sentiment_score DECIMAL;
  citation_score DECIMAL;
  total_score DECIMAL;
BEGIN
  -- Mention score (max 40 points)
  mention_score := LEAST(p_mentions / 10.0 * 40, 40);
  
  -- Rank score (max 30 points)
  rank_score := GREATEST(0, 30 - (p_avg_rank - 1) * 5);
  
  -- Sentiment score (max 20 points)
  sentiment_score := (p_sentiment + 1) / 2 * 20;
  
  -- Citation score (max 10 points)
  citation_score := LEAST(p_citations / 5.0 * 10, 10);
  
  total_score := mention_score + rank_score + sentiment_score + citation_score;
  
  RETURN LEAST(100, GREATEST(0, ROUND(total_score)));
END;
$$ LANGUAGE plpgsql;
