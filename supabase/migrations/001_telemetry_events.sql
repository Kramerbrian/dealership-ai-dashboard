-- Create telemetry_events table for tracking user events
CREATE TABLE IF NOT EXISTS telemetry_events (
  id BIGSERIAL PRIMARY KEY,
  type TEXT NOT NULL,
  payload JSONB,
  ts BIGINT,
  ip TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create index on type for faster queries
CREATE INDEX IF NOT EXISTS idx_telemetry_events_type ON telemetry_events(type);

-- Create index on ts for time-based queries
CREATE INDEX IF NOT EXISTS idx_telemetry_events_ts ON telemetry_events(ts DESC);

-- Create index on created_at for date-based queries
CREATE INDEX IF NOT EXISTS idx_telemetry_events_created_at ON telemetry_events(created_at DESC);

-- Enable Row Level Security (optional - adjust as needed)
ALTER TABLE telemetry_events ENABLE ROW LEVEL SECURITY;

-- Policy: Allow service role to insert (for API writes)
CREATE POLICY IF NOT EXISTS "Service role can insert telemetry"
  ON telemetry_events
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Policy: Allow service role to read (for admin dashboard)
CREATE POLICY IF NOT EXISTS "Service role can read telemetry"
  ON telemetry_events
  FOR SELECT
  TO service_role
  USING (true);

