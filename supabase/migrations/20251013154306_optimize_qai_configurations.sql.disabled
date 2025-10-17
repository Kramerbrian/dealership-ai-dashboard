-- DTRI (Digital Trust Revenue Index) System Migration
-- Comprehensive QAI configurations with DTRI financial modeling
-- Optimized for performance with enterprise-grade indexing

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================
-- QAI DASHBOARD CONFIGURATION TABLES
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

-- Add new columns if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'qai_dashboard_configs' AND column_name = 'created_by') THEN
        ALTER TABLE qai_dashboard_configs ADD COLUMN created_by UUID;
    END IF;
END $$;

-- Metrics configuration
CREATE TABLE IF NOT EXISTS qai_metrics_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    metric_name VARCHAR(255) NOT NULL,
    metric_type VARCHAR(50) NOT NULL CHECK (metric_type IN ('aiv', 'ati', 'crs', 'elasticity', 'custom', 'dtri')),
    display_name VARCHAR(255) NOT NULL,
    description TEXT,
    calculation_formula JSONB,
    thresholds JSONB, -- {warning: 70, critical: 50}
    visualization_config JSONB, -- {chart_type: 'line', color: '#3b82f6'}
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
    condition_config JSONB NOT NULL, -- {operator: '>', value: 80, time_window: '24h'}
    notification_channels JSONB, -- ['email', 'slack', 'webhook']
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
    layout_config JSONB NOT NULL, -- Grid layout, widget positions, etc.
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(tenant_id, layout_name)
);

-- ==============================================
-- DTRI FINANCIAL MODELING TABLES
-- ==============================================

-- DTRI Engine Specifications
CREATE TABLE IF NOT EXISTS dtri_engine_specs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    engine_id VARCHAR(50) NOT NULL DEFAULT 'DTRI-MAXIMUS-MASTER-4.0',
    engine_name VARCHAR(255) NOT NULL,
    rationale TEXT,
    model_type VARCHAR(100) NOT NULL,
    version_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(tenant_id, engine_id)
);

-- Financial Baseline and Context
CREATE TABLE IF NOT EXISTS dtri_financial_baseline (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    dealership_id UUID NOT NULL,
    current_monthly_units INTEGER,
    average_gross_profit_per_unit DECIMAL(10,2),
    current_blended_cac DECIMAL(10,2),
    organic_closing_rate DECIMAL(3,2) DEFAULT 0.20,
    service_closing_rate DECIMAL(3,2) DEFAULT 0.65,
    estimated_total_ad_spend DECIMAL(12,2),
    ftfr_to_margin_value_beta_dollars DECIMAL(10,2) DEFAULT 12000,
    tsm_formula TEXT,
    seasonality_adjustment JSONB, -- {"Q1": 0.9, "Q2": 1.1, "Q3": 1.2, "Q4": 1.0}
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(tenant_id, dealership_id)
);

-- DTRI Composite Scores
CREATE TABLE IF NOT EXISTS dtri_composite_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    dealership_id UUID NOT NULL,
    qai_score DECIMAL(5,2) NOT NULL CHECK (qai_score >= 0 AND qai_score <= 100),
    eeat_score DECIMAL(5,2) NOT NULL CHECK (eeat_score >= 0 AND eeat_score <= 100),
    dtri_score DECIMAL(5,2) GENERATED ALWAYS AS ((qai_score * 0.50) + (eeat_score * 0.50)) STORED,
    calculation_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- QAI Internal Execution Components
CREATE TABLE IF NOT EXISTS qai_internal_components (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    dealership_id UUID NOT NULL,
    component_id VARCHAR(50) NOT NULL, -- QAI-FTFR, QAI-VDPD, QAI-PROC, QAI-CERT
    component_name VARCHAR(255) NOT NULL,
    weight DECIMAL(3,2) NOT NULL,
    score DECIMAL(5,2) NOT NULL CHECK (score >= 0 AND score <= 100),
    lag_measure_id VARCHAR(50),
    financial_link VARCHAR(255),
    calculation_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(tenant_id, dealership_id, component_id, calculation_date)
);

-- E-E-A-T External Perception Components
CREATE TABLE IF NOT EXISTS eeat_external_components (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    dealership_id UUID NOT NULL,
    component_type VARCHAR(50) NOT NULL, -- Trustworthiness, Experience, Expertise, Authoritativeness
    component_name VARCHAR(255) NOT NULL,
    weight DECIMAL(3,2) NOT NULL,
    score DECIMAL(5,2) NOT NULL CHECK (score >= 0 AND score <= 100),
    input_metrics JSONB, -- Array of metric names
    calculation_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(tenant_id, dealership_id, component_type, calculation_date)
);

-- Predictive Financial Models
CREATE TABLE IF NOT EXISTS dtri_predictive_models (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    dealership_id UUID NOT NULL,
    model_type VARCHAR(100) NOT NULL, -- Decay_Tax_Cost, AROI_Score, Strategic_Window_Value
    model_name VARCHAR(255) NOT NULL,
    financial_link VARCHAR(255),
    core_formula TEXT,
    predicted_value DECIMAL(15,2),
    confidence_score DECIMAL(3,2),
    calculation_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(tenant_id, dealership_id, model_type, calculation_date)
);

-- Lag Measure Mapping
CREATE TABLE IF NOT EXISTS dtri_lag_measures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    lag_measure_id VARCHAR(50) NOT NULL,
    action_owner VARCHAR(100) NOT NULL,
    threshold_violation TEXT,
    primary_remedy TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(tenant_id, lag_measure_id)
);

-- Autonomous Triggers
CREATE TABLE IF NOT EXISTS dtri_autonomous_triggers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    trigger_name VARCHAR(255) NOT NULL,
    trigger_condition TEXT NOT NULL,
    trigger_action TEXT NOT NULL,
    crisis_alert_threshold DECIMAL(3,2) DEFAULT 0.85,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(tenant_id, trigger_name)
);

-- Generative Content Blueprints
CREATE TABLE IF NOT EXISTS dtri_content_blueprints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    content_type_id VARCHAR(50) NOT NULL,
    content_type_name VARCHAR(255) NOT NULL,
    source_data JSONB, -- Array of data sources
    actionable_output TEXT,
    generative_draft_output TEXT, -- AI-generated content draft
    compliance_text_blueprint TEXT, -- Compliance text for VDP
    llm_response_generation TEXT, -- Sentiment-optimized response
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(tenant_id, content_type_id)
);

-- ==============================================
-- BEHAVIORAL ECONOMICS ENHANCEMENTS
-- ==============================================

-- Loss Aversion and Endowment Effect Tracking
CREATE TABLE IF NOT EXISTS dtri_behavioral_economics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    dealership_id UUID NOT NULL,
    loss_aversion_multiplier DECIMAL(3,2) DEFAULT 1.25,
    clv_risk_weight DECIMAL(5,2) DEFAULT 0.0,
    estimated_lifetime_value_lost DECIMAL(12,2) DEFAULT 0.0,
    regional_competitor_decay_tax DECIMAL(12,2),
    competitive_vulnerability_delta DECIMAL(12,2),
    endowment_effect_score DECIMAL(3,2),
    calculation_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AROI with Loss Aversion Enhancement
CREATE TABLE IF NOT EXISTS dtri_aroi_enhanced (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    dealership_id UUID NOT NULL,
    predicted_profit_lift_dollars DECIMAL(15,2),
    tsm_current_value DECIMAL(3,2),
    loss_aversion_multiplier DECIMAL(3,2) DEFAULT 1.25,
    cost_of_effort_coe DECIMAL(10,2),
    adjusted_aroi_score DECIMAL(10,2) GENERATED ALWAYS AS (
        (predicted_profit_lift_dollars * tsm_current_value * loss_aversion_multiplier) / cost_of_effort_coe
    ) STORED,
    decay_tax_mitigation_weight DECIMAL(3,2) DEFAULT 0.7,
    aeo_growth_weight DECIMAL(3,2) DEFAULT 0.3,
    calculation_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- COMPETITIVE INTELLIGENCE SYSTEM
-- ==============================================

-- Competitive DTRI Tracking
CREATE TABLE IF NOT EXISTS dtri_competitive_intelligence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    dealership_id UUID NOT NULL,
    competitor_name VARCHAR(255) NOT NULL,
    competitor_dtri_score DECIMAL(5,2),
    dtri_delta DECIMAL(5,2),
    competitor_ranking INTEGER,
    data_source VARCHAR(100),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Time-to-Match Predictions
CREATE TABLE IF NOT EXISTS dtri_ttm_predictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    dealership_id UUID NOT NULL,
    metric_fixed VARCHAR(100) NOT NULL,
    fix_implementation_date TIMESTAMP WITH TIME ZONE NOT NULL,
    predicted_ttm_months DECIMAL(4,2),
    competitor_resources_score DECIMAL(3,2),
    historical_patch_speed DECIMAL(4,2),
    strategic_window_value DECIMAL(15,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- ENHANCED ACTIONABILITY AND FEEDBACK LOOPS
-- ==============================================

-- Action Confirmation Tracker
CREATE TABLE IF NOT EXISTS dtri_action_tracker (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    dealership_id UUID NOT NULL,
    action_id VARCHAR(100) NOT NULL,
    action_owner VARCHAR(100) NOT NULL,
    action_description TEXT NOT NULL,
    action_status VARCHAR(20) DEFAULT 'pending' CHECK (action_status IN ('pending', 'in_progress', 'confirmed', 'failed')),
    cost_of_effort_coe DECIMAL(10,2),
    predicted_aroi DECIMAL(10,2),
    actual_aroi DECIMAL(10,2),
    confirmation_date TIMESTAMP WITH TIME ZONE,
    follow_up_required BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Validated AROI Reporting
CREATE TABLE IF NOT EXISTS dtri_aroi_validation (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    dealership_id UUID NOT NULL,
    action_tracker_id UUID REFERENCES dtri_action_tracker(id),
    predicted_aroi DECIMAL(10,2),
    actual_aroi DECIMAL(10,2),
    variance_percentage DECIMAL(5,2) GENERATED ALWAYS AS (
        ((actual_aroi - predicted_aroi) / NULLIF(predicted_aroi, 0)) * 100
    ) STORED,
    validation_period_days INTEGER DEFAULT 90,
    validation_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sentiment-to-Fix Loop
CREATE TABLE IF NOT EXISTS dtri_sentiment_flags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    dealership_id UUID NOT NULL,
    sentiment_source VARCHAR(100) NOT NULL, -- 'google_reviews', 'facebook', 'dealer_rated'
    sentiment_volume INTEGER NOT NULL,
    sentiment_score DECIMAL(3,2),
    flagged_metric VARCHAR(100) NOT NULL,
    external_flag_condition TEXT,
    flag_severity VARCHAR(20) DEFAULT 'medium' CHECK (flag_severity IN ('low', 'medium', 'high', 'critical')),
    is_resolved BOOLEAN DEFAULT false,
    resolution_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced QAI Components with Actionable Insights
CREATE TABLE IF NOT EXISTS qai_enhanced_components (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    dealership_id UUID NOT NULL,
    component_id VARCHAR(50) NOT NULL,
    component_name VARCHAR(255) NOT NULL,
    weight DECIMAL(3,2) NOT NULL,
    score DECIMAL(5,2) NOT NULL CHECK (score >= 0 AND score <= 100),
    lag_measure_id VARCHAR(50),
    lag_measure_definition TEXT,
    lag_measure_data_source VARCHAR(100),
    financial_link VARCHAR(255),
    actionable_insight_owner VARCHAR(100),
    actionable_insight_remedy TEXT,
    generative_draft_output TEXT,
    compliance_text_blueprint TEXT,
    action_status VARCHAR(20) DEFAULT 'pending' CHECK (action_status IN ('pending', 'in_progress', 'confirmed', 'failed')),
    clv_risk_weight DECIMAL(5,2) DEFAULT 0.0,
    calculation_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(tenant_id, dealership_id, component_id, calculation_date)
);

-- Enhanced E-E-A-T Components with Actionable Insights
CREATE TABLE IF NOT EXISTS eeat_enhanced_components (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    dealership_id UUID NOT NULL,
    component_type VARCHAR(50) NOT NULL,
    component_name VARCHAR(255) NOT NULL,
    weight DECIMAL(3,2) NOT NULL,
    score DECIMAL(5,2) NOT NULL CHECK (score >= 0 AND score <= 100),
    input_metrics JSONB,
    lag_measure_id VARCHAR(50),
    lag_measure_definition TEXT,
    lag_measure_data_source VARCHAR(100),
    actionable_insight_owner VARCHAR(100),
    actionable_insight_remedy TEXT,
    llm_response_generation TEXT,
    action_status VARCHAR(20) DEFAULT 'pending' CHECK (action_status IN ('pending', 'in_progress', 'confirmed', 'failed')),
    calculation_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(tenant_id, dealership_id, component_type, calculation_date)
);

-- Audit log for configuration changes
CREATE TABLE IF NOT EXISTS qai_config_audit (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    config_type VARCHAR(50) NOT NULL,
    config_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL CHECK (action IN ('create', 'update', 'delete', 'activate', 'deactivate')),
    old_values JSONB,
    new_values JSONB,
    changed_by UUID,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reason TEXT
);

-- ==============================================
-- PERFORMANCE-OPTIMIZED INDEXES
-- ==============================================

-- QAI Configuration Indexes
CREATE INDEX IF NOT EXISTS idx_qai_dashboard_configs_tenant ON qai_dashboard_configs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_qai_dashboard_configs_type ON qai_dashboard_configs(config_type);
CREATE INDEX IF NOT EXISTS idx_qai_dashboard_configs_active ON qai_dashboard_configs(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_qai_dashboard_configs_tenant_type ON qai_dashboard_configs(tenant_id, config_type);

CREATE INDEX IF NOT EXISTS idx_qai_metrics_config_tenant ON qai_metrics_config(tenant_id);
CREATE INDEX IF NOT EXISTS idx_qai_metrics_config_type ON qai_metrics_config(metric_type);
CREATE INDEX IF NOT EXISTS idx_qai_metrics_config_enabled ON qai_metrics_config(is_enabled) WHERE is_enabled = true;
CREATE INDEX IF NOT EXISTS idx_qai_metrics_config_tenant_type ON qai_metrics_config(tenant_id, metric_type);

CREATE INDEX IF NOT EXISTS idx_qai_alerts_config_tenant ON qai_alerts_config(tenant_id);
CREATE INDEX IF NOT EXISTS idx_qai_alerts_config_metric ON qai_alerts_config(metric_name);
CREATE INDEX IF NOT EXISTS idx_qai_alerts_config_enabled ON qai_alerts_config(is_enabled) WHERE is_enabled = true;
CREATE INDEX IF NOT EXISTS idx_qai_alerts_config_severity ON qai_alerts_config(severity);
CREATE INDEX IF NOT EXISTS idx_qai_alerts_config_tenant_enabled ON qai_alerts_config(tenant_id, is_enabled);

CREATE INDEX IF NOT EXISTS idx_qai_actions_config_tenant ON qai_actions_config(tenant_id);
CREATE INDEX IF NOT EXISTS idx_qai_actions_config_type ON qai_actions_config(action_type);
CREATE INDEX IF NOT EXISTS idx_qai_actions_config_enabled ON qai_actions_config(is_enabled) WHERE is_enabled = true;
CREATE INDEX IF NOT EXISTS idx_qai_actions_config_tenant_type ON qai_actions_config(tenant_id, action_type);

CREATE INDEX IF NOT EXISTS idx_qai_dashboard_layouts_tenant ON qai_dashboard_layouts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_qai_dashboard_layouts_default ON qai_dashboard_layouts(is_default) WHERE is_default = true;
CREATE INDEX IF NOT EXISTS idx_qai_dashboard_layouts_tenant_default ON qai_dashboard_layouts(tenant_id, is_default);

-- DTRI Financial Modeling Indexes
CREATE INDEX IF NOT EXISTS idx_dtri_engine_specs_tenant ON dtri_engine_specs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_dtri_engine_specs_active ON dtri_engine_specs(is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_dtri_financial_baseline_tenant ON dtri_financial_baseline(tenant_id);
CREATE INDEX IF NOT EXISTS idx_dtri_financial_baseline_dealership ON dtri_financial_baseline(dealership_id);
CREATE INDEX IF NOT EXISTS idx_dtri_financial_baseline_tenant_dealership ON dtri_financial_baseline(tenant_id, dealership_id);

CREATE INDEX IF NOT EXISTS idx_dtri_composite_scores_tenant ON dtri_composite_scores(tenant_id);
CREATE INDEX IF NOT EXISTS idx_dtri_composite_scores_dealership ON dtri_composite_scores(dealership_id);
CREATE INDEX IF NOT EXISTS idx_dtri_composite_scores_date ON dtri_composite_scores(calculation_date);
CREATE INDEX IF NOT EXISTS idx_dtri_composite_scores_tenant_dealership_date ON dtri_composite_scores(tenant_id, dealership_id, calculation_date);

CREATE INDEX IF NOT EXISTS idx_qai_internal_components_tenant ON qai_internal_components(tenant_id);
CREATE INDEX IF NOT EXISTS idx_qai_internal_components_dealership ON qai_internal_components(dealership_id);
CREATE INDEX IF NOT EXISTS idx_qai_internal_components_component ON qai_internal_components(component_id);
CREATE INDEX IF NOT EXISTS idx_qai_internal_components_date ON qai_internal_components(calculation_date);

CREATE INDEX IF NOT EXISTS idx_eeat_external_components_tenant ON eeat_external_components(tenant_id);
CREATE INDEX IF NOT EXISTS idx_eeat_external_components_dealership ON eeat_external_components(dealership_id);
CREATE INDEX IF NOT EXISTS idx_eeat_external_components_type ON eeat_external_components(component_type);
CREATE INDEX IF NOT EXISTS idx_eeat_external_components_date ON eeat_external_components(calculation_date);

CREATE INDEX IF NOT EXISTS idx_dtri_predictive_models_tenant ON dtri_predictive_models(tenant_id);
CREATE INDEX IF NOT EXISTS idx_dtri_predictive_models_dealership ON dtri_predictive_models(dealership_id);
CREATE INDEX IF NOT EXISTS idx_dtri_predictive_models_type ON dtri_predictive_models(model_type);
CREATE INDEX IF NOT EXISTS idx_dtri_predictive_models_date ON dtri_predictive_models(calculation_date);

CREATE INDEX IF NOT EXISTS idx_dtri_lag_measures_tenant ON dtri_lag_measures(tenant_id);
CREATE INDEX IF NOT EXISTS idx_dtri_lag_measures_active ON dtri_lag_measures(is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_dtri_autonomous_triggers_tenant ON dtri_autonomous_triggers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_dtri_autonomous_triggers_active ON dtri_autonomous_triggers(is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_dtri_content_blueprints_tenant ON dtri_content_blueprints(tenant_id);
CREATE INDEX IF NOT EXISTS idx_dtri_content_blueprints_active ON dtri_content_blueprints(is_active) WHERE is_active = true;

-- Behavioral Economics Indexes
CREATE INDEX IF NOT EXISTS idx_dtri_behavioral_economics_tenant ON dtri_behavioral_economics(tenant_id);
CREATE INDEX IF NOT EXISTS idx_dtri_behavioral_economics_dealership ON dtri_behavioral_economics(dealership_id);
CREATE INDEX IF NOT EXISTS idx_dtri_behavioral_economics_date ON dtri_behavioral_economics(calculation_date);

CREATE INDEX IF NOT EXISTS idx_dtri_aroi_enhanced_tenant ON dtri_aroi_enhanced(tenant_id);
CREATE INDEX IF NOT EXISTS idx_dtri_aroi_enhanced_dealership ON dtri_aroi_enhanced(dealership_id);
CREATE INDEX IF NOT EXISTS idx_dtri_aroi_enhanced_date ON dtri_aroi_enhanced(calculation_date);

-- Competitive Intelligence Indexes
CREATE INDEX IF NOT EXISTS idx_dtri_competitive_intelligence_tenant ON dtri_competitive_intelligence(tenant_id);
CREATE INDEX IF NOT EXISTS idx_dtri_competitive_intelligence_dealership ON dtri_competitive_intelligence(dealership_id);
CREATE INDEX IF NOT EXISTS idx_dtri_competitive_intelligence_competitor ON dtri_competitive_intelligence(competitor_name);
CREATE INDEX IF NOT EXISTS idx_dtri_competitive_intelligence_ranking ON dtri_competitive_intelligence(competitor_ranking);

CREATE INDEX IF NOT EXISTS idx_dtri_ttm_predictions_tenant ON dtri_ttm_predictions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_dtri_ttm_predictions_dealership ON dtri_ttm_predictions(dealership_id);
CREATE INDEX IF NOT EXISTS idx_dtri_ttm_predictions_metric ON dtri_ttm_predictions(metric_fixed);

-- Actionability and Feedback Loop Indexes
CREATE INDEX IF NOT EXISTS idx_dtri_action_tracker_tenant ON dtri_action_tracker(tenant_id);
CREATE INDEX IF NOT EXISTS idx_dtri_action_tracker_dealership ON dtri_action_tracker(dealership_id);
CREATE INDEX IF NOT EXISTS idx_dtri_action_tracker_status ON dtri_action_tracker(action_status);
CREATE INDEX IF NOT EXISTS idx_dtri_action_tracker_owner ON dtri_action_tracker(action_owner);
CREATE INDEX IF NOT EXISTS idx_dtri_action_tracker_follow_up ON dtri_action_tracker(follow_up_required) WHERE follow_up_required = true;

CREATE INDEX IF NOT EXISTS idx_dtri_aroi_validation_tenant ON dtri_aroi_validation(tenant_id);
CREATE INDEX IF NOT EXISTS idx_dtri_aroi_validation_dealership ON dtri_aroi_validation(dealership_id);
CREATE INDEX IF NOT EXISTS idx_dtri_aroi_validation_tracker ON dtri_aroi_validation(action_tracker_id);

CREATE INDEX IF NOT EXISTS idx_dtri_sentiment_flags_tenant ON dtri_sentiment_flags(tenant_id);
CREATE INDEX IF NOT EXISTS idx_dtri_sentiment_flags_dealership ON dtri_sentiment_flags(dealership_id);
CREATE INDEX IF NOT EXISTS idx_dtri_sentiment_flags_metric ON dtri_sentiment_flags(flagged_metric);
CREATE INDEX IF NOT EXISTS idx_dtri_sentiment_flags_severity ON dtri_sentiment_flags(flag_severity);
CREATE INDEX IF NOT EXISTS idx_dtri_sentiment_flags_resolved ON dtri_sentiment_flags(is_resolved) WHERE is_resolved = false;

-- Enhanced Components Indexes
CREATE INDEX IF NOT EXISTS idx_qai_enhanced_components_tenant ON qai_enhanced_components(tenant_id);
CREATE INDEX IF NOT EXISTS idx_qai_enhanced_components_dealership ON qai_enhanced_components(dealership_id);
CREATE INDEX IF NOT EXISTS idx_qai_enhanced_components_component ON qai_enhanced_components(component_id);
CREATE INDEX IF NOT EXISTS idx_qai_enhanced_components_status ON qai_enhanced_components(action_status);
CREATE INDEX IF NOT EXISTS idx_qai_enhanced_components_owner ON qai_enhanced_components(actionable_insight_owner);

CREATE INDEX IF NOT EXISTS idx_eeat_enhanced_components_tenant ON eeat_enhanced_components(tenant_id);
CREATE INDEX IF NOT EXISTS idx_eeat_enhanced_components_dealership ON eeat_enhanced_components(dealership_id);
CREATE INDEX IF NOT EXISTS idx_eeat_enhanced_components_type ON eeat_enhanced_components(component_type);
CREATE INDEX IF NOT EXISTS idx_eeat_enhanced_components_status ON eeat_enhanced_components(action_status);
CREATE INDEX IF NOT EXISTS idx_eeat_enhanced_components_owner ON eeat_enhanced_components(actionable_insight_owner);

CREATE INDEX IF NOT EXISTS idx_qai_config_audit_tenant ON qai_config_audit(tenant_id);
CREATE INDEX IF NOT EXISTS idx_qai_config_audit_type ON qai_config_audit(config_type);
CREATE INDEX IF NOT EXISTS idx_qai_config_audit_changed_at ON qai_config_audit(changed_at);
CREATE INDEX IF NOT EXISTS idx_qai_config_audit_tenant_changed_at ON qai_config_audit(tenant_id, changed_at);

-- JSONB indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_qai_dashboard_configs_data_gin ON qai_dashboard_configs USING GIN (config_data);
CREATE INDEX IF NOT EXISTS idx_qai_metrics_config_formula_gin ON qai_metrics_config USING GIN (calculation_formula);
CREATE INDEX IF NOT EXISTS idx_qai_metrics_config_thresholds_gin ON qai_metrics_config USING GIN (thresholds);
CREATE INDEX IF NOT EXISTS idx_qai_alerts_config_condition_gin ON qai_alerts_config USING GIN (condition_config);
CREATE INDEX IF NOT EXISTS idx_qai_actions_config_trigger_gin ON qai_actions_config USING GIN (trigger_conditions);
CREATE INDEX IF NOT EXISTS idx_qai_actions_config_action_gin ON qai_actions_config USING GIN (action_config);
CREATE INDEX IF NOT EXISTS idx_dtri_financial_baseline_seasonality_gin ON dtri_financial_baseline USING GIN (seasonality_adjustment);
CREATE INDEX IF NOT EXISTS idx_eeat_external_components_metrics_gin ON eeat_external_components USING GIN (input_metrics);
CREATE INDEX IF NOT EXISTS idx_dtri_content_blueprints_source_gin ON dtri_content_blueprints USING GIN (source_data);

-- ==============================================
-- ROW LEVEL SECURITY (RLS)
-- ==============================================

-- Enable RLS on all tables
ALTER TABLE qai_dashboard_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE qai_metrics_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE qai_alerts_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE qai_actions_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE qai_dashboard_layouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE dtri_engine_specs ENABLE ROW LEVEL SECURITY;
ALTER TABLE dtri_financial_baseline ENABLE ROW LEVEL SECURITY;
ALTER TABLE dtri_composite_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE qai_internal_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE eeat_external_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE dtri_predictive_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE dtri_lag_measures ENABLE ROW LEVEL SECURITY;
ALTER TABLE dtri_autonomous_triggers ENABLE ROW LEVEL SECURITY;
ALTER TABLE dtri_content_blueprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE dtri_behavioral_economics ENABLE ROW LEVEL SECURITY;
ALTER TABLE dtri_aroi_enhanced ENABLE ROW LEVEL SECURITY;
ALTER TABLE dtri_competitive_intelligence ENABLE ROW LEVEL SECURITY;
ALTER TABLE dtri_ttm_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE dtri_action_tracker ENABLE ROW LEVEL SECURITY;
ALTER TABLE dtri_aroi_validation ENABLE ROW LEVEL SECURITY;
ALTER TABLE dtri_sentiment_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE qai_enhanced_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE eeat_enhanced_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE qai_config_audit ENABLE ROW LEVEL SECURITY;

-- RLS policies for QAI tables
DO $$ BEGIN
    CREATE POLICY "Users can view their own configs" ON qai_dashboard_configs
    FOR SELECT USING (tenant_id = current_setting('app.current_tenant_id')::uuid);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Users can modify their own configs" ON qai_dashboard_configs
    FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

DO $$ BEGIN
    CREATE POLICY "Users can view their own metrics" ON qai_metrics_config
    FOR SELECT USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

DO $$ BEGIN
    CREATE POLICY "Users can modify their own metrics" ON qai_metrics_config
    FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

DO $$ BEGIN
    CREATE POLICY "Users can view their own alerts" ON qai_alerts_config
    FOR SELECT USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

DO $$ BEGIN
    CREATE POLICY "Users can modify their own alerts" ON qai_alerts_config
    FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

DO $$ BEGIN
    CREATE POLICY "Users can view their own actions" ON qai_actions_config
    FOR SELECT USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

DO $$ BEGIN
    CREATE POLICY "Users can modify their own actions" ON qai_actions_config
    FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

DO $$ BEGIN
    CREATE POLICY "Users can view their own layouts" ON qai_dashboard_layouts
    FOR SELECT USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

DO $$ BEGIN
    CREATE POLICY "Users can modify their own layouts" ON qai_dashboard_layouts
    FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- RLS policies for DTRI tables
DO $$ BEGIN
    CREATE POLICY "Users can view their own dtri specs" ON dtri_engine_specs
    FOR SELECT USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

DO $$ BEGIN
    CREATE POLICY "Users can modify their own dtri specs" ON dtri_engine_specs
    FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

DO $$ BEGIN
    CREATE POLICY "Users can view their own financial baseline" ON dtri_financial_baseline
    FOR SELECT USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

DO $$ BEGIN
    CREATE POLICY "Users can modify their own financial baseline" ON dtri_financial_baseline
    FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

DO $$ BEGIN
    CREATE POLICY "Users can view their own composite scores" ON dtri_composite_scores
    FOR SELECT USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

DO $$ BEGIN
    CREATE POLICY "Users can modify their own composite scores" ON dtri_composite_scores
    FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

DO $$ BEGIN
    CREATE POLICY "Users can view their own qai components" ON qai_internal_components
    FOR SELECT USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

DO $$ BEGIN
    CREATE POLICY "Users can modify their own qai components" ON qai_internal_components
    FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

DO $$ BEGIN
    CREATE POLICY "Users can view their own eeat components" ON eeat_external_components
    FOR SELECT USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

DO $$ BEGIN
    CREATE POLICY "Users can modify their own eeat components" ON eeat_external_components
    FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

DO $$ BEGIN
    CREATE POLICY "Users can view their own predictive models" ON dtri_predictive_models
    FOR SELECT USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

DO $$ BEGIN
    CREATE POLICY "Users can modify their own predictive models" ON dtri_predictive_models
    FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

DO $$ BEGIN
    CREATE POLICY "Users can view their own lag measures" ON dtri_lag_measures
    FOR SELECT USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

DO $$ BEGIN
    CREATE POLICY "Users can modify their own lag measures" ON dtri_lag_measures
    FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

DO $$ BEGIN
    CREATE POLICY "Users can view their own autonomous triggers" ON dtri_autonomous_triggers
    FOR SELECT USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

DO $$ BEGIN
    CREATE POLICY "Users can modify their own autonomous triggers" ON dtri_autonomous_triggers
    FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

DO $$ BEGIN
    CREATE POLICY "Users can view their own content blueprints" ON dtri_content_blueprints
    FOR SELECT USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

DO $$ BEGIN
    CREATE POLICY "Users can modify their own content blueprints" ON dtri_content_blueprints
    FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

DO $$ BEGIN
    CREATE POLICY "Users can view their own audit logs" ON qai_config_audit
    FOR SELECT USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- RLS policies for Behavioral Economics tables
DO $$ BEGIN
    CREATE POLICY "Users can view their own behavioral economics" ON dtri_behavioral_economics
    FOR SELECT USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

DO $$ BEGIN
    CREATE POLICY "Users can modify their own behavioral economics" ON dtri_behavioral_economics
    FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

DO $$ BEGIN
    CREATE POLICY "Users can view their own aroi enhanced" ON dtri_aroi_enhanced
    FOR SELECT USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

DO $$ BEGIN
    CREATE POLICY "Users can modify their own aroi enhanced" ON dtri_aroi_enhanced
    FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- RLS policies for Competitive Intelligence tables
DO $$ BEGIN
    CREATE POLICY "Users can view their own competitive intelligence" ON dtri_competitive_intelligence
    FOR SELECT USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

DO $$ BEGIN
    CREATE POLICY "Users can modify their own competitive intelligence" ON dtri_competitive_intelligence
    FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

DO $$ BEGIN
    CREATE POLICY "Users can view their own ttm predictions" ON dtri_ttm_predictions
    FOR SELECT USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

DO $$ BEGIN
    CREATE POLICY "Users can modify their own ttm predictions" ON dtri_ttm_predictions
    FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- RLS policies for Actionability and Feedback Loop tables
DO $$ BEGIN
    CREATE POLICY "Users can view their own action tracker" ON dtri_action_tracker
    FOR SELECT USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

DO $$ BEGIN
    CREATE POLICY "Users can modify their own action tracker" ON dtri_action_tracker
    FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

DO $$ BEGIN
    CREATE POLICY "Users can view their own aroi validation" ON dtri_aroi_validation
    FOR SELECT USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

DO $$ BEGIN
    CREATE POLICY "Users can modify their own aroi validation" ON dtri_aroi_validation
    FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

DO $$ BEGIN
    CREATE POLICY "Users can view their own sentiment flags" ON dtri_sentiment_flags
    FOR SELECT USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

DO $$ BEGIN
    CREATE POLICY "Users can modify their own sentiment flags" ON dtri_sentiment_flags
    FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- RLS policies for Enhanced Components tables
DO $$ BEGIN
    CREATE POLICY "Users can view their own qai enhanced components" ON qai_enhanced_components
    FOR SELECT USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

DO $$ BEGIN
    CREATE POLICY "Users can modify their own qai enhanced components" ON qai_enhanced_components
    FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

DO $$ BEGIN
    CREATE POLICY "Users can view their own eeat enhanced components" ON eeat_enhanced_components
    FOR SELECT USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

DO $$ BEGIN
    CREATE POLICY "Users can modify their own eeat enhanced components" ON eeat_enhanced_components
    FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- ==============================================
-- TRIGGERS AND FUNCTIONS
-- ==============================================

-- Add triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to all tables
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

CREATE TRIGGER IF NOT EXISTS update_dtri_engine_specs_updated_at 
    BEFORE UPDATE ON dtri_engine_specs 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_dtri_financial_baseline_updated_at 
    BEFORE UPDATE ON dtri_financial_baseline 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_dtri_lag_measures_updated_at 
    BEFORE UPDATE ON dtri_lag_measures 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_dtri_autonomous_triggers_updated_at 
    BEFORE UPDATE ON dtri_autonomous_triggers 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_dtri_content_blueprints_updated_at 
    BEFORE UPDATE ON dtri_content_blueprints 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_dtri_action_tracker_updated_at 
    BEFORE UPDATE ON dtri_action_tracker 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_dtri_sentiment_flags_updated_at 
    BEFORE UPDATE ON dtri_sentiment_flags 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add function to automatically create audit log entries
CREATE OR REPLACE FUNCTION qai_config_audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        INSERT INTO qai_config_audit (tenant_id, config_type, config_id, action, old_values, changed_at)
        VALUES (OLD.tenant_id, TG_TABLE_NAME, OLD.id, 'delete', to_jsonb(OLD), NOW());
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO qai_config_audit (tenant_id, config_type, config_id, action, old_values, new_values, changed_at)
        VALUES (NEW.tenant_id, TG_TABLE_NAME, NEW.id, 'update', to_jsonb(OLD), to_jsonb(NEW), NOW());
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO qai_config_audit (tenant_id, config_type, config_id, action, new_values, changed_at)
        VALUES (NEW.tenant_id, TG_TABLE_NAME, NEW.id, 'create', to_jsonb(NEW), NOW());
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Add audit triggers to all configuration tables
CREATE TRIGGER IF NOT EXISTS qai_dashboard_configs_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON qai_dashboard_configs
    FOR EACH ROW EXECUTE FUNCTION qai_config_audit_trigger();

CREATE TRIGGER IF NOT EXISTS qai_metrics_config_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON qai_metrics_config
    FOR EACH ROW EXECUTE FUNCTION qai_config_audit_trigger();

CREATE TRIGGER IF NOT EXISTS qai_alerts_config_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON qai_alerts_config
    FOR EACH ROW EXECUTE FUNCTION qai_config_audit_trigger();

CREATE TRIGGER IF NOT EXISTS qai_actions_config_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON qai_actions_config
    FOR EACH ROW EXECUTE FUNCTION qai_config_audit_trigger();

CREATE TRIGGER IF NOT EXISTS qai_dashboard_layouts_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON qai_dashboard_layouts
    FOR EACH ROW EXECUTE FUNCTION qai_config_audit_trigger();

-- ==============================================
-- COMMENTS AND DOCUMENTATION
-- ==============================================

-- Table comments
COMMENT ON TABLE qai_dashboard_configs IS 'Dashboard configuration settings for QAI metrics, alerts, and actions';
COMMENT ON TABLE qai_metrics_config IS 'Configuration for individual metrics including thresholds and visualization settings';
COMMENT ON TABLE qai_alerts_config IS 'Alert configuration with conditions and notification channels';
COMMENT ON TABLE qai_actions_config IS 'Automated action configurations triggered by metric conditions';
COMMENT ON TABLE qai_dashboard_layouts IS 'Dashboard layout configurations for different user preferences';
COMMENT ON TABLE dtri_engine_specs IS 'DTRI engine specifications and versioning information';
COMMENT ON TABLE dtri_financial_baseline IS 'Financial baseline data for DTRI calculations including CAC, closing rates, and seasonality';
COMMENT ON TABLE dtri_composite_scores IS 'DTRI composite scores combining QAI and E-E-A-T scores';
COMMENT ON TABLE qai_internal_components IS 'QAI internal execution components (FTFR, VDPD, PROC, CERT)';
COMMENT ON TABLE eeat_external_components IS 'E-E-A-T external perception components (Trustworthiness, Experience, Expertise, Authoritativeness)';
COMMENT ON TABLE dtri_predictive_models IS 'DTRI predictive financial models including decay tax cost, AROI score, and strategic window value';
COMMENT ON TABLE dtri_lag_measures IS 'Lag measure mapping for autonomous triggers and remedies';
COMMENT ON TABLE dtri_autonomous_triggers IS 'Autonomous trigger conditions and actions for DTRI system';
COMMENT ON TABLE dtri_content_blueprints IS 'Generative content blueprints for automated content creation with AI-generated drafts and compliance text';
COMMENT ON TABLE dtri_behavioral_economics IS 'Behavioral economics tracking with loss aversion multipliers and endowment effect scoring';
COMMENT ON TABLE dtri_aroi_enhanced IS 'Enhanced AROI calculations with loss aversion weighting and decay tax prioritization';
COMMENT ON TABLE dtri_competitive_intelligence IS 'Real-time competitive DTRI tracking and delta calculations';
COMMENT ON TABLE dtri_ttm_predictions IS 'Time-to-Match predictions for strategic window value calculations';
COMMENT ON TABLE dtri_action_tracker IS 'Action confirmation tracking with follow-up management and AROI validation';
COMMENT ON TABLE dtri_aroi_validation IS 'Validated AROI reporting with actual vs predicted variance tracking';
COMMENT ON TABLE dtri_sentiment_flags IS 'Sentiment-to-fix loop integration with external flag conditions';
COMMENT ON TABLE qai_enhanced_components IS 'Enhanced QAI components with actionable insights and generative content automation';
COMMENT ON TABLE eeat_enhanced_components IS 'Enhanced E-E-A-T components with LLM response generation and action tracking';
COMMENT ON TABLE qai_config_audit IS 'Audit log for all configuration changes with full change tracking';

-- Column comments for key fields
COMMENT ON COLUMN dtri_composite_scores.dtri_score IS 'Generated column: (qai_score * 0.50) + (eeat_score * 0.50)';
COMMENT ON COLUMN dtri_financial_baseline.seasonality_adjustment IS 'JSONB seasonality adjustments by quarter';
COMMENT ON COLUMN qai_internal_components.lag_measure_id IS 'Reference to lag measure for autonomous triggering';
COMMENT ON COLUMN eeat_external_components.input_metrics IS 'JSONB array of input metrics for E-E-A-T calculation';
COMMENT ON COLUMN dtri_predictive_models.core_formula IS 'Core mathematical formula for the predictive model';
COMMENT ON COLUMN dtri_content_blueprints.source_data IS 'JSONB array of data sources for content generation';
COMMENT ON COLUMN dtri_behavioral_economics.loss_aversion_multiplier IS 'Loss Aversion Multiplier (LAM) for prioritizing decay tax mitigation over growth';
COMMENT ON COLUMN dtri_behavioral_economics.clv_risk_weight IS 'Customer Lifetime Value risk weight for endowment effect calculations';
COMMENT ON COLUMN dtri_aroi_enhanced.adjusted_aroi_score IS 'Generated column: (predicted_profit_lift * tsm * loss_aversion_multiplier) / cost_of_effort';
COMMENT ON COLUMN dtri_competitive_intelligence.dtri_delta IS 'Generated column: Current DTRI score minus competitor DTRI score';
COMMENT ON COLUMN dtri_ttm_predictions.strategic_window_value IS 'Generated column: Lead gain * TTM months * avg GP * TSM';
COMMENT ON COLUMN dtri_aroi_validation.variance_percentage IS 'Generated column: ((actual_aroi - predicted_aroi) / predicted_aroi) * 100';
COMMENT ON COLUMN qai_enhanced_components.generative_draft_output IS 'AI-generated content draft for expertise content creation';
COMMENT ON COLUMN qai_enhanced_components.compliance_text_blueprint IS 'Compliance text blueprint for VDP transparency fixes';
COMMENT ON COLUMN eeat_enhanced_components.llm_response_generation IS 'Sentiment-optimized response generation for review crisis management';