-- Unified migration for Telemetry and Trials with proper RLS
-- This migration is idempotent and can be run multiple times safely

-- Enable extensions if needed
DO $$ BEGIN
  CREATE EXTENSION IF NOT EXISTS pgcrypto;
EXCEPTION WHEN others THEN NULL; 
END $$;

-- ============================================
-- TELEMETRY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.telemetry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event TEXT NOT NULL,
  tier TEXT CHECK (tier IN ('tier1', 'tier2', 'tier3')),
  surface TEXT,
  at TIMESTAMPTZ DEFAULT NOW(),
  ip INET,
  ua TEXT,
  user_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for telemetry
CREATE INDEX IF NOT EXISTS idx_telemetry_event ON public.telemetry(event);
CREATE INDEX IF NOT EXISTS idx_telemetry_tier ON public.telemetry(tier);
CREATE INDEX IF NOT EXISTS idx_telemetry_surface ON public.telemetry(surface);
CREATE INDEX IF NOT EXISTS idx_telemetry_at ON public.telemetry(at DESC);
CREATE INDEX IF NOT EXISTS idx_telemetry_user_id ON public.telemetry(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_telemetry_created_at ON public.telemetry(created_at DESC);

-- ============================================
-- TRIALS TABLE (using feature_id to match API)
-- ============================================
CREATE TABLE IF NOT EXISTS public.trial_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  feature_id TEXT NOT NULL,
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure one active trial per user per feature
  UNIQUE(user_id, feature_id)
);

-- Indexes for trial_features
CREATE INDEX IF NOT EXISTS idx_trial_features_user_id ON public.trial_features(user_id);
CREATE INDEX IF NOT EXISTS idx_trial_features_feature_id ON public.trial_features(feature_id);
CREATE INDEX IF NOT EXISTS idx_trial_features_expires_at ON public.trial_features(expires_at);
CREATE INDEX IF NOT EXISTS idx_trial_features_active ON public.trial_features(user_id, feature_id, expires_at) 
  WHERE expires_at > NOW();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on both tables
ALTER TABLE public.telemetry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trial_features ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (idempotent)
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view own telemetry" ON public.telemetry;
  DROP POLICY IF EXISTS "Service role full access telemetry" ON public.telemetry;
  DROP POLICY IF EXISTS "Users can view own trials" ON public.trial_features;
  DROP POLICY IF EXISTS "Service role full access trials" ON public.trial_features;
EXCEPTION WHEN others THEN NULL;
END $$;

-- Telemetry RLS Policies
-- Policy: Users can view their own telemetry events (if authenticated)
CREATE POLICY "Users can view own telemetry"
  ON public.telemetry
  FOR SELECT
  USING (auth.uid()::text = user_id OR user_id IS NULL);

-- Policy: Service role can do everything (server-side inserts)
CREATE POLICY "Service role full access telemetry"
  ON public.telemetry
  FOR ALL
  USING (auth.role() = 'service_role');

-- Trial Features RLS Policies
-- Policy: Users can view their own trials
CREATE POLICY "Users can view own trials"
  ON public.trial_features
  FOR SELECT
  USING (auth.uid()::text = user_id);

-- Policy: Service role can do everything (server-side inserts)
CREATE POLICY "Service role full access trials"
  ON public.trial_features
  FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- GRANTS
-- ============================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT INSERT ON public.telemetry TO anon, authenticated;
GRANT SELECT ON public.telemetry TO authenticated;
GRANT INSERT, SELECT ON public.trial_features TO anon, authenticated;

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON TABLE public.telemetry IS 'User interaction telemetry for analytics and behavior tracking';
COMMENT ON COLUMN public.telemetry.event IS 'Event name (e.g., pricing_upgrade_click, trial_feature_enable)';
COMMENT ON COLUMN public.telemetry.tier IS 'User tier (tier1=Ignition, tier2=DIY Guide, tier3=Hyperdrive)';
COMMENT ON COLUMN public.telemetry.surface IS 'UI surface where event occurred (e.g., pricing-page, dashboard)';
COMMENT ON COLUMN public.telemetry.metadata IS 'Additional event metadata as JSON';

COMMENT ON TABLE public.trial_features IS '24-hour trial feature unlocks for Tier 1 users';
COMMENT ON COLUMN public.trial_features.feature_id IS 'Feature identifier (e.g., schema_fix, zero_click_drawer, competitor_analysis)';
COMMENT ON COLUMN public.trial_features.expires_at IS 'When the trial expires (24 hours after grant)';

-- ============================================
-- CLEANUP FUNCTION (optional - run periodically)
-- ============================================
-- DELETE FROM public.trial_features WHERE expires_at < NOW();

