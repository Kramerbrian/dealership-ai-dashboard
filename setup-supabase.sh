#!/bin/bash

# DealershipAI Supabase Database Setup Script
# This script helps you set up the database schema for the monthly scan system

echo "🗄️  DealershipAI Supabase Database Setup"
echo "========================================"

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Installing..."
    npm install -g supabase
fi

echo "📋 Setting up Supabase project..."
echo ""

# Function to get user input
get_input() {
    local prompt=$1
    local var_name=$2
    local example=$3
    
    echo "$prompt"
    echo "Example: $example"
    read -p "Enter $var_name: " input_value
    echo "$input_value"
}

# Get Supabase project details
SUPABASE_URL=$(get_input "Enter your Supabase project URL:" "SUPABASE_URL" "https://your-project.supabase.co")
SUPABASE_KEY=$(get_input "Enter your Supabase service role key:" "SUPABASE_KEY" "your-service-role-key")

echo ""
echo "🔧 Setting up environment variables..."
export NEXT_PUBLIC_SUPABASE_URL="$SUPABASE_URL"
export SUPABASE_SERVICE_ROLE_KEY="$SUPABASE_KEY"

echo "📊 Creating database schema..."

# Create the monthly scan schema
echo "Creating monthly scan tables..."
psql "$SUPABASE_URL" -c "
-- Dealers table
CREATE TABLE IF NOT EXISTS dealers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  website TEXT NOT NULL UNIQUE,
  brand TEXT,
  city TEXT,
  state TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scans table (one per dealer per month)
CREATE TABLE IF NOT EXISTS monthly_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id UUID REFERENCES dealers(id),
  scan_date DATE NOT NULL,
  visibility_score INTEGER,
  total_mentions INTEGER,
  avg_rank DECIMAL,
  sentiment_score DECIMAL,
  scan_status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(dealer_id, scan_date)
);

-- Platform results (detailed breakdown)
CREATE TABLE IF NOT EXISTS platform_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id UUID REFERENCES monthly_scans(id),
  platform TEXT,
  mentions INTEGER,
  rank INTEGER,
  sentiment DECIMAL,
  citations JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Queries tracked
CREATE TABLE IF NOT EXISTS tracked_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query_text TEXT NOT NULL UNIQUE,
  category TEXT,
  monthly_volume INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Query results (which dealers appear for which queries)
CREATE TABLE IF NOT EXISTS query_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query_id UUID REFERENCES tracked_queries(id),
  dealer_id UUID REFERENCES dealers(id),
  platform TEXT,
  rank INTEGER,
  scan_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scan batches for processing
CREATE TABLE IF NOT EXISTS scan_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_number INTEGER,
  dealer_ids UUID[],
  status TEXT DEFAULT 'pending',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- API usage tracking for cost monitoring
CREATE TABLE IF NOT EXISTS api_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT,
  scan_id UUID REFERENCES monthly_scans(id),
  request_tokens INTEGER,
  response_tokens INTEGER,
  total_tokens INTEGER,
  cost_usd DECIMAL,
  model_used TEXT,
  request_timestamp TIMESTAMPTZ DEFAULT NOW()
);
"

echo "📈 Creating views for optimized queries..."

# Create views
psql "$SUPABASE_URL" -c "
-- Dealer leaderboard view
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
WHERE ms.scan_status = 'completed'
ORDER BY ms.visibility_score DESC;

-- Platform performance view
CREATE OR REPLACE VIEW platform_performance AS
SELECT 
  platform,
  COUNT(*) as total_scans,
  AVG(mentions) as avg_mentions,
  AVG(rank) as avg_rank,
  AVG(sentiment) as avg_sentiment,
  SUM(cost_usd) as total_cost
FROM platform_results pr
JOIN api_usage au ON pr.scan_id = au.scan_id
GROUP BY platform;

-- Query performance view
CREATE OR REPLACE VIEW query_performance AS
SELECT 
  tq.query_text,
  tq.category,
  COUNT(qr.id) as total_appearances,
  AVG(qr.rank) as avg_rank,
  COUNT(DISTINCT qr.dealer_id) as unique_dealers
FROM tracked_queries tq
LEFT JOIN query_results qr ON tq.id = qr.query_id
GROUP BY tq.id, tq.query_text, tq.category;
"

echo "🔍 Creating indexes for performance..."

# Create indexes
psql "$SUPABASE_URL" -c "
-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_dealers_website ON dealers(website);
CREATE INDEX IF NOT EXISTS idx_monthly_scans_dealer_date ON monthly_scans(dealer_id, scan_date);
CREATE INDEX IF NOT EXISTS idx_platform_results_scan ON platform_results(scan_id);
CREATE INDEX IF NOT EXISTS idx_query_results_query ON query_results(query_id);
CREATE INDEX IF NOT EXISTS idx_query_results_dealer ON query_results(dealer_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_platform ON api_usage(platform);
CREATE INDEX IF NOT EXISTS idx_api_usage_timestamp ON api_usage(request_timestamp);
"

echo "📝 Inserting sample data..."

# Insert sample queries
psql "$SUPABASE_URL" -c "
INSERT INTO tracked_queries (query_text, category, monthly_volume) VALUES
('best Toyota dealer near me', 'research', 1000),
('Honda dealer reviews', 'research', 800),
('most reliable car dealership', 'research', 600),
('should I buy used or new car', 'research', 1200),
('best time to buy a car', 'research', 900),
('Toyota vs Honda dealer comparison', 'comparison', 700),
('certified pre-owned vs new', 'comparison', 500),
('dealer financing vs bank loan', 'comparison', 400),
('Ford F-150 inventory near me', 'purchase', 800),
('best lease deals Toyota', 'purchase', 600)
ON CONFLICT (query_text) DO NOTHING;
"

echo "✅ Database setup complete!"
echo ""
echo "📊 Database Summary:"
echo "- 7 tables created"
echo "- 3 views created"
echo "- 8 indexes created"
echo "- 10 sample queries inserted"
echo ""
echo "🔗 Your Supabase project: $SUPABASE_URL"
echo "📈 Ready for monthly scan system!"
echo ""
echo "Next steps:"
echo "1. Run the deployment script: ./deploy-production.sh"
echo "2. Test the API endpoints"
echo "3. Configure your AI platform API keys"
echo "4. Launch your first monthly scan"
