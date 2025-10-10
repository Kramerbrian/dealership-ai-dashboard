-- Security Framework Database Schema
-- Implements comprehensive security, access control, and threat detection

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Security Events Table
CREATE TABLE IF NOT EXISTS public.security_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    event_type TEXT NOT NULL CHECK (event_type IN ('login', 'access', 'violation', 'threat', 'admin_action')),
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    user_id TEXT,
    ip_address INET NOT NULL,
    user_agent TEXT,
    resource TEXT NOT NULL,
    action TEXT NOT NULL,
    details JSONB,
    geolocation JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Access Controls Table
CREATE TABLE IF NOT EXISTS public.access_controls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL CHECK (role IN ('super_admin', 'governance_admin', 'model_engineer', 'viewer')),
    permissions TEXT[] NOT NULL,
    restrictions JSONB NOT NULL,
    last_access TIMESTAMP WITH TIME ZONE,
    failed_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Security Rules Table
CREATE TABLE IF NOT EXISTS public.security_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    condition TEXT NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('alert', 'block', 'lockout', 'audit')),
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- API Keys Table (for secure API access)
CREATE TABLE IF NOT EXISTS public.api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key_name TEXT NOT NULL,
    key_hash TEXT NOT NULL UNIQUE,
    user_id TEXT NOT NULL,
    permissions TEXT[] NOT NULL,
    rate_limit INTEGER DEFAULT 1000, -- requests per hour
    expires_at TIMESTAMP WITH TIME ZONE,
    last_used TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'false_positive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by TEXT
);

-- Audit Log Table (for compliance)
CREATE TABLE IF NOT EXISTS public.audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT,
    action TEXT NOT NULL,
    resource TEXT NOT NULL,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    session_id TEXT
);

-- Model Access Log (for IP protection)
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
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_controls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.model_access_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Security Events
CREATE POLICY "Admin read access to security_events" ON public.security_events
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM access_controls 
            WHERE user_id = auth.uid()::text 
            AND role IN ('super_admin', 'governance_admin')
        )
    );

CREATE POLICY "System write access to security_events" ON public.security_events
    FOR INSERT WITH CHECK (true); -- System can always log events

-- RLS Policies for Access Controls
CREATE POLICY "Admin access to access_controls" ON public.access_controls
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM access_controls 
            WHERE user_id = auth.uid()::text 
            AND role = 'super_admin'
        )
    );

-- RLS Policies for Security Rules
CREATE POLICY "Admin access to security_rules" ON public.security_rules
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM access_controls 
            WHERE user_id = auth.uid()::text 
            AND role IN ('super_admin', 'governance_admin')
        )
    );

-- RLS Policies for API Keys
CREATE POLICY "User access to own api_keys" ON public.api_keys
    FOR ALL USING (user_id = auth.uid()::text);

-- RLS Policies for Security Alerts
CREATE POLICY "Admin access to security_alerts" ON public.security_alerts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM access_controls 
            WHERE user_id = auth.uid()::text 
            AND role IN ('super_admin', 'governance_admin')
        )
    );

-- RLS Policies for Audit Log
CREATE POLICY "Admin read access to audit_log" ON public.audit_log
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM access_controls 
            WHERE user_id = auth.uid()::text 
            AND role IN ('super_admin', 'governance_admin')
        )
    );

CREATE POLICY "System write access to audit_log" ON public.audit_log
    FOR INSERT WITH CHECK (true); -- System can always log audit events

-- RLS Policies for Model Access Log
CREATE POLICY "Admin access to model_access_log" ON public.model_access_log
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM access_controls 
            WHERE user_id = auth.uid()::text 
            AND role IN ('super_admin', 'governance_admin')
        )
    );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_security_events_timestamp ON public.security_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_security_events_user_id ON public.security_events(user_id);
CREATE INDEX IF NOT EXISTS idx_security_events_severity ON public.security_events(severity);
CREATE INDEX IF NOT EXISTS idx_security_events_event_type ON public.security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_ip_address ON public.security_events(ip_address);

CREATE INDEX IF NOT EXISTS idx_access_controls_user_id ON public.access_controls(user_id);
CREATE INDEX IF NOT EXISTS idx_access_controls_role ON public.access_controls(role);
CREATE INDEX IF NOT EXISTS idx_access_controls_locked_until ON public.access_controls(locked_until);

CREATE INDEX IF NOT EXISTS idx_api_keys_key_hash ON public.api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON public.api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_expires_at ON public.api_keys(expires_at);

CREATE INDEX IF NOT EXISTS idx_security_alerts_severity ON public.security_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_security_alerts_status ON public.security_alerts(status);
CREATE INDEX IF NOT EXISTS idx_security_alerts_created_at ON public.security_alerts(created_at);

CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON public.audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_timestamp ON public.audit_log(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON public.audit_log(action);

CREATE INDEX IF NOT EXISTS idx_model_access_log_user_id ON public.model_access_log(user_id);
CREATE INDEX IF NOT EXISTS idx_model_access_log_model_id ON public.model_access_log(model_id);
CREATE INDEX IF NOT EXISTS idx_model_access_log_timestamp ON public.model_access_log(timestamp);

-- Insert default security rules
INSERT INTO public.security_rules (name, condition, action, severity) VALUES
-- Authentication Security
('Multiple Failed Logins', 'failed_attempts >= 5', 'lockout', 'high'),
('Unusual IP Access', 'ip_address NOT IN whitelist AND role = admin', 'alert', 'medium'),
('Rapid API Requests', 'requests_per_minute > 100', 'block', 'medium'),

-- Data Protection
('Large Data Export', 'request_size > 1000000', 'block', 'high'),
('Unauthorized Model Access', 'access_type = download AND permission_denied', 'alert', 'critical'),
('Suspicious Data Pattern', 'unusual_access_pattern = true', 'alert', 'high'),

-- System Security
('Admin Privilege Escalation', 'role_change = true', 'alert', 'critical'),
('System Configuration Change', 'resource LIKE %config%', 'audit', 'medium'),
('Security Rule Modification', 'resource = security_rules', 'audit', 'high')
ON CONFLICT (name) DO NOTHING;

-- Insert default access controls (example)
INSERT INTO public.access_controls (user_id, role, permissions, restrictions) VALUES
('admin@dealershipai.com', 'super_admin', 
 ARRAY['*'], 
 '{"mfa_required": true, "session_timeout": 3600, "ip_whitelist": ["127.0.0.1", "::1"]}'::jsonb),
('governance@dealershipai.com', 'governance_admin', 
 ARRAY['governance.read', 'governance.write', 'model.freeze', 'model.unfreeze', 'audit.read'], 
 '{"mfa_required": true, "session_timeout": 7200}'::jsonb),
('engineer@dealershipai.com', 'model_engineer', 
 ARRAY['model.read', 'governance.read'], 
 '{"mfa_required": false, "session_timeout": 14400}'::jsonb),
('viewer@dealershipai.com', 'viewer', 
 ARRAY['dashboard.read'], 
 '{"mfa_required": false, "session_timeout": 28800}'::jsonb)
ON CONFLICT (user_id) DO NOTHING;

-- Create functions for security operations
CREATE OR REPLACE FUNCTION public.check_user_permissions(
    user_id_param TEXT,
    resource_param TEXT,
    action_param TEXT
) RETURNS BOOLEAN AS $$
DECLARE
    user_permissions TEXT[];
    required_permission TEXT;
BEGIN
    -- Get user permissions
    SELECT permissions INTO user_permissions
    FROM access_controls
    WHERE user_id = user_id_param;
    
    -- Check if user exists
    IF user_permissions IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Check for wildcard permission
    IF '*' = ANY(user_permissions) THEN
        RETURN TRUE;
    END IF;
    
    -- Check for specific permission
    required_permission := resource_param || '.' || action_param;
    RETURN required_permission = ANY(user_permissions);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log security events
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
    INSERT INTO security_events (
        event_type, severity, user_id, ip_address, user_agent, 
        resource, action, details
    ) VALUES (
        event_type_param, severity_param, user_id_param, ip_address_param, 
        user_agent_param, resource_param, action_param, details_param
    ) RETURNING id INTO event_id;
    
    RETURN event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check rate limiting
CREATE OR REPLACE FUNCTION public.check_rate_limit(
    identifier_param TEXT,
    limit_param INTEGER DEFAULT 100,
    window_minutes_param INTEGER DEFAULT 15
) RETURNS BOOLEAN AS $$
DECLARE
    request_count INTEGER;
    window_start TIMESTAMP WITH TIME ZONE;
BEGIN
    window_start := NOW() - (window_minutes_param || ' minutes')::INTERVAL;
    
    SELECT COUNT(*) INTO request_count
    FROM security_events
    WHERE ip_address = identifier_param::INET
    AND timestamp >= window_start
    AND event_type IN ('login', 'access');
    
    RETURN request_count < limit_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT SELECT ON public.security_events TO anon, authenticated;
GRANT SELECT ON public.access_controls TO anon, authenticated;
GRANT SELECT ON public.security_rules TO anon, authenticated;
GRANT SELECT ON public.api_keys TO anon, authenticated;
GRANT SELECT ON public.security_alerts TO anon, authenticated;
GRANT SELECT ON public.audit_log TO anon, authenticated;
GRANT SELECT ON public.model_access_log TO anon, authenticated;

GRANT EXECUTE ON FUNCTION public.check_user_permissions(TEXT, TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.log_security_event(TEXT, TEXT, TEXT, INET, TEXT, TEXT, TEXT, JSONB) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.check_rate_limit(TEXT, INTEGER, INTEGER) TO anon, authenticated;

-- Create triggers for automatic audit logging
CREATE OR REPLACE FUNCTION public.audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        INSERT INTO audit_log (user_id, action, resource, old_values, ip_address, user_agent)
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
        INSERT INTO audit_log (user_id, action, resource, old_values, new_values, ip_address, user_agent)
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
        INSERT INTO audit_log (user_id, action, resource, new_values, ip_address, user_agent)
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

-- Apply audit triggers to sensitive tables
CREATE TRIGGER audit_governance_rules_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.governance_rules
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

CREATE TRIGGER audit_model_weights_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.model_weights
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

CREATE TRIGGER audit_access_controls_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.access_controls
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

CREATE TRIGGER audit_security_rules_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.security_rules
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();
