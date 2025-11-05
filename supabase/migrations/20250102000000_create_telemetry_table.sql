-- Create telemetry table for tracking user events
-- Used for pricing page interactions, dashboard usage, and feature adoption

CREATE TABLE IF NOT EXISTS telemetry (
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

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_telemetry_event ON telemetry(event);
CREATE INDEX IF NOT EXISTS idx_telemetry_tier ON telemetry(tier);
CREATE INDEX IF NOT EXISTS idx_telemetry_surface ON telemetry(surface);
CREATE INDEX IF NOT EXISTS idx_telemetry_at ON telemetry(at DESC);
CREATE INDEX IF NOT EXISTS idx_telemetry_user_id ON telemetry(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_telemetry_created_at ON telemetry(created_at DESC);

-- Row Level Security (RLS)
ALTER TABLE telemetry ENABLE ROW LEVEL SECURITY;

-- Policy: Service key can insert (server-side)
-- Service key has service_role, so it bypasses RLS
-- But we add a policy for explicit clarity

-- Policy: Users can view their own events (if authenticated)
CREATE POLICY "Users can view own telemetry"
  ON telemetry
  FOR SELECT
  USING (auth.uid()::text = user_id);

-- Policy: Service role can do everything (server-side inserts)
CREATE POLICY "Service role full access"
  ON telemetry
  FOR ALL
  USING (auth.role() = 'service_role');

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT INSERT ON telemetry TO anon, authenticated;
GRANT SELECT ON telemetry TO authenticated;

-- Add comment
COMMENT ON TABLE telemetry IS 'User interaction telemetry for analytics and behavior tracking';
COMMENT ON COLUMN telemetry.event IS 'Event name (e.g., pricing_upgrade_click, trial_feature_enable)';
COMMENT ON COLUMN telemetry.tier IS 'User tier (tier1=Ignition, tier2=DIY Guide, tier3=Hyperdrive)';
COMMENT ON COLUMN telemetry.surface IS 'UI surface where event occurred (e.g., pricing-page, dashboard)';
COMMENT ON COLUMN telemetry.metadata IS 'Additional event metadata as JSON';

