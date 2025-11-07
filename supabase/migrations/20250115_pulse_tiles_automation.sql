-- Pulse Tiles Automation Schema
-- Self-evolving tiles that generate from live metric schema

-- Pulse Tiles table
CREATE TABLE IF NOT EXISTS pulse_tiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL,
  metric_key TEXT NOT NULL,              -- e.g., "AIO_CTR", "AIV_COMPOSITE"
  signal_strength NUMERIC(3,2) NOT NULL, -- 0.0-1.0, determines if tile is active
  urgency TEXT NOT NULL,                 -- 'low'|'medium'|'high'|'critical'
  pulse_frequency TEXT NOT NULL,         -- 'hourly'|'daily'|'weekly'
  
  -- Tile content
  title TEXT NOT NULL,
  insight TEXT NOT NULL,                 -- AI-generated insight (≤110 chars)
  change TEXT,                           -- e.g., "-11%", "+5.2%"
  impact TEXT NOT NULL,                  -- 'low'|'medium'|'high'
  current_value NUMERIC(10,2),
  previous_value NUMERIC(10,2),
  threshold_value NUMERIC(10,2),
  
  -- Metadata
  source TEXT,                           -- 'ga4'|'gsc'|'gbp'|'crm'|'reviews'|'vauto'
  anomaly_detected BOOLEAN DEFAULT false,
  last_seen TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  
  -- Auto-sorting
  relevance_score NUMERIC(3,2) DEFAULT 0.5,
  priority_score NUMERIC(3,2) DEFAULT 0.5,
  
  -- Context
  context JSONB DEFAULT '{}',
  
  UNIQUE(tenant_id, metric_key)
);

-- Pulse Tile Actions (Fix Next queue)
CREATE TABLE IF NOT EXISTS pulse_tile_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tile_id UUID REFERENCES pulse_tiles(id) ON DELETE CASCADE,
  tenant_id TEXT NOT NULL,
  action_type TEXT NOT NULL,            -- 'fix'|'view_source'|'auto_generate'|'dismiss'
  action_payload JSONB DEFAULT '{}',
  status TEXT DEFAULT 'pending',        -- 'pending'|'completed'|'dismissed'
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Pulse Tile History (for learning)
CREATE TABLE IF NOT EXISTS pulse_tile_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tile_id UUID REFERENCES pulse_tiles(id) ON DELETE CASCADE,
  tenant_id TEXT NOT NULL,
  event_type TEXT NOT NULL,             -- 'created'|'updated'|'resolved'|'clicked'|'dismissed'
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_pulse_tiles_tenant ON pulse_tiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_pulse_tiles_signal ON pulse_tiles(tenant_id, signal_strength DESC);
CREATE INDEX IF NOT EXISTS idx_pulse_tiles_urgency ON pulse_tiles(tenant_id, urgency, relevance_score DESC);
CREATE INDEX IF NOT EXISTS idx_pulse_tiles_active ON pulse_tiles(tenant_id, resolved_at) WHERE resolved_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_pulse_tile_actions_tile ON pulse_tile_actions(tile_id);
CREATE INDEX IF NOT EXISTS idx_pulse_tile_history_tile ON pulse_tile_history(tile_id);

-- RLS
ALTER TABLE pulse_tiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pulse_tile_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pulse_tile_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "service_role_full_access_tiles" ON pulse_tiles
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "service_role_full_access_actions" ON pulse_tile_actions
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "service_role_full_access_history" ON pulse_tile_history
  FOR ALL USING (auth.role() = 'service_role');

-- Function to auto-update relevance_score based on signal_strength and urgency
CREATE OR REPLACE FUNCTION update_pulse_tile_relevance()
RETURNS TRIGGER AS $$
BEGIN
  NEW.relevance_score := (
    CASE NEW.urgency
      WHEN 'critical' THEN 0.9
      WHEN 'high' THEN 0.7
      WHEN 'medium' THEN 0.5
      WHEN 'low' THEN 0.3
    END * 0.6 + NEW.signal_strength * 0.4
  );
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER pulse_tile_relevance_update
  BEFORE INSERT OR UPDATE ON pulse_tiles
  FOR EACH ROW
  EXECUTE FUNCTION update_pulse_tile_relevance();

-- Function to archive resolved tiles after 7 days
CREATE OR REPLACE FUNCTION archive_resolved_tiles()
RETURNS void AS $$
BEGIN
  UPDATE pulse_tiles
  SET resolved_at = now()
  WHERE resolved_at IS NULL
    AND signal_strength < 0.3
    AND last_seen < now() - interval '7 days';
END;
$$ LANGUAGE plpgsql;

