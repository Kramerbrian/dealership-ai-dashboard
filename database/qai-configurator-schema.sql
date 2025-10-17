-- QAI Dashboard Configurator Schema
-- JSON-based configuration for dashboard metrics, alerts, and actions

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Dashboard configurations
CREATE TABLE qai_dashboard_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    config_name VARCHAR(255) NOT NULL,
    config_type VARCHAR(50) NOT NULL CHECK (config_type IN ('metrics', 'alerts', 'actions', 'layout')),
    config_data JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    
    UNIQUE(tenant_id, config_name, config_type)
);

-- Metrics configuration
CREATE TABLE qai_metrics_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    metric_name VARCHAR(255) NOT NULL,
    metric_type VARCHAR(50) NOT NULL CHECK (metric_type IN ('aiv', 'ati', 'crs', 'elasticity', 'custom')),
    display_name VARCHAR(255) NOT NULL,
    description TEXT,
    calculation_formula JSONB,
    thresholds JSONB, -- {warning: 70, critical: 50}
    visualization_config JSONB, -- {chart_type: 'line', color: '#3b82f6'}
    is_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(tenant_id, metric_name)
);

-- Alerts configuration
CREATE TABLE qai_alerts_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    alert_name VARCHAR(255) NOT NULL,
    metric_name VARCHAR(255) NOT NULL,
    condition_type VARCHAR(50) NOT NULL CHECK (condition_type IN ('threshold', 'trend', 'anomaly')),
    condition_config JSONB NOT NULL, -- {operator: '>', value: 80, time_window: '24h'}
    notification_channels JSONB, -- ['email', 'slack', 'webhook']
    severity VARCHAR(20) DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    is_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(tenant_id, alert_name)
);

-- Actions configuration
CREATE TABLE qai_actions_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    action_name VARCHAR(255) NOT NULL,
    action_type VARCHAR(50) NOT NULL CHECK (action_type IN ('automated_fix', 'notification', 'report', 'integration')),
    trigger_conditions JSONB NOT NULL,
    action_config JSONB NOT NULL,
    is_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(tenant_id, action_name)
);

-- Dashboard layouts
CREATE TABLE qai_dashboard_layouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    layout_name VARCHAR(255) NOT NULL,
    layout_config JSONB NOT NULL, -- Grid layout, widget positions, etc.
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(tenant_id, layout_name)
);

-- Audit log for configuration changes
CREATE TABLE qai_config_audit (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    config_type VARCHAR(50) NOT NULL,
    config_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL CHECK (action IN ('create', 'update', 'delete', 'activate', 'deactivate')),
    old_values JSONB,
    new_values JSONB,
    changed_by UUID,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reason TEXT
);

-- Indexes for performance
CREATE INDEX idx_qai_dashboard_configs_tenant ON qai_dashboard_configs(tenant_id);
CREATE INDEX idx_qai_metrics_config_tenant ON qai_metrics_config(tenant_id);
CREATE INDEX idx_qai_alerts_config_tenant ON qai_alerts_config(tenant_id);
CREATE INDEX idx_qai_actions_config_tenant ON qai_actions_config(tenant_id);
CREATE INDEX idx_qai_dashboard_layouts_tenant ON qai_dashboard_layouts(tenant_id);
CREATE INDEX idx_qai_config_audit_tenant ON qai_config_audit(tenant_id);

-- RLS policies
ALTER TABLE qai_dashboard_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE qai_metrics_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE qai_alerts_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE qai_actions_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE qai_dashboard_layouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE qai_config_audit ENABLE ROW LEVEL SECURITY;

-- RLS policies (assuming tenant_id is the user's tenant)
CREATE POLICY "Users can view their own configs" ON qai_dashboard_configs
    FOR SELECT USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

CREATE POLICY "Users can modify their own configs" ON qai_dashboard_configs
    FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- Similar policies for other tables
CREATE POLICY "Users can view their own metrics" ON qai_metrics_config
    FOR SELECT USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

CREATE POLICY "Users can modify their own metrics" ON qai_metrics_config
    FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

CREATE POLICY "Users can view their own alerts" ON qai_alerts_config
    FOR SELECT USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

CREATE POLICY "Users can modify their own alerts" ON qai_alerts_config
    FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

CREATE POLICY "Users can view their own actions" ON qai_actions_config
    FOR SELECT USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

CREATE POLICY "Users can modify their own actions" ON qai_actions_config
    FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

CREATE POLICY "Users can view their own layouts" ON qai_dashboard_layouts
    FOR SELECT USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

CREATE POLICY "Users can modify their own layouts" ON qai_dashboard_layouts
    FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

CREATE POLICY "Users can view their own audit logs" ON qai_config_audit
    FOR SELECT USING (tenant_id = current_setting('app.current_tenant_id')::uuid);
