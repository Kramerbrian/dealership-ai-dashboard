-- Model Audit Schema for HyperAIV™ System
-- Tracks model performance, retraining cycles, and governance metrics

-- Model Audit Table
CREATE TABLE IF NOT EXISTS model_audit (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    run_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    dealer_id TEXT NOT NULL,
    model_version TEXT NOT NULL DEFAULT '1.0',
    status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'warning')),
    
    -- Performance Metrics
    r2 DECIMAL(5,4), -- R-squared correlation
    rmse DECIMAL(8,4), -- Root Mean Square Error
    mape DECIMAL(5,2), -- Mean Absolute Percentage Error
    accuracy_gain_percent DECIMAL(5,2), -- Month-over-month accuracy improvement
    roi_gain_percent DECIMAL(5,2), -- ROI improvement
    ad_efficiency_gain_percent DECIMAL(5,2), -- Ad spend efficiency gain
    
    -- Model Weights (JSON)
    weights_before JSONB,
    weights_after JSONB,
    weight_changes JSONB,
    
    -- Governance Metrics
    elasticity_per_point DECIMAL(10,2), -- Revenue per AIV point
    correlation_aiv_geo DECIMAL(5,4), -- AIV-GEO correlation
    mean_latency_days DECIMAL(5,2), -- Data freshness
    confidence_interval JSONB, -- Prediction confidence bounds
    
    -- Training Data Quality
    dataset_completeness DECIMAL(5,2), -- % complete datasets
    validation_sources_agreement INTEGER, -- Number of sources in agreement
    data_quality_score DECIMAL(5,2), -- Overall data quality (0-100)
    
    -- Error Tracking
    error_message TEXT,
    error_code TEXT,
    retry_count INTEGER DEFAULT 0,
    
    -- Metadata
    training_duration_seconds INTEGER,
    records_processed INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Model Weights Table (Current State)
CREATE TABLE IF NOT EXISTS model_weights (
    id TEXT PRIMARY KEY DEFAULT 'hyperaiv_optimizer',
    dealer_id TEXT,
    model_type TEXT DEFAULT 'hyperaiv',
    
    -- Three-Pillar Weights
    seo_visibility DECIMAL(5,4) DEFAULT 0.30,
    aeo_visibility DECIMAL(5,4) DEFAULT 0.35,
    geo_visibility DECIMAL(5,4) DEFAULT 0.35,
    
    -- E-E-A-T Weights
    experience DECIMAL(5,4) DEFAULT 0.25,
    expertise DECIMAL(5,4) DEFAULT 0.25,
    authoritativeness DECIMAL(5,4) DEFAULT 0.25,
    trustworthiness DECIMAL(5,4) DEFAULT 0.25,
    
    -- Metadata
    version TEXT DEFAULT '1.0',
    last_trained TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    performance_metrics JSONB,
    governance_status TEXT DEFAULT 'active' CHECK (governance_status IN ('active', 'frozen', 'review')),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Governance Rules Table
CREATE TABLE IF NOT EXISTS governance_rules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    rule_name TEXT NOT NULL,
    rule_type TEXT NOT NULL CHECK (rule_type IN ('threshold', 'trend', 'anomaly')),
    
    -- Threshold Rules
    metric_name TEXT,
    operator TEXT CHECK (operator IN ('<', '>', '<=', '>=', '=', '!=')),
    threshold_value DECIMAL(10,4),
    
    -- Trend Rules
    lookback_period_days INTEGER,
    trend_direction TEXT CHECK (trend_direction IN ('increasing', 'decreasing', 'stable')),
    min_change_percent DECIMAL(5,2),
    
    -- Actions
    action_type TEXT NOT NULL CHECK (action_type IN ('freeze_model', 'alert', 'auto_retrain', 'manual_review')),
    action_message TEXT,
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert Default Governance Rules
INSERT INTO governance_rules (rule_name, rule_type, metric_name, operator, threshold_value, action_type, action_message) VALUES
('R2 Minimum Threshold', 'threshold', 'r2', '<', 0.70, 'freeze_model', 'Model accuracy below acceptable threshold'),
('RMSE Maximum Threshold', 'threshold', 'rmse', '>', 3.50, 'freeze_model', 'Model error above acceptable threshold'),
('Accuracy Degradation', 'trend', 'accuracy_gain_percent', '<', -10.00, 'alert', 'Model accuracy declining significantly'),
('High Error Rate', 'threshold', 'mape', '>', 15.00, 'manual_review', 'Mean absolute percentage error too high')
ON CONFLICT DO NOTHING;

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_model_audit_run_date ON model_audit(run_date DESC);
CREATE INDEX IF NOT EXISTS idx_model_audit_dealer_id ON model_audit(dealer_id);
CREATE INDEX IF NOT EXISTS idx_model_audit_status ON model_audit(status);
CREATE INDEX IF NOT EXISTS idx_model_audit_r2 ON model_audit(r2);
CREATE INDEX IF NOT EXISTS idx_model_audit_rmse ON model_audit(rmse);

-- Row Level Security (RLS)
ALTER TABLE model_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_weights ENABLE ROW LEVEL SECURITY;
ALTER TABLE governance_rules ENABLE ROW LEVEL SECURITY;

-- RLS Policies (adjust based on your auth system)
CREATE POLICY "Allow read access to model_audit" ON model_audit FOR SELECT USING (true);
CREATE POLICY "Allow insert access to model_audit" ON model_audit FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update access to model_audit" ON model_audit FOR UPDATE USING (true);

CREATE POLICY "Allow read access to model_weights" ON model_weights FOR SELECT USING (true);
CREATE POLICY "Allow update access to model_weights" ON model_weights FOR UPDATE USING (true);

CREATE POLICY "Allow read access to governance_rules" ON governance_rules FOR SELECT USING (true);
CREATE POLICY "Allow update access to governance_rules" ON governance_rules FOR UPDATE USING (true);

-- Functions for Model Health Monitoring
CREATE OR REPLACE FUNCTION get_model_health_summary(dealer_id_param TEXT DEFAULT NULL)
RETURNS TABLE (
    dealer_id TEXT,
    latest_r2 DECIMAL(5,4),
    latest_rmse DECIMAL(8,4),
    accuracy_trend DECIMAL(5,2),
    roi_trend DECIMAL(5,2),
    governance_status TEXT,
    last_training_date TIMESTAMP WITH TIME ZONE,
    days_since_training INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ma.dealer_id,
        ma.r2 as latest_r2,
        ma.rmse as latest_rmse,
        ma.accuracy_gain_percent as accuracy_trend,
        ma.roi_gain_percent as roi_trend,
        mw.governance_status,
        ma.run_date as last_training_date,
        EXTRACT(DAYS FROM NOW() - ma.run_date)::INTEGER as days_since_training
    FROM model_audit ma
    LEFT JOIN model_weights mw ON ma.dealer_id = mw.dealer_id
    WHERE (dealer_id_param IS NULL OR ma.dealer_id = dealer_id_param)
    ORDER BY ma.run_date DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Function to Check Governance Violations
CREATE OR REPLACE FUNCTION check_governance_violations(dealer_id_param TEXT DEFAULT NULL)
RETURNS TABLE (
    rule_name TEXT,
    violation_type TEXT,
    current_value DECIMAL(10,4),
    threshold_value DECIMAL(10,4),
    action_required TEXT,
    severity TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        gr.rule_name,
        gr.rule_type as violation_type,
        CASE 
            WHEN gr.metric_name = 'r2' THEN ma.r2
            WHEN gr.metric_name = 'rmse' THEN ma.rmse
            WHEN gr.metric_name = 'mape' THEN ma.mape
            WHEN gr.metric_name = 'accuracy_gain_percent' THEN ma.accuracy_gain_percent
        END as current_value,
        gr.threshold_value,
        gr.action_type as action_required,
        CASE 
            WHEN gr.action_type = 'freeze_model' THEN 'critical'
            WHEN gr.action_type = 'manual_review' THEN 'high'
            ELSE 'medium'
        END as severity
    FROM governance_rules gr
    CROSS JOIN (
        SELECT * FROM model_audit 
        WHERE (dealer_id_param IS NULL OR dealer_id = dealer_id_param)
        ORDER BY run_date DESC LIMIT 1
    ) ma
    WHERE gr.is_active = true
    AND (
        (gr.operator = '<' AND CASE 
            WHEN gr.metric_name = 'r2' THEN ma.r2 < gr.threshold_value
            WHEN gr.metric_name = 'rmse' THEN ma.rmse < gr.threshold_value
            WHEN gr.metric_name = 'mape' THEN ma.mape < gr.threshold_value
            WHEN gr.metric_name = 'accuracy_gain_percent' THEN ma.accuracy_gain_percent < gr.threshold_value
        END)
        OR
        (gr.operator = '>' AND CASE 
            WHEN gr.metric_name = 'r2' THEN ma.r2 > gr.threshold_value
            WHEN gr.metric_name = 'rmse' THEN ma.rmse > gr.threshold_value
            WHEN gr.metric_name = 'mape' THEN ma.mape > gr.threshold_value
            WHEN gr.metric_name = 'accuracy_gain_percent' THEN ma.accuracy_gain_percent > gr.threshold_value
        END)
    );
END;
$$ LANGUAGE plpgsql;
