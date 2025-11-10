-- Create telemetry_events table for Supabase
-- This table stores client-side tracking events

CREATE TABLE IF NOT EXISTS telemetry_events (
  id BIGSERIAL PRIMARY KEY,
  type TEXT NOT NULL,
  payload JSONB,
  ts BIGINT NOT NULL,
  ip TEXT,
  user_id TEXT,
  session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on timestamp for fast queries
CREATE INDEX IF NOT EXISTS idx_telemetry_events_ts ON telemetry_events(ts DESC);

-- Create index on type for filtering
CREATE INDEX IF NOT EXISTS idx_telemetry_events_type ON telemetry_events(type);

-- Create index on user_id for user-specific queries
CREATE INDEX IF NOT EXISTS idx_telemetry_events_user_id ON telemetry_events(user_id) WHERE user_id IS NOT NULL;

-- Create index on created_at for time-based queries
CREATE INDEX IF NOT EXISTS idx_telemetry_events_created_at ON telemetry_events(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE telemetry_events ENABLE ROW LEVEL SECURITY;

-- Policy: Allow service role to insert (for API routes)
CREATE POLICY "Service role can insert telemetry_events"
  ON telemetry_events
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Policy: Allow service role to read all (for admin dashboard)
CREATE POLICY "Service role can read telemetry_events"
  ON telemetry_events
  FOR SELECT
  TO service_role
  USING (true);

-- Policy: Allow authenticated users to read their own events
CREATE POLICY "Users can read their own telemetry_events"
  ON telemetry_events
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id);

-- Add comment
COMMENT ON TABLE telemetry_events IS 'Stores client-side telemetry events for analytics and monitoring';

