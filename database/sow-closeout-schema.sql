-- MAXIMUS ROI Verification & Close-Out Schema
-- This schema supports the closed-loop β-coefficient recalibration system

-- Mark SOW completion + actuals
CREATE TABLE IF NOT EXISTS sow_closeout (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sow_id TEXT UNIQUE NOT NULL,
  dealer_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  actual_cr_lift NUMERIC,            -- % points (e.g., 0.012)
  actual_margin_gain NUMERIC,        -- $ uplift
  vdp_speed_change NUMERIC,          -- seconds reduced (+ is faster)
  ftfr_change NUMERIC,               -- % points
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Intervention audit rows for β service
CREATE TABLE IF NOT EXISTS intervention_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id TEXT NOT NULL,
  metric_id TEXT NOT NULL,
  predicted_cr_lift NUMERIC,
  actual_cr_lift NUMERIC,
  vdp_speed_change NUMERIC,
  predicted_margin_gain NUMERIC,
  actual_margin_gain NUMERIC,
  ftfr_change NUMERIC,
  accuracy_score NUMERIC,            -- calculated accuracy (0-1)
  beta_adjustment NUMERIC,           -- β coefficient adjustment
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SOW records table (if not exists)
CREATE TABLE IF NOT EXISTS sow_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sow_id TEXT UNIQUE NOT NULL,
  dealer_id TEXT NOT NULL,
  title TEXT NOT NULL,
  event_type TEXT NOT NULL,
  status TEXT DEFAULT 'Pending Confirmation',
  predicted_roi_usd NUMERIC,
  predicted_cr_lift NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_sow_closeout_dealer_id ON sow_closeout(dealer_id);
CREATE INDEX IF NOT EXISTS idx_sow_closeout_completed_at ON sow_closeout(completed_at);
CREATE INDEX IF NOT EXISTS idx_intervention_audit_dealer_id ON intervention_audit(dealer_id);
CREATE INDEX IF NOT EXISTS idx_intervention_audit_metric_id ON intervention_audit(metric_id);
CREATE INDEX IF NOT EXISTS idx_intervention_audit_timestamp ON intervention_audit(timestamp);
CREATE INDEX IF NOT EXISTS idx_sow_records_dealer_id ON sow_records(dealer_id);
CREATE INDEX IF NOT EXISTS idx_sow_records_status ON sow_records(status);
CREATE INDEX IF NOT EXISTS idx_sow_records_created_at ON sow_records(created_at);

-- RLS Policies
ALTER TABLE sow_closeout ENABLE ROW LEVEL SECURITY;
ALTER TABLE intervention_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE sow_records ENABLE ROW LEVEL SECURITY;

-- Policy for sow_closeout
CREATE POLICY "Users can view their own sow_closeout" ON sow_closeout
  FOR SELECT USING (dealer_id = current_setting('app.current_dealer_id', true));

CREATE POLICY "Users can insert their own sow_closeout" ON sow_closeout
  FOR INSERT WITH CHECK (dealer_id = current_setting('app.current_dealer_id', true));

-- Policy for intervention_audit
CREATE POLICY "Users can view their own intervention_audit" ON intervention_audit
  FOR SELECT USING (dealer_id = current_setting('app.current_dealer_id', true));

-- Policy for sow_records
CREATE POLICY "Users can view their own sow_records" ON sow_records
  FOR SELECT USING (dealer_id = current_setting('app.current_dealer_id', true));

CREATE POLICY "Users can insert their own sow_records" ON sow_records
  FOR INSERT WITH CHECK (dealer_id = current_setting('app.current_dealer_id', true));

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_sow_closeout_updated_at BEFORE UPDATE ON sow_closeout
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sow_records_updated_at BEFORE UPDATE ON sow_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- View for close-out summary
CREATE OR REPLACE VIEW closeout_summary AS
SELECT 
  sc.dealer_id,
  sc.event_type,
  COUNT(*) as total_closeouts,
  AVG(sc.actual_cr_lift) as avg_actual_cr_lift,
  AVG(sc.actual_margin_gain) as avg_actual_margin_gain,
  AVG(sc.vdp_speed_change) as avg_vdp_speed_change,
  AVG(sc.ftfr_change) as avg_ftfr_change,
  SUM(sc.actual_margin_gain) as total_margin_gain,
  MAX(sc.completed_at) as last_closeout
FROM sow_closeout sc
GROUP BY sc.dealer_id, sc.event_type;

-- View for intervention accuracy
CREATE OR REPLACE VIEW intervention_accuracy AS
SELECT 
  ia.dealer_id,
  ia.metric_id,
  COUNT(*) as total_interventions,
  AVG(ia.accuracy_score) as avg_accuracy,
  AVG(ia.beta_adjustment) as avg_beta_adjustment,
  AVG(ia.predicted_cr_lift) as avg_predicted_cr_lift,
  AVG(ia.actual_cr_lift) as avg_actual_cr_lift,
  AVG(ia.predicted_margin_gain) as avg_predicted_margin_gain,
  AVG(ia.actual_margin_gain) as avg_actual_margin_gain,
  MAX(ia.timestamp) as last_intervention
FROM intervention_audit ia
GROUP BY ia.dealer_id, ia.metric_id;
