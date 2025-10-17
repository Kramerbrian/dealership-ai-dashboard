-- External Sources & GEO Signals Schema
-- DealershipAI - Third-party Evidence Ingestion (Metadata Only)
-- Migration: 0015_external_sources_geo_signals.sql

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- External Sources Table
CREATE TABLE IF NOT EXISTS external_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  provider varchar(64) NOT NULL, -- "seopowersuite:blog", "ahrefs:blog", etc.
  url text NOT NULL,
  title text,
  author text,
  published_at timestamptz,
  fetched_at timestamptz NOT NULL DEFAULT now(),
  -- store only hashes/metadata, not full article
  content_hash varchar(64) NOT NULL,
  -- provenance tracking
  source_type varchar(32) NOT NULL DEFAULT 'blog', -- blog, guide, tool, etc.
  is_active boolean NOT NULL DEFAULT true,
  last_processed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- GEO Signals Table
CREATE TABLE IF NOT EXISTS geo_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  source_id uuid NOT NULL REFERENCES external_sources(id) ON DELETE CASCADE,
  -- normalized 0–100 scores
  geo_checklist_score integer NOT NULL CHECK (geo_checklist_score >= 0 AND geo_checklist_score <= 100),
  aio_exposure_pct numeric NOT NULL CHECK (aio_exposure_pct >= 0 AND aio_exposure_pct <= 100),
  topical_depth_score integer NOT NULL CHECK (topical_depth_score >= 0 AND topical_depth_score <= 100),
  kg_present boolean NOT NULL,
  kg_completeness integer NOT NULL CHECK (kg_completeness >= 0 AND kg_completeness <= 100),
  mention_velocity_4w integer NOT NULL CHECK (mention_velocity_4w >= 0),
  extractability_score integer NOT NULL CHECK (extractability_score >= 0 AND extractability_score <= 100),
  -- computed composite scores
  geo_readiness_score integer NOT NULL CHECK (geo_readiness_score >= 0 AND geo_readiness_score <= 100),
  stability_score integer NOT NULL CHECK (stability_score >= 0 AND stability_score <= 100),
  -- metadata
  computed_at timestamptz NOT NULL DEFAULT now(),
  data_points integer NOT NULL DEFAULT 1 CHECK (data_points > 0),
  confidence numeric NOT NULL DEFAULT 0.8 CHECK (confidence >= 0 AND confidence <= 1),
  notes text -- for instability flags, etc.
);

-- Composite Scores Table for AIV Integration
CREATE TABLE IF NOT EXISTS composite_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  score_type varchar(32) NOT NULL, -- "aiv_geo", "rar_geo", "elasticity_geo"
  score_value numeric NOT NULL,
  components text NOT NULL, -- JSON of component scores
  computed_at timestamptz NOT NULL DEFAULT now(),
  window_weeks integer NOT NULL DEFAULT 1 CHECK (window_weeks > 0),
  confidence numeric NOT NULL DEFAULT 0.8 CHECK (confidence >= 0 AND confidence <= 1),
  status varchar(16) NOT NULL DEFAULT 'stable' CHECK (status IN ('stable', 'unstable', 'paused'))
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_external_sources_tenant_id ON external_sources(tenant_id);
CREATE INDEX IF NOT EXISTS idx_external_sources_tenant_provider ON external_sources(tenant_id, provider);
CREATE INDEX IF NOT EXISTS idx_external_sources_url ON external_sources(url);
CREATE INDEX IF NOT EXISTS idx_external_sources_fetched_at ON external_sources(fetched_at);
CREATE INDEX IF NOT EXISTS idx_external_sources_content_hash ON external_sources(content_hash);

CREATE INDEX IF NOT EXISTS idx_geo_signals_tenant_id ON geo_signals(tenant_id);
CREATE INDEX IF NOT EXISTS idx_geo_signals_tenant_computed ON geo_signals(tenant_id, computed_at);
CREATE INDEX IF NOT EXISTS idx_geo_signals_source_id ON geo_signals(source_id);
CREATE INDEX IF NOT EXISTS idx_geo_signals_geo_readiness ON geo_signals(geo_readiness_score);
CREATE INDEX IF NOT EXISTS idx_geo_signals_stability ON geo_signals(stability_score);

CREATE INDEX IF NOT EXISTS idx_composite_scores_tenant_id ON composite_scores(tenant_id);
CREATE INDEX IF NOT EXISTS idx_composite_scores_tenant_type ON composite_scores(tenant_id, score_type);
CREATE INDEX IF NOT EXISTS idx_composite_scores_computed_at ON composite_scores(computed_at);

-- Row Level Security (RLS)
ALTER TABLE external_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE geo_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE composite_scores ENABLE ROW LEVEL SECURITY;

-- RLS Policies for external_sources
DO $$ BEGIN
  CREATE POLICY external_sources_select ON external_sources
    FOR SELECT USING (tenant_id = current_setting('app.tenant')::uuid);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY external_sources_insert ON external_sources
    FOR INSERT WITH CHECK (tenant_id = current_setting('app.tenant')::uuid);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY external_sources_update ON external_sources
    FOR UPDATE USING (tenant_id = current_setting('app.tenant')::uuid);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY external_sources_delete ON external_sources
    FOR DELETE USING (tenant_id = current_setting('app.tenant')::uuid);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- RLS Policies for geo_signals
DO $$ BEGIN
  CREATE POLICY geo_signals_select ON geo_signals
    FOR SELECT USING (tenant_id = current_setting('app.tenant')::uuid);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY geo_signals_insert ON geo_signals
    FOR INSERT WITH CHECK (tenant_id = current_setting('app.tenant')::uuid);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY geo_signals_update ON geo_signals
    FOR UPDATE USING (tenant_id = current_setting('app.tenant')::uuid);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY geo_signals_delete ON geo_signals
    FOR DELETE USING (tenant_id = current_setting('app.tenant')::uuid);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- RLS Policies for composite_scores
DO $$ BEGIN
  CREATE POLICY composite_scores_select ON composite_scores
    FOR SELECT USING (tenant_id = current_setting('app.tenant')::uuid);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY composite_scores_insert ON composite_scores
    FOR INSERT WITH CHECK (tenant_id = current_setting('app.tenant')::uuid);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY composite_scores_update ON composite_scores
    FOR UPDATE USING (tenant_id = current_setting('app.tenant')::uuid);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY composite_scores_delete ON composite_scores
    FOR DELETE USING (tenant_id = current_setting('app.tenant')::uuid);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Utility Functions

-- Function to compute GEO Readiness Score
CREATE OR REPLACE FUNCTION compute_geo_readiness_score(
  geo_checklist integer,
  topical_depth integer,
  extractability integer,
  kg_present boolean,
  kg_completeness integer
) RETURNS integer AS $$
BEGIN
  RETURN ROUND(
    (geo_checklist * 0.6) +
    (topical_depth * 0.2) +
    (extractability * 0.1) +
    (CASE WHEN kg_present THEN kg_completeness * 0.1 ELSE 0 END)
  );
END;
$$ LANGUAGE plpgsql;

-- Function to detect stability issues
CREATE OR REPLACE FUNCTION detect_stability_issues(
  p_tenant_id uuid,
  p_threshold integer DEFAULT 15
) RETURNS TABLE (
  is_stable boolean,
  instability_reasons text[]
) AS $$
DECLARE
  recent_signals RECORD;
  current_score integer;
  previous_score integer;
  swing integer;
  reasons text[] := '{}';
BEGIN
  -- Get recent signals (last 2 weeks)
  FOR recent_signals IN
    SELECT geo_checklist_score, computed_at
    FROM geo_signals
    WHERE tenant_id = p_tenant_id
      AND computed_at >= now() - interval '14 days'
    ORDER BY computed_at DESC
    LIMIT 5
  LOOP
    -- Check for score swings
    IF current_score IS NOT NULL THEN
      swing := ABS(current_score - recent_signals.geo_checklist_score);
      IF swing > p_threshold THEN
        reasons := array_append(reasons, 
          format('GEO checklist score swung %s points between %s and %s',
            swing,
            recent_signals.computed_at::date,
            (SELECT computed_at::date FROM geo_signals 
             WHERE tenant_id = p_tenant_id 
             ORDER BY computed_at DESC LIMIT 1)
          )
        );
      END IF;
    END IF;
    current_score := recent_signals.geo_checklist_score;
  END LOOP;

  RETURN QUERY SELECT 
    (array_length(reasons, 1) IS NULL OR array_length(reasons, 1) = 0) as is_stable,
    reasons;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up old sources
CREATE OR REPLACE FUNCTION cleanup_old_sources(
  p_tenant_id uuid,
  p_retention_days integer DEFAULT 365
) RETURNS integer AS $$
DECLARE
  cutoff_date timestamptz;
  deleted_count integer := 0;
  source_record RECORD;
BEGIN
  cutoff_date := now() - (p_retention_days || ' days')::interval;
  
  -- Delete old sources and their associated signals
  FOR source_record IN
    SELECT id FROM external_sources
    WHERE tenant_id = p_tenant_id
      AND created_at < cutoff_date
  LOOP
    -- Delete associated geo signals first
    DELETE FROM geo_signals WHERE source_id = source_record.id;
    
    -- Delete the source
    DELETE FROM external_sources WHERE id = source_record.id;
    
    deleted_count := deleted_count + 1;
  END LOOP;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get latest GEO signals for a tenant
CREATE OR REPLACE FUNCTION get_latest_geo_signals(p_tenant_id uuid)
RETURNS TABLE (
  id uuid,
  computed_at timestamptz,
  geo_readiness_score integer,
  geo_checklist_score integer,
  aio_exposure_pct numeric,
  topical_depth_score integer,
  kg_present boolean,
  kg_completeness integer,
  mention_velocity_4w integer,
  extractability_score integer,
  stability_score integer,
  confidence numeric,
  source_provider varchar,
  source_title text,
  source_url text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    gs.id,
    gs.computed_at,
    gs.geo_readiness_score,
    gs.geo_checklist_score,
    gs.aio_exposure_pct,
    gs.topical_depth_score,
    gs.kg_present,
    gs.kg_completeness,
    gs.mention_velocity_4w,
    gs.extractability_score,
    gs.stability_score,
    gs.confidence,
    es.provider,
    es.title,
    es.url
  FROM geo_signals gs
  JOIN external_sources es ON gs.source_id = es.id
  WHERE gs.tenant_id = p_tenant_id
  ORDER BY gs.computed_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Sample data for testing (optional)
INSERT INTO external_sources (
  tenant_id, provider, url, title, author, content_hash, source_type
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'seopowersuite:blog',
  'https://blog.seopowersuite.com/geo-readiness-checklist',
  'GEO Readiness Checklist: 7 Steps to AI Overview Success',
  'SEO PowerSuite Team',
  'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6',
  'blog'
) ON CONFLICT DO NOTHING;

INSERT INTO geo_signals (
  tenant_id, source_id, geo_checklist_score, aio_exposure_pct, topical_depth_score,
  kg_present, kg_completeness, mention_velocity_4w, extractability_score,
  geo_readiness_score, stability_score, confidence
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  (SELECT id FROM external_sources WHERE url = 'https://blog.seopowersuite.com/geo-readiness-checklist' LIMIT 1),
  78, 65, 82, true, 85, 12, 75, 79, 88, 0.85
) ON CONFLICT DO NOTHING;

-- Comments for documentation
COMMENT ON TABLE external_sources IS 'External sources for GEO signals - stores only metadata, not full content';
COMMENT ON TABLE geo_signals IS 'Derived GEO readiness signals from external sources';
COMMENT ON TABLE composite_scores IS 'Composite scores for AIV integration';

COMMENT ON COLUMN external_sources.content_hash IS 'SHA-256 hash of normalized content for deduplication';
COMMENT ON COLUMN external_sources.provider IS 'Source provider identifier (e.g., seopowersuite:blog)';
COMMENT ON COLUMN geo_signals.geo_readiness_score IS 'Computed AIV_geo score (0-100)';
COMMENT ON COLUMN geo_signals.stability_score IS 'Stability indicator (0-100, higher = more stable)';
COMMENT ON COLUMN composite_scores.components IS 'JSON object containing component scores';
