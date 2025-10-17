-- Sentinel Events table for monitoring alerts and automated responses
CREATE TABLE IF NOT EXISTS sentinel_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  metric_value NUMERIC,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  severity TEXT DEFAULT 'info',
  status TEXT DEFAULT 'active',
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_sentinel_events_dealer_id ON sentinel_events(dealer_id);
CREATE INDEX IF NOT EXISTS idx_sentinel_events_event_type ON sentinel_events(event_type);
CREATE INDEX IF NOT EXISTS idx_sentinel_events_timestamp ON sentinel_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_sentinel_events_severity ON sentinel_events(severity);
CREATE INDEX IF NOT EXISTS idx_sentinel_events_status ON sentinel_events(status);

-- RLS policies
ALTER TABLE sentinel_events ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users to read their own events
CREATE POLICY "Users can view their own sentinel events" ON sentinel_events
  FOR SELECT USING (auth.uid()::text = dealer_id);

-- Policy for service role to manage all events
CREATE POLICY "Service role can manage all sentinel events" ON sentinel_events
  FOR ALL USING (auth.role() = 'service_role');

-- Comments for documentation
COMMENT ON TABLE sentinel_events IS 'Sentinel monitoring events and alerts';
COMMENT ON COLUMN sentinel_events.dealer_id IS 'Dealer identifier';
COMMENT ON COLUMN sentinel_events.event_type IS 'Type of monitoring event';
COMMENT ON COLUMN sentinel_events.metric_value IS 'Value of the metric that triggered the event';
COMMENT ON COLUMN sentinel_events.severity IS 'Severity level: critical, warning, info';
COMMENT ON COLUMN sentinel_events.status IS 'Event status: active, resolved, dismissed';
