-- DealershipAI Monthly Scan System Database Schema
-- This schema supports the monthly AI visibility scanning system

-- Dealers table (extends existing dealers)
CREATE TABLE IF NOT EXISTS dealers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  website TEXT NOT NULL UNIQUE,
  brand TEXT, -- 'Toyota', 'Ford', etc.
  city TEXT,
  state TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scans table (one per dealer per month)
CREATE TABLE IF NOT EXISTS monthly_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id UUID REFERENCES dealers(id) ON DELETE CASCADE,
  scan_date DATE NOT NULL,
  visibility_score INTEGER CHECK (visibility_score >= 0 AND visibility_score <= 100),
  total_mentions INTEGER DEFAULT 0,
  avg_rank DECIMAL(5,2),
  sentiment_score DECIMAL(3,2) CHECK (sentiment_score >= -1 AND sentiment_score <= 1),
  total_citations INTEGER DEFAULT 0,
  scan_status TEXT DEFAULT 'pending' CHECK (scan_status IN ('pending', 'processing', 'completed', 'failed')),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(dealer_id, scan_date)
);

-- Platform results (detailed breakdown per platform)
CREATE TABLE IF NOT EXISTS platform_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id UUID REFERENCES monthly_scans(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('chatgpt', 'claude', 'perplexity', 'gemini', 'google-sge', 'grok')),
  mentions INTEGER DEFAULT 0,
  avg_rank DECIMAL(5,2),
  sentiment_score DECIMAL(3,2) CHECK (sentiment_score >= -1 AND sentiment_score <= 1),
  citations JSONB DEFAULT '[]'::jsonb, -- Array of source URLs
  response_data JSONB, -- Full AI response for debugging
  processing_time_ms INTEGER,
  api_cost_usd DECIMAL(10,4) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Queries tracked (standardized query set)
CREATE TABLE IF NOT EXISTS tracked_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query_text TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL CHECK (category IN ('research', 'comparison', 'purchase', 'service')),
  intent_type TEXT NOT NULL CHECK (intent_type IN ('informational', 'navigational', 'transactional')),
  monthly_volume INTEGER DEFAULT 0,
  priority INTEGER DEFAULT 1 CHECK (priority >= 1 AND priority <= 5),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Query results (which dealers appear for which queries)
CREATE TABLE IF NOT EXISTS query_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query_id UUID REFERENCES tracked_queries(id) ON DELETE CASCADE,
  dealer_id UUID REFERENCES dealers(id) ON DELETE CASCADE,
  scan_id UUID REFERENCES monthly_scans(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  rank INTEGER CHECK (rank >= 1),
  mentioned BOOLEAN DEFAULT false,
  sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  citation_urls JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scan batches (for queue management)
CREATE TABLE IF NOT EXISTS scan_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_number INTEGER NOT NULL,
  scan_date DATE NOT NULL,
  dealer_ids UUID[] NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error_message TEXT,
  total_cost_usd DECIMAL(10,4) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- API usage tracking (for cost monitoring)
CREATE TABLE IF NOT EXISTS api_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL,
  scan_id UUID REFERENCES monthly_scans(id) ON DELETE CASCADE,
  request_tokens INTEGER DEFAULT 0,
  response_tokens INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  cost_usd DECIMAL(10,4) DEFAULT 0,
  model_used TEXT,
  request_timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_monthly_scans_dealer_date ON monthly_scans(dealer_id, scan_date DESC);
CREATE INDEX IF NOT EXISTS idx_monthly_scans_date ON monthly_scans(scan_date DESC);
CREATE INDEX IF NOT EXISTS idx_platform_results_scan ON platform_results(scan_id);
CREATE INDEX IF NOT EXISTS idx_query_results_dealer_scan ON query_results(dealer_id, scan_id);
CREATE INDEX IF NOT EXISTS idx_query_results_query ON query_results(query_id);
CREATE INDEX IF NOT EXISTS idx_scan_batches_date ON scan_batches(scan_date DESC);
CREATE INDEX IF NOT EXISTS idx_api_usage_platform ON api_usage(platform, request_timestamp);

-- Insert default tracked queries
INSERT INTO tracked_queries (query_text, category, intent_type, priority) VALUES
-- Research intent (20 queries)
('best Toyota dealer near me', 'research', 'informational', 5),
('Honda dealer reviews', 'research', 'informational', 5),
('most reliable car dealership', 'research', 'informational', 4),
('should I buy used or new car', 'research', 'informational', 4),
('best time to buy a car', 'research', 'informational', 4),
('car dealership reputation check', 'research', 'informational', 3),
('certified pre-owned car benefits', 'research', 'informational', 3),
('car dealer financing options', 'research', 'informational', 3),
('warranty coverage comparison', 'research', 'informational', 3),
('car maintenance costs by brand', 'research', 'informational', 3),
('electric vs hybrid car comparison', 'research', 'informational', 3),
('car insurance requirements', 'research', 'informational', 2),
('vehicle registration process', 'research', 'informational', 2),
('car safety ratings 2024', 'research', 'informational', 2),
('fuel efficiency comparison', 'research', 'informational', 2),
('car depreciation rates', 'research', 'informational', 2),
('lease vs buy calculator', 'research', 'informational', 2),
('car loan interest rates', 'research', 'informational', 2),
('vehicle inspection requirements', 'research', 'informational', 2),
('car ownership costs', 'research', 'informational', 2),

-- Comparison intent (15 queries)
('Toyota vs Honda dealer comparison', 'comparison', 'informational', 4),
('certified pre-owned vs new', 'comparison', 'informational', 4),
('dealer financing vs bank loan', 'comparison', 'informational', 3),
('BMW vs Mercedes dealer experience', 'comparison', 'informational', 3),
('Ford vs Chevy truck dealers', 'comparison', 'informational', 3),
('luxury vs economy car dealers', 'comparison', 'informational', 3),
('local vs chain dealership', 'comparison', 'informational', 3),
('online vs in-person car buying', 'comparison', 'informational', 3),
('lease vs finance vs cash', 'comparison', 'informational', 3),
('used car dealer vs private seller', 'comparison', 'informational', 3),
('domestic vs import dealers', 'comparison', 'informational', 3),
('electric car dealer comparison', 'comparison', 'informational', 3),
('service department comparison', 'comparison', 'informational', 3),
('warranty coverage comparison', 'comparison', 'informational', 3),
('customer service ratings', 'comparison', 'informational', 3),

-- Purchase intent (15 queries)
('Ford F-150 inventory near me', 'purchase', 'transactional', 5),
('best lease deals Toyota', 'purchase', 'transactional', 5),
('Honda dealer trade-in offers', 'purchase', 'transactional', 4),
('BMW X5 availability', 'purchase', 'transactional', 4),
('Chevy Silverado dealer incentives', 'purchase', 'transactional', 4),
('Tesla Model Y delivery time', 'purchase', 'transactional', 4),
('Audi A4 lease specials', 'purchase', 'transactional', 4),
('Nissan Altima financing deals', 'purchase', 'transactional', 4),
('Hyundai dealer promotions', 'purchase', 'transactional', 4),
('Kia dealer cash back offers', 'purchase', 'transactional', 4),
('Mazda CX-5 inventory check', 'purchase', 'transactional', 4),
('Subaru Outback dealer pricing', 'purchase', 'transactional', 4),
('Volkswagen Jetta lease deals', 'purchase', 'transactional', 4),
('Acura dealer financing rates', 'purchase', 'transactional', 4),
('Infiniti Q50 availability', 'purchase', 'transactional', 4)
ON CONFLICT (query_text) DO NOTHING;

-- Create views for common queries
CREATE OR REPLACE VIEW dealer_leaderboard AS
SELECT 
  d.id,
  d.name,
  d.website,
  d.brand,
  d.city,
  d.state,
  ms.visibility_score,
  ms.total_mentions,
  ms.avg_rank,
  ms.sentiment_score,
  ms.scan_date,
  ROW_NUMBER() OVER (ORDER BY ms.visibility_score DESC) as rank_position
FROM dealers d
JOIN monthly_scans ms ON d.id = ms.dealer_id
WHERE ms.scan_date = (SELECT MAX(scan_date) FROM monthly_scans)
  AND ms.scan_status = 'completed'
ORDER BY ms.visibility_score DESC;

-- Create view for platform performance
CREATE OR REPLACE VIEW platform_performance AS
SELECT 
  pr.platform,
  COUNT(DISTINCT pr.scan_id) as total_scans,
  AVG(pr.mentions) as avg_mentions,
  AVG(pr.avg_rank) as avg_rank,
  AVG(pr.sentiment_score) as avg_sentiment,
  SUM(pr.api_cost_usd) as total_cost,
  AVG(pr.processing_time_ms) as avg_processing_time
FROM platform_results pr
JOIN monthly_scans ms ON pr.scan_id = ms.id
WHERE ms.scan_date >= CURRENT_DATE - INTERVAL '3 months'
GROUP BY pr.platform
ORDER BY total_scans DESC;

-- Create view for query performance
CREATE OR REPLACE VIEW query_performance AS
SELECT 
  tq.query_text,
  tq.category,
  tq.intent_type,
  COUNT(qr.id) as total_appearances,
  AVG(qr.rank) as avg_rank,
  COUNT(CASE WHEN qr.sentiment = 'positive' THEN 1 END) as positive_mentions,
  COUNT(CASE WHEN qr.sentiment = 'negative' THEN 1 END) as negative_mentions,
  COUNT(DISTINCT qr.dealer_id) as unique_dealers
FROM tracked_queries tq
LEFT JOIN query_results qr ON tq.id = qr.query_id
WHERE qr.created_at >= CURRENT_DATE - INTERVAL '3 months'
GROUP BY tq.id, tq.query_text, tq.category, tq.intent_type
ORDER BY total_appearances DESC;
