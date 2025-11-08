-- =====================================================
-- ORIGINS & FLEET MANAGEMENT SCHEMA
-- Migration: 20250101000001_origins_and_fleet.sql
-- Purpose: Comprehensive origins tracking with evidence,
--          bulk uploads, verification, and audit trail
-- =====================================================

-- =====================================================
-- 1. ORIGINS TABLE (Core Fleet Management)
-- =====================================================
CREATE TABLE IF NOT EXISTS origins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    -- Origin identity
    origin TEXT NOT NULL, -- normalized URL (e.g., https://example.com)
    display_name TEXT, -- friendly name for UI
    checksum TEXT UNIQUE NOT NULL, -- SHA1(tenant_id || origin) for dedup

    -- Discovery metadata
    discovered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    discovered_by TEXT, -- user_id or 'csv_import' or 'api'
    source_type TEXT CHECK (source_type IN ('manual', 'csv_upload', 'api_import', 'auto_discovery')),
    source_batch_id UUID, -- links to origin_uploads.id

    -- Verification status
    verification_status TEXT DEFAULT 'unverified' CHECK (
        verification_status IN ('unverified', 'pending', 'confirmed', 'failed', 'stale')
    ),
    last_verified_at TIMESTAMP WITH TIME ZONE,
    verification_attempts INT DEFAULT 0,
    next_verification_at TIMESTAMP WITH TIME ZONE, -- for auto-scheduling

    -- SEO/AI visibility scores (cached from probes)
    ai_visibility_score NUMERIC(5,2), -- 0-100
    schema_coverage_score NUMERIC(5,2), -- 0-100
    ugc_score NUMERIC(5,2), -- User Generated Content score
    oci_score NUMERIC(5,2), -- Overall Content Intelligence score
    cwv_score NUMERIC(5,2), -- Core Web Vitals aggregate

    -- Technical checks
    robots_allowed BOOLEAN,
    sitemap_url TEXT,
    schema_types TEXT[], -- array of schema.org types found
    pages_indexed INT,
    pages_blocked INT,

    -- Business impact
    revenue_at_risk_usd NUMERIC(12,2),
    priority_level TEXT DEFAULT 'medium' CHECK (priority_level IN ('low', 'medium', 'high', 'critical')),

    -- Status
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    tags TEXT[],

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_probed_at TIMESTAMP WITH TIME ZONE,

    -- Constraints
    UNIQUE(tenant_id, origin)
);

-- Indexes for performance
CREATE INDEX idx_origins_tenant ON origins(tenant_id) WHERE is_active = true;
CREATE INDEX idx_origins_verification ON origins(verification_status, next_verification_at) WHERE is_active = true;
CREATE INDEX idx_origins_priority ON origins(tenant_id, priority_level) WHERE is_active = true;
CREATE INDEX idx_origins_checksum ON origins(checksum);
CREATE INDEX idx_origins_source_batch ON origins(source_batch_id) WHERE source_batch_id IS NOT NULL;
CREATE INDEX idx_origins_tags ON origins USING GIN(tags);

-- =====================================================
-- 2. ORIGIN UPLOADS (Bulk Upload Tracking)
-- =====================================================
CREATE TABLE IF NOT EXISTS origin_uploads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    -- Upload metadata
    file_name TEXT NOT NULL,
    file_size_bytes BIGINT,
    file_checksum TEXT, -- SHA256 of file for idempotency
    uploaded_by UUID REFERENCES users(id),
    upload_method TEXT CHECK (upload_method IN ('csv_ui', 'csv_api', 'json_api', 'scheduled_sync')),

    -- Processing status
    status TEXT DEFAULT 'pending' CHECK (
        status IN ('pending', 'parsing', 'validating', 'committing', 'completed', 'failed', 'rolled_back')
    ),

    -- Results
    rows_total INT DEFAULT 0,
    rows_parsed INT DEFAULT 0,
    rows_valid INT DEFAULT 0,
    rows_invalid INT DEFAULT 0,
    rows_committed INT DEFAULT 0,
    rows_duplicates INT DEFAULT 0,

    -- Processing details
    validation_errors JSONB, -- array of {line, origin, reason}
    processing_log JSONB, -- array of timestamped events
    error_message TEXT,

    -- Idempotency
    idempotency_key TEXT UNIQUE,

    -- Rollback support
    can_rollback BOOLEAN DEFAULT true,
    rolled_back_at TIMESTAMP WITH TIME ZONE,
    rolled_back_by UUID REFERENCES users(id),

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    started_processing_at TIMESTAMP WITH TIME ZONE,

    UNIQUE(tenant_id, file_checksum)
);

CREATE INDEX idx_origin_uploads_tenant ON origin_uploads(tenant_id);
CREATE INDEX idx_origin_uploads_status ON origin_uploads(status) WHERE status IN ('pending', 'parsing', 'validating');
CREATE INDEX idx_origin_uploads_idempotency ON origin_uploads(idempotency_key) WHERE idempotency_key IS NOT NULL;

-- =====================================================
-- 3. EVIDENCE SNAPSHOTS (Time-Series Evidence)
-- =====================================================
CREATE TABLE IF NOT EXISTS evidence_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    origin_id UUID NOT NULL REFERENCES origins(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    -- Evidence metadata
    captured_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    evidence_type TEXT CHECK (
        evidence_type IN ('schema_scan', 'cwv_test', 'robots_check', 'ai_visibility_probe', 'ugc_analysis', 'full_audit')
    ),

    -- Verification info
    verified_by TEXT, -- 'perplexity', 'chatgpt', 'claude', 'gemini', 'google_rich_results'
    verification_confidence NUMERIC(5,2), -- 0-100

    -- Snapshot data
    schema_types TEXT[],
    cwv_lcp_ms INT, -- Largest Contentful Paint
    cwv_fid_ms INT, -- First Input Delay
    cwv_cls NUMERIC(4,3), -- Cumulative Layout Shift
    cwv_score NUMERIC(5,2),
    robots_status TEXT CHECK (robots_status IN ('allowed', 'blocked', 'partial', 'unknown')),
    robots_details JSONB,

    -- AI visibility scores
    chatgpt_visible BOOLEAN,
    claude_visible BOOLEAN,
    perplexity_visible BOOLEAN,
    gemini_visible BOOLEAN,
    ai_visibility_score NUMERIC(5,2),

    -- Raw data storage
    raw_response JSONB, -- full API response
    artifacts_url TEXT, -- link to stored screenshots/files

    -- Diff tracking
    changes_from_previous JSONB, -- computed diff
    is_regression BOOLEAN DEFAULT false,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_evidence_origin ON evidence_snapshots(origin_id, captured_at DESC);
CREATE INDEX idx_evidence_tenant ON evidence_snapshots(tenant_id);
CREATE INDEX idx_evidence_type ON evidence_snapshots(evidence_type, captured_at DESC);
CREATE INDEX idx_evidence_regressions ON evidence_snapshots(origin_id) WHERE is_regression = true;

-- =====================================================
-- 4. AUDIT LOG (Comprehensive Audit Trail)
-- =====================================================
CREATE TABLE IF NOT EXISTS fleet_audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    -- Event identification
    event_type TEXT NOT NULL CHECK (
        event_type IN (
            'origin_created', 'origin_updated', 'origin_deleted',
            'bulk_upload_started', 'bulk_upload_completed', 'bulk_upload_failed', 'bulk_upload_rolled_back',
            'verification_triggered', 'verification_completed', 'verification_failed',
            'evidence_captured', 'fix_applied', 'scheduled_job_created'
        )
    ),

    -- Actor information
    actor_user_id UUID REFERENCES users(id),
    actor_role TEXT, -- captured at time of action
    actor_ip TEXT,

    -- Target resources
    origin_id UUID REFERENCES origins(id) ON DELETE SET NULL,
    upload_batch_id UUID REFERENCES origin_uploads(id) ON DELETE SET NULL,

    -- Event details
    event_data JSONB, -- flexible storage for event-specific data

    -- Metadata
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    duration_ms INT, -- for performance tracking

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_audit_tenant ON fleet_audit_log(tenant_id, created_at DESC);
CREATE INDEX idx_audit_event_type ON fleet_audit_log(event_type, created_at DESC);
CREATE INDEX idx_audit_actor ON fleet_audit_log(actor_user_id, created_at DESC);
CREATE INDEX idx_audit_origin ON fleet_audit_log(origin_id) WHERE origin_id IS NOT NULL;

-- =====================================================
-- 5. SCHEDULED JOBS (Auto-Verification & Sync)
-- =====================================================
CREATE TABLE IF NOT EXISTS fleet_scheduled_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    -- Job definition
    job_type TEXT CHECK (
        job_type IN ('verify_all', 'verify_stale', 'sync_csv_source', 'evidence_collection', 'cwv_monitoring')
    ),
    job_name TEXT NOT NULL,

    -- Scheduling
    cron_schedule TEXT, -- e.g., '0 2 * * *' for 2am daily
    next_run_at TIMESTAMP WITH TIME ZONE,
    last_run_at TIMESTAMP WITH TIME ZONE,
    last_run_status TEXT CHECK (last_run_status IN ('success', 'failed', 'partial', 'skipped')),
    last_run_duration_ms INT,

    -- Configuration
    config JSONB, -- job-specific config (e.g., CSV URL, verification mode)
    enabled BOOLEAN DEFAULT true,

    -- Metrics
    total_runs INT DEFAULT 0,
    consecutive_failures INT DEFAULT 0,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

CREATE INDEX idx_scheduled_jobs_tenant ON fleet_scheduled_jobs(tenant_id);
CREATE INDEX idx_scheduled_jobs_next_run ON fleet_scheduled_jobs(next_run_at) WHERE enabled = true;

-- =====================================================
-- 6. ROW-LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE origins ENABLE ROW LEVEL SECURITY;
ALTER TABLE origin_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE fleet_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE fleet_scheduled_jobs ENABLE ROW LEVEL SECURITY;

-- Helper function for getting user's tenant_id
CREATE OR REPLACE FUNCTION get_user_tenant_id() RETURNS UUID AS $$
BEGIN
    RETURN (
        SELECT tenant_id FROM users
        WHERE clerk_id = auth.jwt() ->> 'sub'
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Origins policies
CREATE POLICY "Users can view their tenant origins"
    ON origins FOR SELECT
    USING (tenant_id = get_user_tenant_id());

CREATE POLICY "Users with write permission can insert origins"
    ON origins FOR INSERT
    WITH CHECK (tenant_id = get_user_tenant_id());

CREATE POLICY "Users with write permission can update origins"
    ON origins FOR UPDATE
    USING (tenant_id = get_user_tenant_id());

CREATE POLICY "Users with admin role can delete origins"
    ON origins FOR DELETE
    USING (
        tenant_id = get_user_tenant_id() AND
        EXISTS (
            SELECT 1 FROM users
            WHERE clerk_id = auth.jwt() ->> 'sub'
            AND role IN ('super_admin', 'dealership_admin')
        )
    );

-- Origin uploads policies
CREATE POLICY "Users can view their tenant uploads"
    ON origin_uploads FOR SELECT
    USING (tenant_id = get_user_tenant_id());

CREATE POLICY "Authenticated users can create uploads"
    ON origin_uploads FOR INSERT
    WITH CHECK (tenant_id = get_user_tenant_id());

CREATE POLICY "Upload owners can update their uploads"
    ON origin_uploads FOR UPDATE
    USING (tenant_id = get_user_tenant_id());

-- Evidence snapshots policies
CREATE POLICY "Users can view their tenant evidence"
    ON evidence_snapshots FOR SELECT
    USING (tenant_id = get_user_tenant_id());

CREATE POLICY "System can insert evidence"
    ON evidence_snapshots FOR INSERT
    WITH CHECK (tenant_id = get_user_tenant_id());

-- Audit log policies (read-only for users, admins can see more)
CREATE POLICY "Users can view their own audit logs"
    ON fleet_audit_log FOR SELECT
    USING (
        tenant_id = get_user_tenant_id() AND
        (
            actor_user_id = (SELECT id FROM users WHERE clerk_id = auth.jwt() ->> 'sub') OR
            EXISTS (
                SELECT 1 FROM users
                WHERE clerk_id = auth.jwt() ->> 'sub'
                AND role IN ('super_admin', 'dealership_admin')
            )
        )
    );

CREATE POLICY "System can insert audit logs"
    ON fleet_audit_log FOR INSERT
    WITH CHECK (tenant_id = get_user_tenant_id());

-- Scheduled jobs policies
CREATE POLICY "Users can view their tenant jobs"
    ON fleet_scheduled_jobs FOR SELECT
    USING (tenant_id = get_user_tenant_id());

CREATE POLICY "Admins can manage scheduled jobs"
    ON fleet_scheduled_jobs FOR ALL
    USING (
        tenant_id = get_user_tenant_id() AND
        EXISTS (
            SELECT 1 FROM users
            WHERE clerk_id = auth.jwt() ->> 'sub'
            AND role IN ('super_admin', 'dealership_admin')
        )
    );

-- =====================================================
-- 7. TRIGGERS FOR AUTO-UPDATE
-- =====================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_origins_updated_at
    BEFORE UPDATE ON origins
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scheduled_jobs_updated_at
    BEFORE UPDATE ON fleet_scheduled_jobs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Auto-generate checksum for origins
CREATE OR REPLACE FUNCTION generate_origin_checksum()
RETURNS TRIGGER AS $$
BEGIN
    NEW.checksum = encode(
        digest(NEW.tenant_id::text || '|' || NEW.origin, 'sha1'),
        'hex'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_origins_checksum
    BEFORE INSERT ON origins
    FOR EACH ROW
    EXECUTE FUNCTION generate_origin_checksum();

-- =====================================================
-- 8. UTILITY FUNCTIONS
-- =====================================================

-- Function to compute evidence diffs
CREATE OR REPLACE FUNCTION compute_evidence_diff(
    p_origin_id UUID,
    p_current_snapshot JSONB
) RETURNS JSONB AS $$
DECLARE
    v_previous_snapshot JSONB;
    v_diff JSONB;
BEGIN
    -- Get most recent previous snapshot
    SELECT row_to_json(e)::jsonb INTO v_previous_snapshot
    FROM evidence_snapshots e
    WHERE e.origin_id = p_origin_id
    ORDER BY e.captured_at DESC
    LIMIT 1 OFFSET 1;

    IF v_previous_snapshot IS NULL THEN
        RETURN jsonb_build_object('is_first', true);
    END IF;

    -- Compute diff (simplified - extend as needed)
    v_diff := jsonb_build_object(
        'schema_types_added',
        COALESCE(
            (p_current_snapshot->'schema_types')::jsonb - (v_previous_snapshot->'schema_types')::jsonb,
            '[]'::jsonb
        ),
        'schema_types_removed',
        COALESCE(
            (v_previous_snapshot->'schema_types')::jsonb - (p_current_snapshot->'schema_types')::jsonb,
            '[]'::jsonb
        ),
        'cwv_score_change',
        COALESCE((p_current_snapshot->>'cwv_score')::numeric, 0) -
        COALESCE((v_previous_snapshot->>'cwv_score')::numeric, 0)
    );

    RETURN v_diff;
END;
$$ LANGUAGE plpgsql;

-- Function to mark origins as stale
CREATE OR REPLACE FUNCTION mark_stale_origins() RETURNS INT AS $$
DECLARE
    v_count INT;
BEGIN
    UPDATE origins
    SET verification_status = 'stale'
    WHERE verification_status = 'confirmed'
    AND last_verified_at < NOW() - INTERVAL '7 days'
    AND is_active = true;

    GET DIAGNOSTICS v_count = ROW_COUNT;
    RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get next batch for verification (rate-limited)
CREATE OR REPLACE FUNCTION get_next_verification_batch(
    p_batch_size INT DEFAULT 100,
    p_min_interval_minutes INT DEFAULT 30
) RETURNS TABLE (
    id UUID,
    origin TEXT,
    verification_status TEXT,
    last_verified_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        o.id,
        o.origin,
        o.verification_status,
        o.last_verified_at
    FROM origins o
    WHERE o.is_active = true
    AND (
        o.verification_status IN ('unverified', 'pending', 'stale') OR
        (o.verification_status = 'confirmed' AND o.last_verified_at < NOW() - INTERVAL '7 days')
    )
    AND (
        o.last_verified_at IS NULL OR
        o.last_verified_at < NOW() - (p_min_interval_minutes || ' minutes')::INTERVAL
    )
    ORDER BY
        CASE o.verification_status
            WHEN 'unverified' THEN 1
            WHEN 'stale' THEN 2
            WHEN 'pending' THEN 3
            ELSE 4
        END,
        o.priority_level DESC,
        o.last_verified_at ASC NULLS FIRST
    LIMIT p_batch_size
    FOR UPDATE SKIP LOCKED;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 9. INITIAL DATA / COMMENTS
-- =====================================================

COMMENT ON TABLE origins IS 'Core fleet management table tracking all dealership origins/domains with verification status and scores';
COMMENT ON TABLE origin_uploads IS 'Tracks bulk CSV/API uploads with validation results and rollback capability';
COMMENT ON TABLE evidence_snapshots IS 'Time-series evidence collection for origin verification with diff tracking';
COMMENT ON TABLE fleet_audit_log IS 'Comprehensive audit trail for all fleet operations and changes';
COMMENT ON TABLE fleet_scheduled_jobs IS 'Scheduled automation for verification, sync, and monitoring';

COMMENT ON COLUMN origins.checksum IS 'SHA1(tenant_id || origin) for global deduplication';
COMMENT ON COLUMN origins.verification_status IS 'Current verification state: unverified → pending → confirmed/failed, or stale after 7 days';
COMMENT ON COLUMN origins.revenue_at_risk_usd IS 'Calculated revenue impact from poor AI visibility/SEO scores';
COMMENT ON COLUMN evidence_snapshots.changes_from_previous IS 'Computed diff from previous snapshot for regression detection';
COMMENT ON COLUMN origin_uploads.idempotency_key IS 'Client-provided or generated key to prevent duplicate processing';

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
