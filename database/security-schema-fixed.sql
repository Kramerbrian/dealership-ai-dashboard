-- Security Framework Database Schema (Corrected)
-- Implements comprehensive security, access control, and threat detection

-- Enable UUID generation (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================================
-- TABLE DEFINITIONS
--
-- Define all tables first before applying row‑level security (RLS)
-- policies, indexes, or triggers.  Each table includes a primary key
-- using UUIDs and timestamps for auditing purposes.

-- Security Events Table
CREATE TABLE IF NOT EXISTS public.security_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    event_type TEXT NOT NULL CHECK (event_type IN ('login', 'access', 'violation', 'threat', 'admin_action')),
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    user_id TEXT,
    ip_address INET NOT NULL,
    user_agent TEXT,
    resource TEXT NOT NULL,
    action TEXT NOT NULL,
    details JSONB,
    geolocation JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Access Controls Table
CREATE TABLE IF NOT EXISTS public.access_controls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL CHECK (role IN ('super_admin', 'governance_admin', 'model_engineer', 'viewer')),
    permissions TEXT[] NOT NULL,
    restrictions JSONB NOT NULL,
    last_access TIMESTAMPTZ,
    failed_attempts INTEGER NOT NULL DEFAULT 0,
    locked_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Security Rules Table
CREATE TABLE IF NOT EXISTS public.security_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    condition TEXT NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('alert', 'block', 'lockout', 'audit')),
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- API Keys Table
CREATE TABLE IF NOT EXISTS public.api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key_name TEXT NOT NULL,
    key_hash TEXT NOT NULL UNIQUE,
    user_id TEXT NOT NULL,
    permissions TEXT[] NOT NULL,
    rate_limit INTEGER NOT NULL DEFAULT 1000, -- requests per hour
    expires_at TIMESTAMPTZ,
    last_used TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Security Alerts Table
CREATE TABLE IF NOT EXISTS public.security_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    alert_type TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    title TEXT NOT NULL,
    description TEXT,
    user_id TEXT,
    ip_address INET,
    resource TEXT,
    action_taken TEXT,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'false_positive')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    resolved_by TEXT
);

-- Audit Log Table
CREATE TABLE IF NOT EXISTS public.audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT,
    action TEXT NOT NULL,
    resource TEXT NOT NULL,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    session_id TEXT
);

-- Model Access Log Table
CREATE TABLE IF NOT EXISTS public.model_access_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    model_id TEXT NOT NULL,
    access_type TEXT NOT NULL CHECK (access_type IN ('read', 'write', 'download', 'export')),
    file_size BIGINT,
    ip_address INET NOT NULL,
    user_agent TEXT,
    access_granted BOOLEAN NOT NULL,
    reason TEXT,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================================
-- ROW LEVEL SECURITY (RLS)
--
-- Enable RLS on each table.  Policies that reference roles or permissions
-- must qualify columns from the `access_controls` table to avoid
-- ambiguities (unqualified identifiers refer to the base table).

ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_controls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.model_access_log ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Only admins (super_admin or governance_admin) can read
-- security_events rows.  Uses a subquery against access_controls
-- with qualified column names.
CREATE POLICY IF NOT EXISTS "Admin read access to security_events"
  ON public.security_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM public.access_controls ac
      WHERE ac.user_id = auth.uid()::text
        AND ac.role IN ('super_admin', 'governance_admin')
    )
  );

-- RLS Policy: System can always insert security events (no checks)
CREATE POLICY IF NOT EXISTS "System write access to security_events"
  ON public.security_events
  FOR INSERT WITH CHECK (true);

-- RLS Policy: Only super admins can access rows in access_controls
CREATE POLICY IF NOT EXISTS "Admin access to access_controls"
  ON public.access_controls
  FOR ALL USING (
    EXISTS (
      SELECT 1
      FROM public.access_controls ac
      WHERE ac.user_id = auth.uid()::text
        AND ac.role = 'super_admin'
    )
  );

-- RLS Policy: Only admins can access rows in security_rules
CREATE POLICY IF NOT EXISTS "Admin access to security_rules"
  ON public.security_rules
  FOR ALL USING (
    EXISTS (
      SELECT 1
      FROM public.access_controls ac
      WHERE ac.user_id = auth.uid()::text
        AND ac.role IN ('super_admin', 'governance_admin')
    )
  );

-- RLS Policy: Users can access only their own api_keys rows
CREATE POLICY IF NOT EXISTS "User access to own api_keys"
  ON public.api_keys
  FOR ALL USING (user_id = auth.uid()::text);

-- RLS Policy: Only admins can access rows in security_alerts
CREATE POLICY IF NOT EXISTS "Admin access to security_alerts"
  ON public.security_alerts
  FOR ALL USING (
    EXISTS (
      SELECT 1
      FROM public.access_controls ac
      WHERE ac.user_id = auth.uid()::text
        AND ac.role IN ('super_admin', 'governance_admin')
    )
  );

-- RLS Policy: Only admins can read audit_log rows
CREATE POLICY IF NOT EXISTS "Admin read access to audit_log"
  ON public.audit_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM public.access_controls ac
      WHERE ac.user_id = auth.uid()::text
        AND ac.role IN ('super_admin', 'governance_admin')
    )
  );

-- RLS Policy: System can always write to audit_log (no checks)
CREATE POLICY IF NOT EXISTS "System write access to audit_log"
  ON public.audit_log
  FOR INSERT WITH CHECK (true);

-- RLS Policy: Only admins can access rows in model_access_log
CREATE POLICY IF NOT EXISTS "Admin access to model_access_log"
  ON public.model_access_log
  FOR ALL USING (
    EXISTS (
      SELECT 1
      FROM public.access_controls ac
      WHERE ac.user_id = auth.uid()::text
        AND ac.role IN ('super_admin', 'governance_admin')
    )
  );

-- =====================================================================
-- INDEXES
--
-- Create indexes to speed up common queries on timestamp, severity,
-- user_id, and other frequently filtered columns.  Use IF NOT EXISTS
-- to avoid duplicate indexes if the migration runs multiple times.

CREATE INDEX IF NOT EXISTS idx_security_events_timestamp
  ON public.security_events (timestamp);
CREATE INDEX IF NOT EXISTS idx_security_events_user_id
  ON public.security_events (user_id);
CREATE INDEX IF NOT EXISTS idx_security_events_severity
  ON public.security_events (severity);
CREATE INDEX IF NOT EXISTS idx_security_events_event_type
  ON public.security_events (event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_ip_address
  ON public.security_events (ip_address);

CREATE INDEX IF NOT EXISTS idx_access_controls_user_id
  ON public.access_controls (user_id);
CREATE INDEX IF NOT EXISTS idx_access_controls_role
  ON public.access_controls (role);
CREATE INDEX IF NOT EXISTS idx_access_controls_locked_until
  ON public.access_controls (locked_until);

CREATE INDEX IF NOT EXISTS idx_api_keys_key_hash
  ON public.api_keys (key_hash);
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id
  ON public.api_keys (user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_expires_at
  ON public.api_keys (expires_at);

CREATE INDEX IF NOT EXISTS idx_security_alerts_severity
  ON public.security_alerts (severity);
CREATE INDEX IF NOT EXISTS idx_security_alerts_status
  ON public.security_alerts (status);
CREATE INDEX IF NOT EXISTS idx_security_alerts_created_at
  ON public.security_alerts (created_at);

CREATE INDEX IF NOT EXISTS idx_audit_log_user_id
  ON public.audit_log (user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_timestamp
  ON public.audit_log (timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_log_action
  ON public.audit_log (action);

CREATE INDEX IF NOT EXISTS idx_model_access_log_user_id
  ON public.model_access_log (user_id);
CREATE INDEX IF NOT EXISTS idx_model_access_log_model_id
  ON public.model_access_log (model_id);
CREATE INDEX IF NOT EXISTS idx_model_access_log_timestamp
  ON public.model_access_log (timestamp);

-- =====================================================================
-- DEFAULT DATA
--
-- Insert baseline security rules and access control records.  Wrap
-- literal text in single quotes and escape embedded single quotes by
-- doubling them (''), so Postgres interprets them as strings.  Use
-- ON CONFLICT to avoid duplicate inserts on subsequent runs.

INSERT INTO public.security_rules (name, condition, action, severity) VALUES
  -- Authentication Security
  ('Multiple Failed Logins', 'failed_attempts >= 5', 'lockout', 'high'),
  ('Unusual IP Access', 'ip_address NOT IN whitelist AND role = ''admin''', 'alert', 'medium'),
  ('Rapid API Requests', 'requests_per_minute > 100', 'block', 'medium'),
  -- Data Protection
  ('Large Data Export', 'request_size > 1000000', 'block', 'high'),
  ('Unauthorized Model Access', 'access_type = ''download'' AND permission_denied', 'alert', 'critical'),
  ('Suspicious Data Pattern', 'unusual_access_pattern = true', 'alert', 'high'),
  -- System Security
  ('Admin Privilege Escalation', 'role_change = true', 'alert', 'critical'),
  ('System Configuration Change', 'resource LIKE ''%config%''', 'audit', 'medium'),
  ('Security Rule Modification', 'resource = ''security_rules''', 'audit', 'high')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.access_controls (user_id, role, permissions, restrictions) VALUES
  ('admin@dealershipai.com', 'super_admin', ARRAY['*'], '{"mfa_required": true, "session_timeout": 3600, "ip_whitelist": ["127.0.0.1", "::1"]}'::jsonb),
  ('governance@dealershipai.com', 'governance_admin', ARRAY['governance.read', 'governance.write', 'model.freeze', 'model.unfreeze', 'audit.read'], '{"mfa_required": true, "session_timeout": 7200}'::jsonb),
  ('engineer@dealershipai.com', 'model_engineer', ARRAY['model.read', 'governance.read'], '{"mfa_required": false, "session_timeout": 14400}'::jsonb),
  ('viewer@dealershipai.com', 'viewer', ARRAY['dashboard.read'], '{"mfa_required": false, "session_timeout": 28800}'::jsonb)
ON CONFLICT (user_id) DO NOTHING;

-- =====================================================================
-- FUNCTIONS
--
-- Provide reusable helpers for checking permissions, logging events, and
-- rate limiting.  SECURITY DEFINER ensures functions run with the
-- privileges of their creator.

CREATE OR REPLACE FUNCTION public.check_user_permissions(
    user_id_param TEXT,
    resource_param TEXT,
    action_param TEXT
) RETURNS BOOLEAN AS $$
DECLARE
    user_permissions TEXT[];
    required_permission TEXT;
BEGIN
    SELECT permissions INTO user_permissions
    FROM public.access_controls
    WHERE user_id = user_id_param;
    IF user_permissions IS NULL THEN
        RETURN FALSE;
    END IF;
    IF '*' = ANY(user_permissions) THEN
        RETURN TRUE;
    END IF;
    required_permission := resource_param || '.' || action_param;
    RETURN required_permission = ANY(user_permissions);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.log_security_event(
    event_type_param TEXT,
    severity_param TEXT,
    user_id_param TEXT,
    ip_address_param INET,
    user_agent_param TEXT,
    resource_param TEXT,
    action_param TEXT,
    details_param JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    event_id UUID;
BEGIN
    INSERT INTO public.security_events (
        event_type, severity, user_id, ip_address, user_agent, resource, action, details
    ) VALUES (
        event_type_param, severity_param, user_id_param, ip_address_param,
        user_agent_param, resource_param, action_param, details_param
    ) RETURNING id INTO event_id;
    RETURN event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.check_rate_limit(
    identifier_param TEXT,
    limit_param INTEGER DEFAULT 100,
    window_minutes_param INTEGER DEFAULT 15
) RETURNS BOOLEAN AS $$
DECLARE
    request_count INTEGER;
    window_start TIMESTAMPTZ;
BEGIN
    window_start := NOW() - (window_minutes_param || ' minutes')::INTERVAL;
    SELECT COUNT(*) INTO request_count
    FROM public.security_events
    WHERE ip_address = identifier_param::INET
      AND timestamp >= window_start
      AND event_type IN ('login', 'access');
    RETURN request_count < limit_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execution rights for functions to anonymous and authenticated
GRANT EXECUTE ON FUNCTION public.check_user_permissions(TEXT, TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.log_security_event(TEXT, TEXT, TEXT, INET, TEXT, TEXT, TEXT, JSONB) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.check_rate_limit(TEXT, INTEGER, INTEGER) TO anon, authenticated;

-- =====================================================================
-- AUDIT TRIGGER INFRASTRUCTURE
--
-- Define a generic trigger function to log inserts, updates, and deletes
-- into the audit_log table.  Use SECURITY DEFINER to ensure the
-- function can access current_setting() for request metadata.

CREATE OR REPLACE FUNCTION public.audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        INSERT INTO public.audit_log (user_id, action, resource, old_values, ip_address, user_agent)
        VALUES (
            COALESCE(current_setting('request.jwt.claims', true)::json->>'sub', 'system'),
            'DELETE',
            TG_TABLE_NAME,
            to_jsonb(OLD),
            inet_client_addr(),
            current_setting('request.headers', true)::json->>'user-agent'
        );
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO public.audit_log (user_id, action, resource, old_values, new_values, ip_address, user_agent)
        VALUES (
            COALESCE(current_setting('request.jwt.claims', true)::json->>'sub', 'system'),
            'UPDATE',
            TG_TABLE_NAME,
            to_jsonb(OLD),
            to_jsonb(NEW),
            inet_client_addr(),
            current_setting('request.headers', true)::json->>'user-agent'
        );
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO public.audit_log (user_id, action, resource, new_values, ip_address, user_agent)
        VALUES (
            COALESCE(current_setting('request.jwt.claims', true)::json->>'sub', 'system'),
            'INSERT',
            TG_TABLE_NAME,
            to_jsonb(NEW),
            inet_client_addr(),
            current_setting('request.headers', true)::json->>'user-agent'
        );
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit triggers only to tables that exist in this schema.  Do not
-- reference non‑existent tables (e.g., governance_rules or model_weights)
-- to avoid errors during creation.  Additional triggers can be added
-- later when those tables are defined.

CREATE TRIGGER audit_access_controls_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.access_controls
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

CREATE TRIGGER audit_security_rules_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.security_rules
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();