-- ==============================================
-- DTRI-MAXIMUS 4.0 COMPLETE SYSTEM
-- All migrations consolidated into one file
-- ==============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================
-- 1. QAI DASHBOARD CONFIGURATION TABLES
-- ==============================================

-- Dashboard configurations
CREATE TABLE IF NOT EXISTS qai_dashboard_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    config_name VARCHAR(255) NOT NULL,
    config_type VARCHAR(50) NOT NULL CHECK (config_type IN ('metrics', 'alerts', 'actions', 'layout')),
    config_data JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID,
    
    UNIQUE(tenant_id, config_name, config_type)
);

-- Metrics configuration
CREATE TABLE IF NOT EXISTS qai_metrics_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    metric_name VARCHAR(255) NOT NULL,
    metric_type VARCHAR(50) NOT NULL CHECK (metric_type IN ('aiv', 'ati', 'crs', 'elasticity', 'custom', 'dtri')),
    display_name VARCHAR(255) NOT NULL,
    description TEXT,
    calculation_formula JSONB,
    thresholds JSONB,
    visualization_config JSONB,
    is_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(tenant_id, metric_name)
);

-- Alerts configuration
CREATE TABLE IF NOT EXISTS qai_alerts_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    alert_name VARCHAR(255) NOT NULL,
    metric_name VARCHAR(255) NOT NULL,
    condition_type VARCHAR(50) NOT NULL CHECK (condition_type IN ('threshold', 'trend', 'anomaly')),
    condition_config JSONB NOT NULL,
    notification_channels JSONB,
    severity VARCHAR(20) DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    is_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(tenant_id, alert_name)
);

-- Actions configuration
CREATE TABLE IF NOT EXISTS qai_actions_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    action_name VARCHAR(255) NOT NULL,
    action_type VARCHAR(50) NOT NULL CHECK (action_type IN ('automated_fix', 'notification', 'report', 'integration')),
    trigger_conditions JSONB NOT NULL,
    action_config JSONB NOT NULL,
    is_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(tenant_id, action_name)
);

-- Dashboard layouts
CREATE TABLE IF NOT EXISTS qai_dashboard_layouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    layout_name VARCHAR(255) NOT NULL,
    layout_config JSONB NOT NULL,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(tenant_id, layout_name)
);

-- ==============================================
-- 2. DTRI-MAXIMUS SUPERMODAL (THE ANCHOR GAUGE)
-- ==============================================

-- Main DTRI-MAXIMUS Score Display
CREATE TABLE IF NOT EXISTS dtri_maximus_supermodal (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    dealership_id UUID NOT NULL,
    dtri_score DECIMAL(5,2) NOT NULL CHECK (dtri_score >= 0 AND dtri_score <= 100),
    score_color_code VARCHAR(10) NOT NULL CHECK (score_color_code IN ('green', 'yellow', 'red')),
    maximus_insight TEXT NOT NULL,
    profit_opportunity_dollars DECIMAL(12,2) NOT NULL,
    decay_tax_risk_dollars DECIMAL(12,2) NOT NULL,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(tenant_id, dealership_id)
);

-- ==============================================
-- 3. MICRO-SEGMENTATION FOR PRECISION
-- ==============================================

-- Micro-Segmented DTRI Scores
CREATE TABLE IF NOT EXISTS dtri_micro_segmented_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    dealership_id UUID NOT NULL,
    segment_type VARCHAR(20) NOT NULL CHECK (segment_type IN ('sales', 'service', 'leads', 'lifetime_value')),
    segment_name VARCHAR(100) NOT NULL,
    dtri_score DECIMAL(5,2) NOT NULL CHECK (dtri_score >= 0 AND dtri_score <= 100),
    primary_financial_link VARCHAR(100) NOT NULL,
    calculation_components JSONB NOT NULL,
    avg_gp_per_unit DECIMAL(10,2) NOT NULL,
    calculation_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(tenant_id, dealership_id, segment_type, calculation_date)
);

-- Segmented Lead Flow Quantification
CREATE TABLE IF NOT EXISTS dtri_segmented_lead_flow (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    dealership_id UUID NOT NULL,
    segment_type VARCHAR(20) NOT NULL CHECK (segment_type IN ('sales', 'service')),
    delta_leads INTEGER NOT NULL,
    dtri_gp_per_unit DECIMAL(10,2) NOT NULL,
    profit_lift DECIMAL(12,2) GENERATED ALWAYS AS (delta_leads * dtri_gp_per_unit) STORED,
    calculation_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(tenant_id, dealership_id, segment_type, calculation_date)
);

-- ==============================================
-- 4. AUTONOMOUS FEEDBACK LOOP
-- ==============================================

-- Closed-Loop Beta Coefficient Recalibration
CREATE TABLE IF NOT EXISTS dtri_beta_recalibration (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    dealership_id UUID NOT NULL,
    metric_name VARCHAR(100) NOT NULL,
    segment_type VARCHAR(20) NOT NULL CHECK (segment_type IN ('sales', 'service', 'leads', 'lifetime_value')),
    original_beta DECIMAL(6,4) NOT NULL,
    predicted_impact DECIMAL(6,4) NOT NULL,
    actual_impact DECIMAL(6,4) NOT NULL,
    new_beta DECIMAL(6,4) GENERATED ALWAYS AS (
        CASE 
            WHEN actual_impact != 0 THEN actual_impact / NULLIF(predicted_impact, 0)
            ELSE original_beta
        END
    ) STORED,
    recalibration_factor DECIMAL(6,4) GENERATED ALWAYS AS (
        CASE 
            WHEN predicted_impact != 0 THEN actual_impact / predicted_impact
            ELSE 1.0
        END
    ) STORED,
    validation_period_days INTEGER DEFAULT 90,
    recommendation_date TIMESTAMP WITH TIME ZONE NOT NULL,
    validation_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_applied BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- 5. MACHINE LEARNING FOR PREDICTIVE β-COEFFICIENTS
-- ==============================================

-- Dynamic β Calibration with Historical Data
CREATE TABLE IF NOT EXISTS dtri_ml_beta_calibration (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    dealership_id UUID NOT NULL,
    metric_name VARCHAR(100) NOT NULL,
    segment_type VARCHAR(20) NOT NULL CHECK (segment_type IN ('sales', 'service', 'leads', 'lifetime_value')),
    industry_beta DECIMAL(6,4) NOT NULL,
    dealer_specific_beta DECIMAL(6,4) NOT NULL,
    calibration_method VARCHAR(50) NOT NULL,
    historical_data_points INTEGER NOT NULL,
    r_squared DECIMAL(4,3) NOT NULL CHECK (r_squared >= 0 AND r_squared <= 1),
    confidence_interval_lower DECIMAL(6,4) NOT NULL,
    confidence_interval_upper DECIMAL(6,4) NOT NULL,
    last_calibrated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(tenant_id, dealership_id, metric_name, segment_type)
);

-- ==============================================
-- 6. AUTONOMOUS AGENTIC LOGIC
-- ==============================================

-- Threshold Violation Alerts with Autonomous Triggers
CREATE TABLE IF NOT EXISTS dtri_autonomous_triggers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    dealership_id UUID NOT NULL,
    trigger_name VARCHAR(100) NOT NULL,
    metric_name VARCHAR(100) NOT NULL,
    threshold_condition VARCHAR(20) NOT NULL CHECK (threshold_condition IN ('below', 'above', 'equals', 'changes_by')),
    threshold_value DECIMAL(10,4) NOT NULL,
    trigger_action VARCHAR(100) NOT NULL,
    action_parameters JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    last_triggered TIMESTAMP WITH TIME ZONE,
    trigger_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(tenant_id, dealership_id, trigger_name)
);

-- ==============================================
-- 7. CONTEXTUAL FILTERING
-- ==============================================

-- Vehicle Segment TSM Calibration
CREATE TABLE IF NOT EXISTS dtri_segment_tsm_calibration (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    dealership_id UUID NOT NULL,
    segment_type VARCHAR(50) NOT NULL,
    brand_type VARCHAR(50) NOT NULL,
    metric_name VARCHAR(100) NOT NULL,
    base_tsm DECIMAL(3,2) NOT NULL,
    segment_multiplier DECIMAL(3,2) NOT NULL,
    contextual_factors JSONB NOT NULL,
    effective_tsm DECIMAL(3,2) GENERATED ALWAYS AS (base_tsm * segment_multiplier) STORED,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(tenant_id, dealership_id, segment_type, brand_type, metric_name)
);

-- ==============================================
-- 8. CAUSAL FORECASTING
-- ==============================================

-- Time Series Forecasting Models
CREATE TABLE IF NOT EXISTS dtri_time_series_models (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    dealership_id UUID NOT NULL,
    model_name VARCHAR(100) NOT NULL,
    model_type VARCHAR(50) NOT NULL,
    target_metric VARCHAR(100) NOT NULL,
    forecast_horizon_days INTEGER NOT NULL,
    model_accuracy DECIMAL(4,3) NOT NULL CHECK (model_accuracy >= 0 AND model_accuracy <= 1),
    model_parameters JSONB NOT NULL,
    training_data_period_days INTEGER NOT NULL,
    last_trained TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    next_retrain_date TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(tenant_id, dealership_id, model_name)
);

-- ==============================================
-- PERFORMANCE-OPTIMIZED INDEXES
-- ==============================================

-- QAI Configuration Indexes
CREATE INDEX IF NOT EXISTS idx_qai_dashboard_configs_tenant ON qai_dashboard_configs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_qai_metrics_config_tenant ON qai_metrics_config(tenant_id);
CREATE INDEX IF NOT EXISTS idx_qai_alerts_config_tenant ON qai_alerts_config(tenant_id);
CREATE INDEX IF NOT EXISTS idx_qai_actions_config_tenant ON qai_actions_config(tenant_id);
CREATE INDEX IF NOT EXISTS idx_qai_dashboard_layouts_tenant ON qai_dashboard_layouts(tenant_id);

-- DTRI-MAXIMUS Indexes
CREATE INDEX IF NOT EXISTS idx_dtri_maximus_supermodal_tenant ON dtri_maximus_supermodal(tenant_id);
CREATE INDEX IF NOT EXISTS idx_dtri_maximus_supermodal_dealership ON dtri_maximus_supermodal(dealership_id);
CREATE INDEX IF NOT EXISTS idx_dtri_maximus_supermodal_score ON dtri_maximus_supermodal(dtri_score);

-- Micro-Segmentation Indexes
CREATE INDEX IF NOT EXISTS idx_dtri_micro_segmented_scores_tenant ON dtri_micro_segmented_scores(tenant_id);
CREATE INDEX IF NOT EXISTS idx_dtri_micro_segmented_scores_dealership ON dtri_micro_segmented_scores(dealership_id);
CREATE INDEX IF NOT EXISTS idx_dtri_micro_segmented_scores_segment ON dtri_micro_segmented_scores(segment_type);

CREATE INDEX IF NOT EXISTS idx_dtri_segmented_lead_flow_tenant ON dtri_segmented_lead_flow(tenant_id);
CREATE INDEX IF NOT EXISTS idx_dtri_segmented_lead_flow_dealership ON dtri_segmented_lead_flow(dealership_id);
CREATE INDEX IF NOT EXISTS idx_dtri_segmented_lead_flow_segment ON dtri_segmented_lead_flow(segment_type);

-- Feedback Loop Indexes
CREATE INDEX IF NOT EXISTS idx_dtri_beta_recalibration_tenant ON dtri_beta_recalibration(tenant_id);
CREATE INDEX IF NOT EXISTS idx_dtri_beta_recalibration_dealership ON dtri_beta_recalibration(dealership_id);
CREATE INDEX IF NOT EXISTS idx_dtri_beta_recalibration_metric ON dtri_beta_recalibration(metric_name);

-- ML Predictive Indexes
CREATE INDEX IF NOT EXISTS idx_dtri_ml_beta_calibration_tenant ON dtri_ml_beta_calibration(tenant_id);
CREATE INDEX IF NOT EXISTS idx_dtri_ml_beta_calibration_dealership ON dtri_ml_beta_calibration(dealership_id);
CREATE INDEX IF NOT EXISTS idx_dtri_ml_beta_calibration_metric ON dtri_ml_beta_calibration(metric_name);

-- Autonomous Agent Indexes
CREATE INDEX IF NOT EXISTS idx_dtri_autonomous_triggers_tenant ON dtri_autonomous_triggers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_dtri_autonomous_triggers_dealership ON dtri_autonomous_triggers(dealership_id);
CREATE INDEX IF NOT EXISTS idx_dtri_autonomous_triggers_active ON dtri_autonomous_triggers(is_active) WHERE is_active = true;

-- Contextual Filtering Indexes
CREATE INDEX IF NOT EXISTS idx_dtri_segment_tsm_calibration_tenant ON dtri_segment_tsm_calibration(tenant_id);
CREATE INDEX IF NOT EXISTS idx_dtri_segment_tsm_calibration_dealership ON dtri_segment_tsm_calibration(dealership_id);
CREATE INDEX IF NOT EXISTS idx_dtri_segment_tsm_calibration_segment ON dtri_segment_tsm_calibration(segment_type);

-- Causal Forecasting Indexes
CREATE INDEX IF NOT EXISTS idx_dtri_time_series_models_tenant ON dtri_time_series_models(tenant_id);
CREATE INDEX IF NOT EXISTS idx_dtri_time_series_models_dealership ON dtri_time_series_models(dealership_id);
CREATE INDEX IF NOT EXISTS idx_dtri_time_series_models_type ON dtri_time_series_models(model_type);
CREATE INDEX IF NOT EXISTS idx_dtri_time_series_models_active ON dtri_time_series_models(is_active) WHERE is_active = true;

-- ==============================================
-- ROW LEVEL SECURITY (RLS)
-- ==============================================

-- Enable RLS on all tables
ALTER TABLE qai_dashboard_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE qai_metrics_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE qai_alerts_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE qai_actions_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE qai_dashboard_layouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE dtri_maximus_supermodal ENABLE ROW LEVEL SECURITY;
ALTER TABLE dtri_micro_segmented_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE dtri_segmented_lead_flow ENABLE ROW LEVEL SECURITY;
ALTER TABLE dtri_beta_recalibration ENABLE ROW LEVEL SECURITY;
ALTER TABLE dtri_ml_beta_calibration ENABLE ROW LEVEL SECURITY;
ALTER TABLE dtri_autonomous_triggers ENABLE ROW LEVEL SECURITY;
ALTER TABLE dtri_segment_tsm_calibration ENABLE ROW LEVEL SECURITY;
ALTER TABLE dtri_time_series_models ENABLE ROW LEVEL SECURITY;

-- RLS policies for all tables
CREATE POLICY IF NOT EXISTS "Users can view their own qai configs" ON qai_dashboard_configs
    FOR SELECT USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

CREATE POLICY IF NOT EXISTS "Users can modify their own qai configs" ON qai_dashboard_configs
    FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

CREATE POLICY IF NOT EXISTS "Users can view their own qai metrics" ON qai_metrics_config
    FOR SELECT USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

CREATE POLICY IF NOT EXISTS "Users can modify their own qai metrics" ON qai_metrics_config
    FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

CREATE POLICY IF NOT EXISTS "Users can view their own qai alerts" ON qai_alerts_config
    FOR SELECT USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

CREATE POLICY IF NOT EXISTS "Users can modify their own qai alerts" ON qai_alerts_config
    FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

CREATE POLICY IF NOT EXISTS "Users can view their own qai actions" ON qai_actions_config
    FOR SELECT USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

CREATE POLICY IF NOT EXISTS "Users can modify their own qai actions" ON qai_actions_config
    FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

CREATE POLICY IF NOT EXISTS "Users can view their own qai layouts" ON qai_dashboard_layouts
    FOR SELECT USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

CREATE POLICY IF NOT EXISTS "Users can modify their own qai layouts" ON qai_dashboard_layouts
    FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

CREATE POLICY IF NOT EXISTS "Users can view their own supermodal" ON dtri_maximus_supermodal
    FOR SELECT USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

CREATE POLICY IF NOT EXISTS "Users can modify their own supermodal" ON dtri_maximus_supermodal
    FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

CREATE POLICY IF NOT EXISTS "Users can view their own micro segmented scores" ON dtri_micro_segmented_scores
    FOR SELECT USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

CREATE POLICY IF NOT EXISTS "Users can modify their own micro segmented scores" ON dtri_micro_segmented_scores
    FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

CREATE POLICY IF NOT EXISTS "Users can view their own segmented lead flow" ON dtri_segmented_lead_flow
    FOR SELECT USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

CREATE POLICY IF NOT EXISTS "Users can modify their own segmented lead flow" ON dtri_segmented_lead_flow
    FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

CREATE POLICY IF NOT EXISTS "Users can view their own beta recalibration" ON dtri_beta_recalibration
    FOR SELECT USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

CREATE POLICY IF NOT EXISTS "Users can modify their own beta recalibration" ON dtri_beta_recalibration
    FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

CREATE POLICY IF NOT EXISTS "Users can view their own ml beta calibration" ON dtri_ml_beta_calibration
    FOR SELECT USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

CREATE POLICY IF NOT EXISTS "Users can modify their own ml beta calibration" ON dtri_ml_beta_calibration
    FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

CREATE POLICY IF NOT EXISTS "Users can view their own autonomous triggers" ON dtri_autonomous_triggers
    FOR SELECT USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

CREATE POLICY IF NOT EXISTS "Users can modify their own autonomous triggers" ON dtri_autonomous_triggers
    FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

CREATE POLICY IF NOT EXISTS "Users can view their own segment tsm calibration" ON dtri_segment_tsm_calibration
    FOR SELECT USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

CREATE POLICY IF NOT EXISTS "Users can modify their own segment tsm calibration" ON dtri_segment_tsm_calibration
    FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

CREATE POLICY IF NOT EXISTS "Users can view their own time series models" ON dtri_time_series_models
    FOR SELECT USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

CREATE POLICY IF NOT EXISTS "Users can modify their own time series models" ON dtri_time_series_models
    FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- ==============================================
-- TRIGGERS AND FUNCTIONS
-- ==============================================

-- Add function for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at timestamps
CREATE TRIGGER IF NOT EXISTS update_qai_dashboard_configs_updated_at 
    BEFORE UPDATE ON qai_dashboard_configs 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_qai_metrics_config_updated_at 
    BEFORE UPDATE ON qai_metrics_config 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_qai_alerts_config_updated_at 
    BEFORE UPDATE ON qai_alerts_config 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_qai_actions_config_updated_at 
    BEFORE UPDATE ON qai_actions_config 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_qai_dashboard_layouts_updated_at 
    BEFORE UPDATE ON qai_dashboard_layouts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_dtri_autonomous_triggers_updated_at 
    BEFORE UPDATE ON dtri_autonomous_triggers 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_dtri_time_series_models_updated_at 
    BEFORE UPDATE ON dtri_time_series_models 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================
-- COMMENTS AND DOCUMENTATION
-- ==============================================

-- Table comments
COMMENT ON TABLE qai_dashboard_configs IS 'QAI Dashboard configuration settings for metrics, alerts, and actions';
COMMENT ON TABLE qai_metrics_config IS 'QAI Metrics configuration with thresholds and visualization settings';
COMMENT ON TABLE qai_alerts_config IS 'QAI Alerts configuration with conditions and notification channels';
COMMENT ON TABLE qai_actions_config IS 'QAI Actions configuration for automated fixes and integrations';
COMMENT ON TABLE qai_dashboard_layouts IS 'QAI Dashboard layout configurations for different user preferences';
COMMENT ON TABLE dtri_maximus_supermodal IS 'DTRI-MAXIMUS Supermodal: The primary anchor gauge displaying composite risk/reward score';
COMMENT ON TABLE dtri_micro_segmented_scores IS 'Micro-segmented DTRI scores for precision revenue stream tracking';
COMMENT ON TABLE dtri_segmented_lead_flow IS 'Segmented lead flow quantification with profit lift calculations';
COMMENT ON TABLE dtri_beta_recalibration IS 'Closed-loop beta coefficient recalibration based on actual results';
COMMENT ON TABLE dtri_ml_beta_calibration IS 'Machine learning-based dynamic β-coefficient calibration';
COMMENT ON TABLE dtri_autonomous_triggers IS 'Autonomous agent triggers for threshold violation alerts';
COMMENT ON TABLE dtri_segment_tsm_calibration IS 'Vehicle segment-specific TSM calibration for contextual filtering';
COMMENT ON TABLE dtri_time_series_models IS 'Time series forecasting models (ARIMA, Prophet, LSTM, XGBoost)';

-- ==============================================
-- SAMPLE DATA INSERTION
-- ==============================================

-- Insert sample DTRI-MAXIMUS Supermodal data
INSERT INTO dtri_maximus_supermodal (
    tenant_id, 
    dealership_id, 
    dtri_score, 
    score_color_code, 
    maximus_insight, 
    profit_opportunity_dollars, 
    decay_tax_risk_dollars
) VALUES (
    '00000000-0000-0000-0000-000000000000'::uuid,
    '11111111-1111-1111-1111-111111111111'::uuid,
    85.2,
    'green',
    'Your current score translates to an immediate $90,000 Profit Opportunity and $18,000 in Decay Tax Risk.',
    90000,
    18000
) ON CONFLICT (tenant_id, dealership_id) DO NOTHING;

-- Insert sample micro-segmented scores
INSERT INTO dtri_micro_segmented_scores (
    tenant_id,
    dealership_id,
    segment_type,
    segment_name,
    dtri_score,
    primary_financial_link,
    calculation_components,
    avg_gp_per_unit
) VALUES 
(
    '00000000-0000-0000-0000-000000000000'::uuid,
    '11111111-1111-1111-1111-111111111111'::uuid,
    'sales',
    'Sales Trust Score (DTRI-S)',
    87.3,
    'Sales GPPU (New/Used vehicle gross profit)',
    '{"pricing_disparity": 0.4, "vdp_detail_score": 0.6}',
    3500
),
(
    '00000000-0000-0000-0000-000000000000'::uuid,
    '11111111-1111-1111-1111-111111111111'::uuid,
    'service',
    'Service Trust Score (DTRI-F)',
    82.1,
    'Fixed Ops GP/RO (Service and Parts gross profit)',
    '{"ftfr_proxy": 0.5, "review_service_sentiment": 0.5}',
    450
) ON CONFLICT (tenant_id, dealership_id, segment_type, calculation_date) DO NOTHING;

-- Insert sample segmented lead flow
INSERT INTO dtri_segmented_lead_flow (
    tenant_id,
    dealership_id,
    segment_type,
    delta_leads,
    dtri_gp_per_unit
) VALUES 
(
    '00000000-0000-0000-0000-000000000000'::uuid,
    '11111111-1111-1111-1111-111111111111'::uuid,
    'sales',
    15,
    3500
),
(
    '00000000-0000-0000-0000-000000000000'::uuid,
    '11111111-1111-1111-1111-111111111111'::uuid,
    'service',
    8,
    450
) ON CONFLICT (tenant_id, dealership_id, segment_type, calculation_date) DO NOTHING;

-- Insert sample ML beta calibration
INSERT INTO dtri_ml_beta_calibration (
    tenant_id,
    dealership_id,
    metric_name,
    segment_type,
    industry_beta,
    dealer_specific_beta,
    calibration_method,
    historical_data_points,
    r_squared,
    confidence_interval_lower,
    confidence_interval_upper
) VALUES 
(
    '00000000-0000-0000-0000-000000000000'::uuid,
    '11111111-1111-1111-1111-111111111111'::uuid,
    'VDP_Speed_Score_LCP',
    'sales',
    0.008,
    0.012,
    'multiple_regression',
    120,
    0.847,
    0.009,
    0.015
) ON CONFLICT (tenant_id, dealership_id, metric_name, segment_type) DO NOTHING;

-- Insert sample autonomous triggers
INSERT INTO dtri_autonomous_triggers (
    tenant_id,
    dealership_id,
    trigger_name,
    metric_name,
    threshold_condition,
    threshold_value,
    trigger_action,
    action_parameters
) VALUES 
(
    '00000000-0000-0000-0000-000000000000'::uuid,
    '11111111-1111-1111-1111-111111111111'::uuid,
    'VDP_Speed_Alert',
    'VDP_Speed_Score_LCP',
    'below',
    3.0,
    'generate_sow',
    '{"sow_template": "vdp_speed_optimization", "target_departments": ["CTO", "CMO"]}'
) ON CONFLICT (tenant_id, dealership_id, trigger_name) DO NOTHING;

-- Insert sample segment TSM calibration
INSERT INTO dtri_segment_tsm_calibration (
    tenant_id,
    dealership_id,
    segment_type,
    brand_type,
    metric_name,
    base_tsm,
    segment_multiplier,
    contextual_factors
) VALUES 
(
    '00000000-0000-0000-0000-000000000000'::uuid,
    '11111111-1111-1111-1111-111111111111'::uuid,
    'luxury',
    'BMW',
    'VDP_Speed_Score_LCP',
    1.0,
    1.4,
    '{"economic_conditions": "recession_fears", "buyer_behavior": "convenience_focused"}'
) ON CONFLICT (tenant_id, dealership_id, segment_type, brand_type, metric_name) DO NOTHING;

-- Insert sample time series model
INSERT INTO dtri_time_series_models (
    tenant_id,
    dealership_id,
    model_name,
    model_type,
    target_metric,
    forecast_horizon_days,
    model_accuracy,
    model_parameters,
    training_data_period_days
) VALUES 
(
    '00000000-0000-0000-0000-000000000000'::uuid,
    '11111111-1111-1111-1111-111111111111'::uuid,
    'dtri_arima',
    'ARIMA',
    'DTRI_Score',
    180,
    0.92,
    '{"p": 2, "d": 1, "q": 1}',
    365
) ON CONFLICT (tenant_id, dealership_id, model_name) DO NOTHING;

-- ==============================================
-- COMPLETION MESSAGE
-- ==============================================

-- This completes the DTRI-MAXIMUS 4.0 system setup
-- All tables, indexes, RLS policies, triggers, and sample data have been created
-- The system is now ready for production use
