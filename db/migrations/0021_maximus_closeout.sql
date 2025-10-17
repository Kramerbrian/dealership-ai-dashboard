-- MAXIMUS ROI Verification & Close-Out Schema
-- Tracks SOW completion and actual results for β-recalibration

-- Mark SOW completion + actuals
CREATE TABLE IF NOT EXISTS sow_closeout (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sow_id text UNIQUE NOT NULL,
  dealer_id text NOT NULL,
  event_type text NOT NULL,
  completed_at timestamptz DEFAULT now(),
  actual_cr_lift numeric,            -- % points (e.g., 0.012)
  actual_margin_gain numeric,        -- $ uplift
  vdp_speed_change numeric,          -- seconds reduced (+ is faster)
  ftfr_change numeric,               -- % points
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Intervention audit rows for β service
CREATE TABLE IF NOT EXISTS intervention_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id text NOT NULL,
  metric_id text NOT NULL,
  predicted_cr_lift numeric,
  actual_cr_lift numeric,
  vdp_speed_change numeric,
  predicted_margin_gain numeric,
  actual_margin_gain numeric,
  ftfr_change numeric,
  timestamp timestamptz DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_sow_closeout_sow_id ON sow_closeout (sow_id);
CREATE INDEX IF NOT EXISTS idx_sow_closeout_dealer_id ON sow_closeout (dealer_id);
CREATE INDEX IF NOT EXISTS idx_sow_closeout_completed_at ON sow_closeout (completed_at);
CREATE INDEX IF NOT EXISTS idx_intervention_audit_dealer_id ON intervention_audit (dealer_id);
CREATE INDEX IF NOT EXISTS idx_intervention_audit_metric_id ON intervention_audit (metric_id);
CREATE INDEX IF NOT EXISTS idx_intervention_audit_timestamp ON intervention_audit (timestamp);

-- RLS policies
ALTER TABLE sow_closeout ENABLE ROW LEVEL SECURITY;
ALTER TABLE intervention_audit ENABLE ROW LEVEL SECURITY;

-- Allow service role to manage all records
CREATE POLICY "Service role can manage sow_closeout" ON sow_closeout
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage intervention_audit" ON intervention_audit
  FOR ALL USING (auth.role() = 'service_role');

-- Allow authenticated users to read their own dealer data
CREATE POLICY "Users can read own dealer sow_closeout" ON sow_closeout
  FOR SELECT USING (
    auth.role() = 'authenticated' AND 
    dealer_id IN (
      SELECT dealer_id FROM user_dealer_access 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can read own dealer intervention_audit" ON intervention_audit
  FOR SELECT USING (
    auth.role() = 'authenticated' AND 
    dealer_id IN (
      SELECT dealer_id FROM user_dealer_access 
      WHERE user_id = auth.uid()
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_sow_closeout_updated_at 
  BEFORE UPDATE ON sow_closeout 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- View for SOW closeout summary
CREATE OR REPLACE VIEW sow_closeout_summary AS
SELECT 
  sc.sow_id,
  sc.dealer_id,
  sc.event_type,
  sc.completed_at,
  sc.actual_cr_lift,
  sc.actual_margin_gain,
  sc.vdp_speed_change,
  sc.ftfr_change,
  sr.predicted_roi_usd,
  sr.title as sow_title,
  sr.created_at as sow_created_at,
  -- Calculate variance
  CASE 
    WHEN sr.predicted_roi_usd IS NOT NULL AND sc.actual_margin_gain IS NOT NULL 
    THEN ((sc.actual_margin_gain - sr.predicted_roi_usd) / NULLIF(sr.predicted_roi_usd, 0)) * 100
    ELSE NULL
  END as roi_variance_pct,
  -- Calculate accuracy score
  CASE 
    WHEN sr.predicted_roi_usd IS NOT NULL AND sc.actual_margin_gain IS NOT NULL 
    THEN 100 - ABS(((sc.actual_margin_gain - sr.predicted_roi_usd) / NULLIF(sr.predicted_roi_usd, 0)) * 100)
    ELSE NULL
  END as prediction_accuracy_pct
FROM sow_closeout sc
LEFT JOIN sow_records sr ON sc.sow_id = sr.sow_id;

-- View for intervention audit summary
CREATE OR REPLACE VIEW intervention_audit_summary AS
SELECT 
  ia.dealer_id,
  ia.metric_id,
  COUNT(*) as total_interventions,
  AVG(ia.predicted_cr_lift) as avg_predicted_cr_lift,
  AVG(ia.actual_cr_lift) as avg_actual_cr_lift,
  AVG(ia.predicted_margin_gain) as avg_predicted_margin_gain,
  AVG(ia.actual_margin_gain) as avg_actual_margin_gain,
  -- Calculate model accuracy
  CASE 
    WHEN AVG(ia.predicted_margin_gain) IS NOT NULL AND AVG(ia.actual_margin_gain) IS NOT NULL 
    THEN 100 - ABS(((AVG(ia.actual_margin_gain) - AVG(ia.predicted_margin_gain)) / NULLIF(AVG(ia.predicted_margin_gain), 0)) * 100)
    ELSE NULL
  END as model_accuracy_pct,
  MAX(ia.timestamp) as last_updated
FROM intervention_audit ia
GROUP BY ia.dealer_id, ia.metric_id;

-- Grant permissions
GRANT SELECT ON sow_closeout_summary TO authenticated;
GRANT SELECT ON intervention_audit_summary TO authenticated;
