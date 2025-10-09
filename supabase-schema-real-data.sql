-- DealershipAI Real Data Schema
-- Run this in your Supabase SQL editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create dealer_metrics table
CREATE TABLE IF NOT EXISTS dealer_metrics (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  dealer_id text NOT NULL,
  
  -- Core KPIs
  revenue_at_risk decimal NOT NULL DEFAULT 0,
  ai_visibility_score integer NOT NULL DEFAULT 0,
  monthly_mentions integer NOT NULL DEFAULT 0,
  conversion_rate decimal NOT NULL DEFAULT 0,
  
  -- Visibility metrics
  voice_search_ready integer NOT NULL DEFAULT 0,
  image_ai_score integer NOT NULL DEFAULT 0,
  multi_step_queries integer NOT NULL DEFAULT 0,
  ai_overview_presence integer NOT NULL DEFAULT 0,
  
  -- Content metrics
  schema_health integer NOT NULL DEFAULT 0,
  ymyl_score integer NOT NULL DEFAULT 0,
  faq_coverage integer NOT NULL DEFAULT 0,
  multimodal_ready integer NOT NULL DEFAULT 0,
  
  -- Review metrics
  avg_rating decimal,
  response_rate integer,
  new_reviews integer,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_dealer_metrics ON dealer_metrics (dealer_id, updated_at DESC);

-- Create dealer_metrics_history table for trend data
CREATE TABLE IF NOT EXISTS dealer_metrics_history (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  dealer_id text NOT NULL,
  date date NOT NULL,
  visibility_score integer,
  mentions integer,
  revenue integer,
  created_at timestamptz DEFAULT now(),
  
  UNIQUE(dealer_id, date),
  INDEX idx_dealer_history ON dealer_metrics_history (dealer_id, date DESC)
);

-- Create dealer_traffic_sources table
CREATE TABLE IF NOT EXISTS dealer_traffic_sources (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  dealer_id text NOT NULL,
  date date NOT NULL,
  source text NOT NULL,
  sessions integer NOT NULL DEFAULT 0,
  percentage decimal NOT NULL DEFAULT 0,
  
  INDEX idx_traffic ON dealer_traffic_sources (dealer_id, date DESC)
);

-- Create dealer_competitors table
CREATE TABLE IF NOT EXISTS dealer_competitors (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  dealer_id text NOT NULL,
  competitor_name text NOT NULL,
  ai_visibility integer,
  monthly_leads integer,
  avg_price decimal,
  trend text,
  updated_at timestamptz DEFAULT now(),
  
  INDEX idx_competitors ON dealer_competitors (dealer_id)
);

-- Create dealer_access table for RBAC
CREATE TABLE IF NOT EXISTS dealer_access (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id text NOT NULL,
  dealer_id text NOT NULL,
  role text NOT NULL DEFAULT 'user',
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  
  UNIQUE(user_id, dealer_id),
  INDEX idx_dealer_access ON dealer_access (user_id, dealer_id)
);

-- Enable Row Level Security
ALTER TABLE dealer_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE dealer_metrics_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE dealer_traffic_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE dealer_competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE dealer_access ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view metrics for their dealers" ON dealer_metrics
  FOR SELECT USING (
    dealer_id IN (
      SELECT dealer_id FROM dealer_access 
      WHERE user_id = auth.uid() AND active = true
    )
  );

CREATE POLICY "Users can view history for their dealers" ON dealer_metrics_history
  FOR SELECT USING (
    dealer_id IN (
      SELECT dealer_id FROM dealer_access 
      WHERE user_id = auth.uid() AND active = true
    )
  );

CREATE POLICY "Users can view traffic for their dealers" ON dealer_traffic_sources
  FOR SELECT USING (
    dealer_id IN (
      SELECT dealer_id FROM dealer_access 
      WHERE user_id = auth.uid() AND active = true
    )
  );

CREATE POLICY "Users can view competitors for their dealers" ON dealer_competitors
  FOR SELECT USING (
    dealer_id IN (
      SELECT dealer_id FROM dealer_access 
      WHERE user_id = auth.uid() AND active = true
    )
  );

CREATE POLICY "Users can view their own access" ON dealer_access
  FOR SELECT USING (user_id = auth.uid());

-- Insert sample data for testing
INSERT INTO dealer_access (user_id, dealer_id, role) VALUES
  ('demo-user-1', 'demo-dealer-1', 'admin'),
  ('demo-user-2', 'demo-dealer-2', 'user');

INSERT INTO dealer_metrics (dealer_id, revenue_at_risk, ai_visibility_score, monthly_mentions, conversion_rate, voice_search_ready, image_ai_score, schema_health, ymyl_score, faq_coverage, avg_rating, response_rate, new_reviews) VALUES
  ('demo-dealer-1', 125000.00, 87, 23, 12.3, 85, 92, 78, 65, 88, 4.2, 58, 97),
  ('demo-dealer-2', 89000.00, 72, 15, 8.7, 68, 75, 65, 52, 71, 3.8, 45, 63);

-- Insert sample trend data
INSERT INTO dealer_metrics_history (dealer_id, date, visibility_score, mentions, revenue) VALUES
  ('demo-dealer-1', CURRENT_DATE - INTERVAL '30 days', 82, 18, 45000),
  ('demo-dealer-1', CURRENT_DATE - INTERVAL '20 days', 84, 20, 52000),
  ('demo-dealer-1', CURRENT_DATE - INTERVAL '10 days', 86, 22, 58000),
  ('demo-dealer-1', CURRENT_DATE, 87, 23, 62000);

-- Insert sample competitor data
INSERT INTO dealer_competitors (dealer_id, competitor_name, ai_visibility, monthly_leads, avg_price, trend) VALUES
  ('demo-dealer-1', 'Competitor A', 92, 45, 38500, 'up'),
  ('demo-dealer-1', 'Competitor B', 78, 32, 42000, 'down'),
  ('demo-dealer-1', 'Competitor C', 85, 38, 39500, 'stable');

-- Insert sample traffic data
INSERT INTO dealer_traffic_sources (dealer_id, date, source, sessions, percentage) VALUES
  ('demo-dealer-1', CURRENT_DATE, 'Google', 1250, 45.2),
  ('demo-dealer-1', CURRENT_DATE, 'Direct', 680, 24.6),
  ('demo-dealer-1', CURRENT_DATE, 'Social', 420, 15.2),
  ('demo-dealer-1', CURRENT_DATE, 'Referral', 410, 14.8);
