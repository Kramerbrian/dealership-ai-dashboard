-- Telemetry Events Table
-- Tracks user events, funnel metrics, and analytics

CREATE TABLE IF NOT EXISTS telemetry_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(100) NOT NULL,
  event_category VARCHAR(50) NOT NULL, -- 'funnel', 'engagement', 'error', 'conversion'
  user_id VARCHAR(255), -- Clerk user ID
  session_id VARCHAR(255),
  dealer_id VARCHAR(255),
  domain VARCHAR(255),
  payload JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  ip_address VARCHAR(45),
  user_agent TEXT,
  referrer TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_telemetry_event_type ON telemetry_events(event_type);
CREATE INDEX IF NOT EXISTS idx_telemetry_user_id ON telemetry_events(user_id);
CREATE INDEX IF NOT EXISTS idx_telemetry_session_id ON telemetry_events(session_id);
CREATE INDEX IF NOT EXISTS idx_telemetry_dealer_id ON telemetry_events(dealer_id);
CREATE INDEX IF NOT EXISTS idx_telemetry_category ON telemetry_events(event_category);
CREATE INDEX IF NOT EXISTS idx_telemetry_created_at ON telemetry_events(created_at DESC);

-- Funnel tracking view
CREATE OR REPLACE VIEW funnel_metrics AS
SELECT 
  DATE_TRUNC('day', created_at) as date,
  event_category,
  event_type,
  COUNT(*) as event_count,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(DISTINCT session_id) as unique_sessions,
  COUNT(DISTINCT dealer_id) as unique_dealers
FROM telemetry_events
WHERE created_at >= NOW() - INTERVAL '90 days'
GROUP BY DATE_TRUNC('day', created_at), event_category, event_type;

-- RLS Policies
ALTER TABLE telemetry_events ENABLE ROW LEVEL SECURITY;

-- Allow service role to insert (for API)
CREATE POLICY "Service role can insert telemetry"
  ON telemetry_events
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Allow authenticated users to read their own events
CREATE POLICY "Users can read own telemetry"
  ON telemetry_events
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id);

-- Allow anon to insert (for public events like landing page)
CREATE POLICY "Anon can insert public telemetry"
  ON telemetry_events
  FOR INSERT
  TO anon
  WITH CHECK (event_category IN ('funnel', 'engagement'));

COMMENT ON TABLE telemetry_events IS 'Tracks user events, funnel metrics, and analytics for DealershipAI';
COMMENT ON COLUMN telemetry_events.event_type IS 'Type of event (e.g., page_view, button_click, form_submit)';
COMMENT ON COLUMN telemetry_events.event_category IS 'Category: funnel, engagement, error, conversion';
COMMENT ON COLUMN telemetry_events.payload IS 'Event-specific data as JSON';
COMMENT ON COLUMN telemetry_events.metadata IS 'Additional metadata (browser, device, etc.)';

