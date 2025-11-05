-- Create trial_features table for 24-hour feature unlocks
-- Allows Tier 1 users to temporarily access Pro features

CREATE TABLE IF NOT EXISTS trial_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  feature_id TEXT NOT NULL,
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure one active trial per user per feature
  UNIQUE(user_id, feature_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_trial_features_user_id ON trial_features(user_id);
CREATE INDEX IF NOT EXISTS idx_trial_features_feature_id ON trial_features(feature_id);
CREATE INDEX IF NOT EXISTS idx_trial_features_expires_at ON trial_features(expires_at);
CREATE INDEX IF NOT EXISTS idx_trial_features_active ON trial_features(user_id, feature_id, expires_at) 
  WHERE expires_at > NOW();

-- Row Level Security (RLS)
ALTER TABLE trial_features ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own trials
CREATE POLICY "Users can view own trials"
  ON trial_features
  FOR SELECT
  USING (auth.uid()::text = user_id);

-- Policy: Service role can do everything
CREATE POLICY "Service role full access"
  ON trial_features
  FOR ALL
  USING (auth.role() = 'service_role');

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT INSERT, SELECT ON trial_features TO anon, authenticated;

-- Add comment
COMMENT ON TABLE trial_features IS '24-hour trial feature unlocks for Tier 1 users';
COMMENT ON COLUMN trial_features.feature_id IS 'Feature identifier (e.g., competitor_analysis, schema_auditor)';
COMMENT ON COLUMN trial_features.expires_at IS 'When the trial expires (24 hours after grant)';

-- Cleanup expired trials (run periodically via cron)
-- DELETE FROM trial_features WHERE expires_at < NOW();

