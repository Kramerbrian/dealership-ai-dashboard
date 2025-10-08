-- DealershipAI Database Schema
-- Run this in your Supabase SQL Editor

-- Users table (if not exists)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT,
  email TEXT UNIQUE NOT NULL,
  dealership_url TEXT,
  dealership_name TEXT,

  -- Stripe fields
  stripe_customer_id TEXT NOT NULL,
  stripe_subscription_id TEXT,

  -- Status tracking
  status TEXT NOT NULL DEFAULT 'trialing',
  -- Values: trialing, active, past_due, canceled, incomplete

  plan TEXT DEFAULT 'pro',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,

  -- Timestamps
  activated_at TIMESTAMPTZ DEFAULT NOW(),
  canceled_at TIMESTAMPTZ,

  -- Metadata
  utm_source TEXT,
  utm_campaign TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analyses table (track free vs paid usage)
CREATE TABLE IF NOT EXISTS analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  dealership_url TEXT NOT NULL,
  
  -- Results
  ai_visibility_score INTEGER,
  results JSONB,
  
  -- Access control
  is_premium BOOLEAN DEFAULT FALSE,
  unlocked_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_subs_user ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subs_email ON subscriptions(email);
CREATE INDEX IF NOT EXISTS idx_subs_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subs_stripe_customer ON subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_analyses_user ON analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_analyses_url ON analyses(dealership_url);

-- RLS Policies (Row Level Security)
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users can view own analyses" ON analyses;

-- Create policies
CREATE POLICY "Users can view own subscriptions" 
  ON subscriptions FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own analyses" 
  ON analyses FOR SELECT 
  USING (auth.uid() = user_id);

-- Grant necessary permissions
GRANT ALL ON users TO authenticated;
GRANT ALL ON subscriptions TO authenticated;
GRANT ALL ON analyses TO authenticated;
GRANT ALL ON users TO service_role;
GRANT ALL ON subscriptions TO service_role;
GRANT ALL ON analyses TO service_role;

