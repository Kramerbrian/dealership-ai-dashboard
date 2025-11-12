-- Telemetry Events Table
-- Stores application telemetry and analytics events

CREATE TABLE IF NOT EXISTS telemetry_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL,
  payload JSONB,
  ts BIGINT NOT NULL,
  ip TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_telemetry_events_type ON telemetry_events(type);
CREATE INDEX IF NOT EXISTS idx_telemetry_events_ts ON telemetry_events(ts DESC);
CREATE INDEX IF NOT EXISTS idx_telemetry_events_created_at ON telemetry_events(created_at DESC);

-- Row Level Security (RLS)
ALTER TABLE telemetry_events ENABLE ROW LEVEL SECURITY;

-- Policy: Allow service role to insert (for API)
CREATE POLICY "Service role can insert telemetry"
  ON telemetry_events
  FOR INSERT
  WITH CHECK (true);

-- Policy: Allow service role to read (for admin)
CREATE POLICY "Service role can read telemetry"
  ON telemetry_events
  FOR SELECT
  USING (true);

-- Optional: Add retention policy (delete events older than 90 days)
-- CREATE OR REPLACE FUNCTION cleanup_old_telemetry()
-- RETURNS void AS $$
-- BEGIN
--   DELETE FROM telemetry_events
--   WHERE created_at < NOW() - INTERVAL '90 days';
-- END;
-- $$ LANGUAGE plpgsql;

