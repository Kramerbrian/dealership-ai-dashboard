-- Playbook Execution System Schema
-- This schema supports automated playbook execution for various business scenarios

-- Playbook Executions table
CREATE TABLE IF NOT EXISTS playbook_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id TEXT NOT NULL,
  playbook_type TEXT NOT NULL CHECK (playbook_type IN (
    'recover_missed_trades',
    'improve_ae_score',
    'reduce_hrp_alerts',
    'optimize_dtri_score',
    'increase_trade_capture'
  )),
  trigger_reason TEXT NOT NULL,
  current_metrics JSONB NOT NULL,
  target_metrics JSONB NOT NULL,
  strategy JSONB NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'failed')),
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  results JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Playbook Actions table (for tracking individual actions within a playbook)
CREATE TABLE IF NOT EXISTS playbook_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playbook_execution_id UUID REFERENCES playbook_executions(id) ON DELETE CASCADE,
  action_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed', 'skipped')),
  effort_estimate TEXT,
  cost_estimate NUMERIC,
  expected_impact TEXT,
  actual_impact TEXT,
  implementation_notes TEXT,
  assigned_to TEXT,
  due_date DATE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Playbook Templates table (for reusable playbook configurations)
CREATE TABLE IF NOT EXISTS playbook_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  playbook_type TEXT NOT NULL,
  trigger_conditions JSONB NOT NULL,
  strategy_template JSONB NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Playbook Metrics table (for tracking playbook performance)
CREATE TABLE IF NOT EXISTS playbook_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id TEXT NOT NULL,
  playbook_type TEXT NOT NULL,
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  metric_unit TEXT,
  measurement_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_playbook_executions_dealer_id ON playbook_executions(dealer_id);
CREATE INDEX IF NOT EXISTS idx_playbook_executions_type ON playbook_executions(playbook_type);
CREATE INDEX IF NOT EXISTS idx_playbook_executions_status ON playbook_executions(status);
CREATE INDEX IF NOT EXISTS idx_playbook_executions_created_at ON playbook_executions(created_at);

CREATE INDEX IF NOT EXISTS idx_playbook_actions_execution_id ON playbook_actions(playbook_execution_id);
CREATE INDEX IF NOT EXISTS idx_playbook_actions_status ON playbook_actions(status);
CREATE INDEX IF NOT EXISTS idx_playbook_actions_due_date ON playbook_actions(due_date);

CREATE INDEX IF NOT EXISTS idx_playbook_templates_type ON playbook_templates(playbook_type);
CREATE INDEX IF NOT EXISTS idx_playbook_templates_active ON playbook_templates(is_active);

CREATE INDEX IF NOT EXISTS idx_playbook_metrics_dealer_id ON playbook_metrics(dealer_id);
CREATE INDEX IF NOT EXISTS idx_playbook_metrics_type ON playbook_metrics(playbook_type);
CREATE INDEX IF NOT EXISTS idx_playbook_metrics_date ON playbook_metrics(measurement_date);

-- RLS Policies
ALTER TABLE playbook_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE playbook_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE playbook_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE playbook_metrics ENABLE ROW LEVEL SECURITY;

-- Playbook Executions policies
CREATE POLICY "Users can view their own playbook_executions" ON playbook_executions
  FOR SELECT USING (dealer_id = current_setting('app.current_dealer_id', true));

CREATE POLICY "Users can insert their own playbook_executions" ON playbook_executions
  FOR INSERT WITH CHECK (dealer_id = current_setting('app.current_dealer_id', true));

CREATE POLICY "Users can update their own playbook_executions" ON playbook_executions
  FOR UPDATE USING (dealer_id = current_setting('app.current_dealer_id', true));

-- Playbook Actions policies
CREATE POLICY "Users can view their own playbook_actions" ON playbook_actions
  FOR SELECT USING (
    playbook_execution_id IN (
      SELECT id FROM playbook_executions 
      WHERE dealer_id = current_setting('app.current_dealer_id', true)
    )
  );

CREATE POLICY "Users can insert their own playbook_actions" ON playbook_actions
  FOR INSERT WITH CHECK (
    playbook_execution_id IN (
      SELECT id FROM playbook_executions 
      WHERE dealer_id = current_setting('app.current_dealer_id', true)
    )
  );

CREATE POLICY "Users can update their own playbook_actions" ON playbook_actions
  FOR UPDATE USING (
    playbook_execution_id IN (
      SELECT id FROM playbook_executions 
      WHERE dealer_id = current_setting('app.current_dealer_id', true)
    )
  );

-- Playbook Templates policies (read-only for all users)
CREATE POLICY "Users can view playbook_templates" ON playbook_templates
  FOR SELECT USING (is_active = TRUE);

-- Playbook Metrics policies
CREATE POLICY "Users can view their own playbook_metrics" ON playbook_metrics
  FOR SELECT USING (dealer_id = current_setting('app.current_dealer_id', true));

CREATE POLICY "Users can insert their own playbook_metrics" ON playbook_metrics
  FOR INSERT WITH CHECK (dealer_id = current_setting('app.current_dealer_id', true));

-- Functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_playbook_executions_updated_at BEFORE UPDATE ON playbook_executions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_playbook_actions_updated_at BEFORE UPDATE ON playbook_actions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_playbook_templates_updated_at BEFORE UPDATE ON playbook_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- View for Playbook Performance Summary
CREATE OR REPLACE VIEW playbook_performance_summary AS
SELECT 
  pe.dealer_id,
  pe.playbook_type,
  COUNT(*) as total_executions,
  COUNT(*) FILTER (WHERE pe.status = 'completed') as completed_executions,
  COUNT(*) FILTER (WHERE pe.status = 'active') as active_executions,
  AVG(pe.progress_percentage) as avg_progress,
  AVG(EXTRACT(EPOCH FROM (pe.completed_at - pe.created_at))/3600) as avg_completion_hours,
  MAX(pe.created_at) as last_execution
FROM playbook_executions pe
GROUP BY pe.dealer_id, pe.playbook_type;

-- View for Action Performance Summary
CREATE OR REPLACE VIEW action_performance_summary AS
SELECT 
  pe.dealer_id,
  pe.playbook_type,
  pa.action_id,
  pa.title,
  COUNT(*) as total_actions,
  COUNT(*) FILTER (WHERE pa.status = 'completed') as completed_actions,
  COUNT(*) FILTER (WHERE pa.status = 'failed') as failed_actions,
  AVG(EXTRACT(EPOCH FROM (pa.completed_at - pa.created_at))/3600) as avg_completion_hours,
  AVG(pa.cost_estimate) as avg_cost
FROM playbook_executions pe
JOIN playbook_actions pa ON pe.id = pa.playbook_execution_id
GROUP BY pe.dealer_id, pe.playbook_type, pa.action_id, pa.title;

-- Function to calculate playbook ROI
CREATE OR REPLACE FUNCTION calculate_playbook_roi(
  p_dealer_id TEXT,
  p_playbook_type TEXT,
  p_start_date DATE,
  p_end_date DATE
) RETURNS TABLE (
  total_cost NUMERIC,
  total_benefit NUMERIC,
  roi_percentage NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(pa.cost_estimate), 0) as total_cost,
    COALESCE(SUM(
      CASE 
        WHEN pa.actual_impact ~ '^\$' THEN 
          CAST(REPLACE(pa.actual_impact, '$', '') AS NUMERIC)
        ELSE 0
      END
    ), 0) as total_benefit,
    CASE 
      WHEN COALESCE(SUM(pa.cost_estimate), 0) > 0 THEN
        ((COALESCE(SUM(
          CASE 
            WHEN pa.actual_impact ~ '^\$' THEN 
              CAST(REPLACE(pa.actual_impact, '$', '') AS NUMERIC)
            ELSE 0
          END
        ), 0) - COALESCE(SUM(pa.cost_estimate), 0)) / COALESCE(SUM(pa.cost_estimate), 0)) * 100
      ELSE 0
    END as roi_percentage
  FROM playbook_executions pe
  JOIN playbook_actions pa ON pe.id = pa.playbook_execution_id
  WHERE pe.dealer_id = p_dealer_id
    AND pe.playbook_type = p_playbook_type
    AND pe.created_at::DATE >= p_start_date
    AND pe.created_at::DATE <= p_end_date
    AND pa.status = 'completed';
END;
$$ LANGUAGE plpgsql;

-- Insert default playbook templates
INSERT INTO playbook_templates (name, description, playbook_type, trigger_conditions, strategy_template) VALUES
(
  'Recover Missed Trades - Standard',
  'Standard playbook for recovering missed trade-in opportunities',
  'recover_missed_trades',
  '{"ae_score": {"operator": "<", "value": 70}, "missed_trades_pct": {"operator": ">", "value": 15}}',
  '{"priority": "high", "timeline": "30 days", "actions": ["immediate_followup", "pricing_optimization", "process_improvement"]}'
),
(
  'Improve AE Score - Advanced',
  'Advanced playbook for improving Acquisition Efficiency scores',
  'improve_ae_score',
  '{"ae_score": {"operator": "<", "value": 80}}',
  '{"priority": "high", "timeline": "45 days", "actions": ["competitive_analysis", "pricing_optimization", "process_improvement", "staff_training"]}'
),
(
  'Reduce HRP Alerts - Critical',
  'Critical playbook for reducing HRP (Hallucination Risk Probability) alerts',
  'reduce_hrp_alerts',
  '{"hrp_alerts_count": {"operator": ">", "value": 5}, "hrp_avg_score": {"operator": ">", "value": 0.5}}',
  '{"priority": "critical", "timeline": "14 days", "actions": ["content_review", "ai_training", "manual_override_setup"]}'
);

