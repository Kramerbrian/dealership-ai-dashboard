/**
 * Pulse Decision Inbox - Database Schema
 * Stores pulse cards, threads, and mute rules with full lifecycle management
 */

-- ==============================================
-- 1. PULSE CARDS TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS pulse_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id TEXT NOT NULL,

  -- Pulse metadata
  ts TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  level TEXT NOT NULL CHECK (level IN ('critical', 'high', 'medium', 'low', 'info')),
  kind TEXT NOT NULL CHECK (kind IN ('kpi_delta', 'incident_opened', 'incident_resolved', 'market_signal', 'auto_fix', 'sla_breach', 'system_health')),

  -- Content
  title TEXT NOT NULL,
  detail TEXT,
  delta NUMERIC,

  -- Threading
  thread_type TEXT CHECK (thread_type IN ('incident', 'kpi', 'market')),
  thread_id TEXT,

  -- Actions
  actions JSONB DEFAULT '[]'::jsonb, -- ['open', 'fix', 'assign', 'snooze', 'mute']

  -- Deduplication & lifecycle
  dedupe_key TEXT,
  ttl_sec INTEGER,
  expires_at TIMESTAMPTZ,

  -- Context & receipts
  context JSONB DEFAULT '{}'::jsonb, -- { kpi, segment, source }
  receipts JSONB DEFAULT '[]'::jsonb, -- [{ label, kpi, before, after }]

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  dismissed_at TIMESTAMPTZ,

  -- Indexes
  INDEX idx_pulse_cards_dealer_ts (dealer_id, ts DESC),
  INDEX idx_pulse_cards_thread (thread_type, thread_id),
  INDEX idx_pulse_cards_dedupe (dedupe_key, ts),
  INDEX idx_pulse_cards_expires (expires_at) WHERE expires_at IS NOT NULL
);

-- Row-level security
ALTER TABLE pulse_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own pulse cards"
  ON pulse_cards FOR SELECT
  USING (dealer_id = current_setting('request.jwt.claim.dealerId', true));

CREATE POLICY "System can insert pulse cards"
  ON pulse_cards FOR INSERT
  WITH CHECK (true);

-- ==============================================
-- 2. PULSE THREADS TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS pulse_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id TEXT NOT NULL,

  -- Thread reference
  thread_type TEXT NOT NULL CHECK (thread_type IN ('incident', 'kpi', 'market')),
  thread_id TEXT NOT NULL,

  -- Metadata
  title TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Event count for quick access
  event_count INTEGER DEFAULT 0,

  UNIQUE(dealer_id, thread_type, thread_id),
  INDEX idx_pulse_threads_dealer (dealer_id, updated_at DESC)
);

-- Row-level security
ALTER TABLE pulse_threads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own threads"
  ON pulse_threads FOR SELECT
  USING (dealer_id = current_setting('request.jwt.claim.dealerId', true));

-- ==============================================
-- 3. PULSE MUTES TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS pulse_mutes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id TEXT NOT NULL,

  -- Mute configuration
  dedupe_key TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  reason TEXT,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by TEXT,

  UNIQUE(dealer_id, dedupe_key),
  INDEX idx_pulse_mutes_expires (expires_at)
);

-- Row-level security
ALTER TABLE pulse_mutes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own mutes"
  ON pulse_mutes FOR ALL
  USING (dealer_id = current_setting('request.jwt.claim.dealerId', true));

-- ==============================================
-- 4. PULSE INCIDENTS TABLE (Auto-promotion)
-- ==============================================
CREATE TABLE IF NOT EXISTS pulse_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id TEXT NOT NULL,
  pulse_card_id UUID REFERENCES pulse_cards(id) ON DELETE SET NULL,

  -- Incident details
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  urgency TEXT CHECK (urgency IN ('critical', 'high', 'medium', 'low')),

  -- Impact
  impact_points INTEGER NOT NULL,
  confidence NUMERIC(3, 2) CHECK (confidence BETWEEN 0 AND 1),
  time_to_fix_min INTEGER,

  -- Auto-fix
  autofix BOOLEAN DEFAULT FALSE,
  fix_tiers JSONB DEFAULT '[]'::jsonb, -- ['tier1_diy', 'tier2_guided', 'tier3_dfy']

  -- Status
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'dismissed')),
  assigned_to TEXT,
  resolved_at TIMESTAMPTZ,

  -- Context
  reason TEXT,
  receipts JSONB DEFAULT '[]'::jsonb,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  INDEX idx_pulse_incidents_dealer_status (dealer_id, status, created_at DESC)
);

-- Row-level security
ALTER TABLE pulse_incidents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own incidents"
  ON pulse_incidents FOR SELECT
  USING (dealer_id = current_setting('request.jwt.claim.dealerId', true));

CREATE POLICY "Users can update their own incidents"
  ON pulse_incidents FOR UPDATE
  USING (dealer_id = current_setting('request.jwt.claim.dealerId', true));

-- ==============================================
-- 5. TRIGGER: Update thread event count
-- ==============================================
CREATE OR REPLACE FUNCTION update_pulse_thread_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Create or update thread
    INSERT INTO pulse_threads (dealer_id, thread_type, thread_id, title, event_count, updated_at)
    VALUES (NEW.dealer_id, NEW.thread_type, NEW.thread_id, NEW.title, 1, NEW.ts)
    ON CONFLICT (dealer_id, thread_type, thread_id)
    DO UPDATE SET
      event_count = pulse_threads.event_count + 1,
      updated_at = NEW.ts;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER pulse_thread_counter
AFTER INSERT ON pulse_cards
FOR EACH ROW
WHEN (NEW.thread_type IS NOT NULL AND NEW.thread_id IS NOT NULL)
EXECUTE FUNCTION update_pulse_thread_count();

-- ==============================================
-- 6. TRIGGER: Clean up expired cards
-- ==============================================
CREATE OR REPLACE FUNCTION cleanup_expired_pulse_cards()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM pulse_cards
  WHERE expires_at IS NOT NULL
    AND expires_at < NOW();

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Schedule cleanup (requires pg_cron extension)
-- SELECT cron.schedule('cleanup-pulse-cards', '*/5 * * * *', 'SELECT cleanup_expired_pulse_cards()');

-- ==============================================
-- 7. VIEW: Active Pulse Cards
-- ==============================================
CREATE OR REPLACE VIEW active_pulse_cards AS
SELECT
  pc.*,
  pm.expires_at IS NOT NULL AND pm.expires_at > NOW() AS is_muted
FROM pulse_cards pc
LEFT JOIN pulse_mutes pm ON pm.dealer_id = pc.dealer_id AND pm.dedupe_key = pc.dedupe_key
WHERE pc.dismissed_at IS NULL
  AND (pc.expires_at IS NULL OR pc.expires_at > NOW())
ORDER BY pc.ts DESC;

-- ==============================================
-- 8. VIEW: Pulse Digest Summary
-- ==============================================
CREATE OR REPLACE VIEW pulse_digest AS
SELECT
  dealer_id,
  DATE(ts) as digest_date,

  -- Counts by level
  COUNT(*) FILTER (WHERE level = 'critical') as critical_count,
  COUNT(*) FILTER (WHERE level = 'high') as high_count,
  COUNT(*) FILTER (WHERE level = 'medium') as medium_count,
  COUNT(*) FILTER (WHERE level = 'low') as low_count,
  COUNT(*) FILTER (WHERE level = 'info') as info_count,

  -- Counts by kind
  COUNT(*) FILTER (WHERE kind = 'kpi_delta') as kpi_delta_count,
  COUNT(*) FILTER (WHERE kind = 'incident_opened') as incidents_opened,
  COUNT(*) FILTER (WHERE kind = 'incident_resolved') as incidents_resolved,
  COUNT(*) FILTER (WHERE kind = 'sla_breach') as sla_breaches,

  -- KPI summary
  SUM(delta) FILTER (WHERE kind = 'kpi_delta' AND context->>'kpi' = 'AIV') as aiv_net_change,

  -- Total
  COUNT(*) as total_cards
FROM pulse_cards
WHERE dismissed_at IS NULL
GROUP BY dealer_id, DATE(ts)
ORDER BY digest_date DESC;

-- ==============================================
-- 9. STORED FUNCTION: Get Pulse Inbox
-- ==============================================
CREATE OR REPLACE FUNCTION get_pulse_inbox(
  p_dealer_id TEXT,
  p_filter TEXT DEFAULT 'all',
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  ts TIMESTAMPTZ,
  level TEXT,
  kind TEXT,
  title TEXT,
  detail TEXT,
  delta NUMERIC,
  thread_type TEXT,
  thread_id TEXT,
  actions JSONB,
  context JSONB,
  receipts JSONB,
  is_muted BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    pc.id, pc.ts, pc.level, pc.kind, pc.title, pc.detail, pc.delta,
    pc.thread_type, pc.thread_id, pc.actions, pc.context, pc.receipts,
    (pm.expires_at IS NOT NULL AND pm.expires_at > NOW()) as is_muted
  FROM pulse_cards pc
  LEFT JOIN pulse_mutes pm ON pm.dealer_id = pc.dealer_id AND pm.dedupe_key = pc.dedupe_key
  WHERE pc.dealer_id = p_dealer_id
    AND pc.dismissed_at IS NULL
    AND (pc.expires_at IS NULL OR pc.expires_at > NOW())
    AND (
      p_filter = 'all'
      OR (p_filter = 'critical' AND pc.level = 'critical')
      OR (p_filter = 'incident' AND pc.kind IN ('incident_opened', 'incident_resolved'))
      OR (p_filter = 'kpi_delta' AND pc.kind = 'kpi_delta')
      OR (p_filter = 'market_signal' AND pc.kind = 'market_signal')
      OR (p_filter = 'system_health' AND pc.kind = 'system_health')
    )
  ORDER BY pc.ts DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- ==============================================
-- 10. STORED FUNCTION: Ingest Pulse Card with Deduplication
-- ==============================================
CREATE OR REPLACE FUNCTION ingest_pulse_card(
  p_dealer_id TEXT,
  p_card JSONB
)
RETURNS UUID AS $$
DECLARE
  v_card_id UUID;
  v_dedupe_key TEXT;
  v_existing_id UUID;
  v_ttl_sec INTEGER;
  v_expires_at TIMESTAMPTZ;
BEGIN
  v_dedupe_key := p_card->>'dedupe_key';
  v_ttl_sec := (p_card->>'ttl_sec')::INTEGER;

  IF v_ttl_sec IS NOT NULL THEN
    v_expires_at := NOW() + (v_ttl_sec || ' seconds')::INTERVAL;
  END IF;

  -- Check if muted
  IF v_dedupe_key IS NOT NULL THEN
    IF EXISTS (
      SELECT 1 FROM pulse_mutes
      WHERE dealer_id = p_dealer_id
        AND dedupe_key = v_dedupe_key
        AND expires_at > NOW()
    ) THEN
      RETURN NULL; -- Card is muted, skip
    END IF;
  END IF;

  -- Check for duplicate within 10-minute window
  IF v_dedupe_key IS NOT NULL THEN
    SELECT id INTO v_existing_id
    FROM pulse_cards
    WHERE dealer_id = p_dealer_id
      AND dedupe_key = v_dedupe_key
      AND ts > NOW() - INTERVAL '10 minutes'
    LIMIT 1;

    IF v_existing_id IS NOT NULL THEN
      -- Update existing card
      UPDATE pulse_cards
      SET updated_at = NOW()
      WHERE id = v_existing_id;

      RETURN v_existing_id;
    END IF;
  END IF;

  -- Insert new card
  INSERT INTO pulse_cards (
    dealer_id, ts, level, kind, title, detail, delta,
    thread_type, thread_id, actions, dedupe_key, ttl_sec, expires_at,
    context, receipts
  ) VALUES (
    p_dealer_id,
    COALESCE((p_card->>'ts')::TIMESTAMPTZ, NOW()),
    p_card->>'level',
    p_card->>'kind',
    p_card->>'title',
    p_card->>'detail',
    (p_card->>'delta')::NUMERIC,
    p_card->>'thread_type',
    p_card->>'thread_id',
    COALESCE(p_card->'actions', '[]'::jsonb),
    v_dedupe_key,
    v_ttl_sec,
    v_expires_at,
    COALESCE(p_card->'context', '{}'::jsonb),
    COALESCE(p_card->'receipts', '[]'::jsonb)
  )
  RETURNING id INTO v_card_id;

  -- Auto-promote to incident if applicable
  IF (p_card->>'kind') = 'kpi_delta' AND ABS((p_card->>'delta')::NUMERIC) >= 6 THEN
    INSERT INTO pulse_incidents (
      dealer_id, pulse_card_id, title, category, urgency,
      impact_points, confidence, time_to_fix_min,
      autofix, fix_tiers, reason, receipts
    ) VALUES (
      p_dealer_id,
      v_card_id,
      'AIV ' || (CASE WHEN (p_card->>'delta')::NUMERIC > 0 THEN '+' ELSE '' END) || (p_card->>'delta'),
      'ai_visibility',
      CASE WHEN (p_card->>'delta')::NUMERIC < 0 THEN 'high' ELSE 'medium' END,
      ABS((p_card->>'delta')::NUMERIC) * 1000,
      0.8,
      5,
      true,
      '["tier1_diy", "tier2_guided", "tier3_dfy"]'::jsonb,
      'Visibility shifted beyond target band.',
      COALESCE(p_card->'receipts', '[]'::jsonb)
    );
  END IF;

  IF (p_card->>'kind') = 'sla_breach' THEN
    INSERT INTO pulse_incidents (
      dealer_id, pulse_card_id, title, category, urgency,
      impact_points, confidence, time_to_fix_min,
      autofix, fix_tiers, reason, receipts
    ) VALUES (
      p_dealer_id,
      v_card_id,
      p_card->>'title',
      'sla',
      'high',
      5000,
      1.0,
      15,
      false,
      '["tier2_guided", "tier3_dfy"]'::jsonb,
      COALESCE(p_card->>'detail', 'SLA breach detected'),
      COALESCE(p_card->'receipts', '[]'::jsonb)
    );
  END IF;

  RETURN v_card_id;
END;
$$ LANGUAGE plpgsql;

-- ==============================================
-- 11. SAMPLE DATA
-- ==============================================
DO $$
DECLARE
  v_card_id UUID;
BEGIN
  -- Sample KPI delta (will auto-promote to incident)
  SELECT ingest_pulse_card(
    'demo-tenant',
    jsonb_build_object(
      'ts', NOW(),
      'level', 'high',
      'kind', 'kpi_delta',
      'title', 'AIV dropped 8 points',
      'detail', 'Visibility score declined across all segments',
      'delta', -8,
      'thread_type', 'kpi',
      'thread_id', 'aiv-trend',
      'actions', '["open", "fix"]',
      'dedupe_key', 'aiv-drop-20251112',
      'ttl_sec', 86400,
      'context', jsonb_build_object('kpi', 'AIV', 'segment', 'all'),
      'receipts', jsonb_build_array(
        jsonb_build_object('label', 'Before', 'kpi', 'AIV', 'before', 72),
        jsonb_build_object('label', 'After', 'kpi', 'AIV', 'after', 64)
      )
    )
  ) INTO v_card_id;

  -- Sample market signal
  SELECT ingest_pulse_card(
    'demo-tenant',
    jsonb_build_object(
      'ts', NOW() - INTERVAL '30 minutes',
      'level', 'medium',
      'kind', 'market_signal',
      'title', 'Competitor launched new inventory page',
      'detail', 'Smith Ford added 45 new vehicles with enhanced schema',
      'thread_type', 'market',
      'thread_id', 'smith-ford-activity',
      'actions', '["open"]',
      'dedupe_key', 'smith-ford-inventory-20251112',
      'ttl_sec', 604800,
      'context', jsonb_build_object('source', 'competitor_monitor')
    )
  ) INTO v_card_id;

  -- Sample system health
  SELECT ingest_pulse_card(
    'demo-tenant',
    jsonb_build_object(
      'ts', NOW() - INTERVAL '1 hour',
      'level', 'info',
      'kind', 'system_health',
      'title', 'Schema scan completed',
      'detail', '23/25 schema types detected (+2 from last scan)',
      'actions', '["open"]',
      'dedupe_key', 'schema-scan-20251112-10',
      'ttl_sec', 43200,
      'context', jsonb_build_object('scan_id', 'abc123')
    )
  ) INTO v_card_id;

  -- Sample incident resolved
  SELECT ingest_pulse_card(
    'demo-tenant',
    jsonb_build_object(
      'ts', NOW() - INTERVAL '2 hours',
      'level', 'info',
      'kind', 'incident_resolved',
      'title', 'Missing LocalBusiness schema added',
      'detail', 'Auto-fix applied and verified',
      'thread_type', 'incident',
      'thread_id', 'inc-001',
      'actions', '["open"]',
      'context', jsonb_build_object('incident_id', 'inc-001')
    )
  ) INTO v_card_id;
END $$;

-- ==============================================
-- COMPLETE
-- ==============================================
