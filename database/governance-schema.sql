-- Governance Engine Database Schema
-- Implements automated model governance and stability monitoring

-- Governance Rules Table
CREATE TABLE IF NOT EXISTS public.governance_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rule_name TEXT NOT NULL,
    rule_type TEXT NOT NULL CHECK (rule_type IN ('threshold', 'trend', 'anomaly')),
    metric_name TEXT NOT NULL,
    operator TEXT NOT NULL CHECK (operator IN ('<', '>', '<=', '>=', '=', '!=')),
    threshold_value NUMERIC NOT NULL,
    action_type TEXT NOT NULL CHECK (action_type IN ('freeze_model', 'alert', 'auto_retrain', 'manual_review')),
    action_message TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Model Weights Table (with governance status)
CREATE TABLE IF NOT EXISTS public.model_weights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dealer_id TEXT NOT NULL,
    model_version TEXT NOT NULL,
    weights JSONB NOT NULL,
    governance_status TEXT DEFAULT 'active' CHECK (governance_status IN ('active', 'frozen', 'review')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(dealer_id, model_version)
);

-- Governance Actions Log
CREATE TABLE IF NOT EXISTS public.governance_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dealer_id TEXT NOT NULL,
    action_type TEXT NOT NULL,
    rule_name TEXT NOT NULL,
    violation_details JSONB,
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed'))
);

-- Governance Violations History
CREATE TABLE IF NOT EXISTS public.governance_violations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dealer_id TEXT NOT NULL,
    rule_name TEXT NOT NULL,
    violation_type TEXT NOT NULL,
    current_value NUMERIC NOT NULL,
    threshold_value NUMERIC NOT NULL,
    action_required TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('critical', 'high', 'medium')),
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'ignored'))
);

-- Enable Row Level Security
ALTER TABLE public.governance_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.model_weights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.governance_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.governance_violations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Public access to governance_rules" ON public.governance_rules
    FOR SELECT USING (true);

CREATE POLICY "Public access to model_weights" ON public.model_weights
    FOR SELECT USING (true);

CREATE POLICY "Public access to governance_actions" ON public.governance_actions
    FOR SELECT USING (true);

CREATE POLICY "Public access to governance_violations" ON public.governance_violations
    FOR SELECT USING (true);

-- Insert Default Governance Rules
INSERT INTO public.governance_rules (rule_name, rule_type, metric_name, operator, threshold_value, action_type, action_message) VALUES
-- Critical Rules (Freeze Model)
('R² Threshold Critical', 'threshold', 'r2', '<', 0.7, 'freeze_model', 'Model accuracy below critical threshold'),
('RMSE Threshold Critical', 'threshold', 'rmse', '>', 3.5, 'freeze_model', 'Model error above critical threshold'),

-- High Priority Rules (Manual Review)
('R² Threshold Warning', 'threshold', 'r2', '<', 0.8, 'manual_review', 'Model accuracy below warning threshold'),
('RMSE Threshold Warning', 'threshold', 'rmse', '>', 3.0, 'manual_review', 'Model error above warning threshold'),
('Accuracy Degradation', 'trend', 'accuracy_gain_percent', '<', -5.0, 'manual_review', 'Model accuracy declining significantly'),

-- Medium Priority Rules (Alert)
('ROI Efficiency Warning', 'threshold', 'roi_gain_percent', '<', 10.0, 'alert', 'ROI efficiency below target'),
('Ad Efficiency Warning', 'threshold', 'ad_efficiency_gain_percent', '<', 15.0, 'alert', 'Ad efficiency below target'),
('Correlation Warning', 'threshold', 'correlation_aiv_geo', '<', 0.8, 'alert', 'AIV-GEO correlation below target'),

-- Auto-Retrain Rules
('Latency Warning', 'threshold', 'mean_latency_days', '>', 7.0, 'auto_retrain', 'Model latency above acceptable threshold')
ON CONFLICT DO NOTHING;

-- Function to check governance violations
CREATE OR REPLACE FUNCTION check_governance_violations(dealer_id_param TEXT)
RETURNS TABLE (
    rule_name TEXT,
    violation_type TEXT,
    current_value NUMERIC,
    threshold_value NUMERIC,
    action_required TEXT,
    severity TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        gr.rule_name,
        gr.rule_type as violation_type,
        CASE 
            WHEN gr.metric_name = 'r2' THEN (SELECT r2 FROM model_audit WHERE dealer_id = dealer_id_param ORDER BY run_date DESC LIMIT 1)
            WHEN gr.metric_name = 'rmse' THEN (SELECT rmse FROM model_audit WHERE dealer_id = dealer_id_param ORDER BY run_date DESC LIMIT 1)
            WHEN gr.metric_name = 'accuracy_gain_percent' THEN (SELECT delta_accuracy FROM model_audit WHERE dealer_id = dealer_id_param ORDER BY run_date DESC LIMIT 1)
            WHEN gr.metric_name = 'roi_gain_percent' THEN 15.0 -- Mock value
            WHEN gr.metric_name = 'ad_efficiency_gain_percent' THEN 12.0 -- Mock value
            WHEN gr.metric_name = 'correlation_aiv_geo' THEN 0.85 -- Mock value
            WHEN gr.metric_name = 'mean_latency_days' THEN 5.0 -- Mock value
            ELSE 0.0
        END as current_value,
        gr.threshold_value,
        gr.action_type as action_required,
        CASE 
            WHEN gr.action_type = 'freeze_model' THEN 'critical'
            WHEN gr.action_type = 'manual_review' THEN 'high'
            ELSE 'medium'
        END as severity
    FROM governance_rules gr
    WHERE gr.is_active = true
    AND (
        (gr.metric_name = 'r2' AND (SELECT r2 FROM model_audit WHERE dealer_id = dealer_id_param ORDER BY run_date DESC LIMIT 1) < gr.threshold_value)
        OR (gr.metric_name = 'rmse' AND (SELECT rmse FROM model_audit WHERE dealer_id = dealer_id_param ORDER BY run_date DESC LIMIT 1) > gr.threshold_value)
        OR (gr.metric_name = 'accuracy_gain_percent' AND (SELECT delta_accuracy FROM model_audit WHERE dealer_id = dealer_id_param ORDER BY run_date DESC LIMIT 1) < gr.threshold_value)
        -- Add more conditions as needed
    );
END;
$$ LANGUAGE plpgsql;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_governance_rules_active ON public.governance_rules(is_active);
CREATE INDEX IF NOT EXISTS idx_model_weights_dealer ON public.model_weights(dealer_id);
CREATE INDEX IF NOT EXISTS idx_governance_actions_dealer ON public.governance_actions(dealer_id);
CREATE INDEX IF NOT EXISTS idx_governance_violations_dealer ON public.governance_violations(dealer_id);

-- Grant permissions
GRANT SELECT ON public.governance_rules TO anon, authenticated;
GRANT SELECT ON public.model_weights TO anon, authenticated;
GRANT SELECT ON public.governance_actions TO anon, authenticated;
GRANT SELECT ON public.governance_violations TO anon, authenticated;
GRANT EXECUTE ON FUNCTION check_governance_violations(TEXT) TO anon, authenticated;
