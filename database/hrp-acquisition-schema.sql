-- HRP Red-Banner Governance & Acquisition KPIs Schema
-- This schema supports the HRP policy enforcement and acquisition intelligence systems

-- HRP Alerts table
CREATE TABLE IF NOT EXISTS hrp_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id TEXT NOT NULL,
  review_id TEXT NOT NULL,
  review_content TEXT NOT NULL,
  hrp_score NUMERIC NOT NULL CHECK (hrp_score >= 0 AND hrp_score <= 1),
  detected_issues TEXT[] DEFAULT '{}',
  auto_generated BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'reviewed', 'cleared', 'suppressed')),
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ,
  manual_override BOOLEAN DEFAULT FALSE,
  fact_check_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Review Responses table (for tracking response status)
CREATE TABLE IF NOT EXISTS review_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id TEXT NOT NULL,
  review_id TEXT NOT NULL,
  response_content TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'blocked', 'suppressed')),
  hrp_suppressed BOOLEAN DEFAULT FALSE,
  hrp_override BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Acquisition Metrics table
CREATE TABLE IF NOT EXISTS acquisition_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id TEXT NOT NULL,
  date DATE NOT NULL,
  appraisals INTEGER DEFAULT 0,
  retail_sales INTEGER DEFAULT 0,
  trades_captured INTEGER DEFAULT 0,
  missed_trades INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(dealer_id, date)
);

-- VIN Resurface Alerts table
CREATE TABLE IF NOT EXISTS vin_resurface_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id TEXT NOT NULL,
  vin TEXT NOT NULL,
  appraisal_date DATE NOT NULL,
  auction_date DATE NOT NULL,
  days_since_appraisal INTEGER NOT NULL,
  auction_price NUMERIC,
  potential_loss NUMERIC,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'reviewed', 'resolved')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Beta Recalibration Log table
CREATE TABLE IF NOT EXISTS beta_recalibration_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id TEXT NOT NULL,
  metric_id TEXT NOT NULL,
  old_beta NUMERIC,
  new_beta NUMERIC,
  accuracy NUMERIC,
  sample_size INTEGER,
  recalibrated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_hrp_alerts_dealer_id ON hrp_alerts(dealer_id);
CREATE INDEX IF NOT EXISTS idx_hrp_alerts_status ON hrp_alerts(status);
CREATE INDEX IF NOT EXISTS idx_hrp_alerts_hrp_score ON hrp_alerts(hrp_score);
CREATE INDEX IF NOT EXISTS idx_hrp_alerts_created_at ON hrp_alerts(created_at);

CREATE INDEX IF NOT EXISTS idx_review_responses_dealer_id ON review_responses(dealer_id);
CREATE INDEX IF NOT EXISTS idx_review_responses_review_id ON review_responses(review_id);
CREATE INDEX IF NOT EXISTS idx_review_responses_status ON review_responses(status);

CREATE INDEX IF NOT EXISTS idx_acquisition_metrics_dealer_id ON acquisition_metrics(dealer_id);
CREATE INDEX IF NOT EXISTS idx_acquisition_metrics_date ON acquisition_metrics(date);
CREATE INDEX IF NOT EXISTS idx_acquisition_metrics_dealer_date ON acquisition_metrics(dealer_id, date);

CREATE INDEX IF NOT EXISTS idx_vin_resurface_alerts_dealer_id ON vin_resurface_alerts(dealer_id);
CREATE INDEX IF NOT EXISTS idx_vin_resurface_alerts_vin ON vin_resurface_alerts(vin);
CREATE INDEX IF NOT EXISTS idx_vin_resurface_alerts_status ON vin_resurface_alerts(status);

CREATE INDEX IF NOT EXISTS idx_beta_recalibration_dealer_id ON beta_recalibration_log(dealer_id);
CREATE INDEX IF NOT EXISTS idx_beta_recalibration_metric_id ON beta_recalibration_log(metric_id);
CREATE INDEX IF NOT EXISTS idx_beta_recalibration_date ON beta_recalibration_log(recalibrated_at);

-- RLS Policies
ALTER TABLE hrp_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE acquisition_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE vin_resurface_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE beta_recalibration_log ENABLE ROW LEVEL SECURITY;

-- HRP Alerts policies
CREATE POLICY "Users can view their own hrp_alerts" ON hrp_alerts
  FOR SELECT USING (dealer_id = current_setting('app.current_dealer_id', true));

CREATE POLICY "Users can update their own hrp_alerts" ON hrp_alerts
  FOR UPDATE USING (dealer_id = current_setting('app.current_dealer_id', true));

-- Review Responses policies
CREATE POLICY "Users can view their own review_responses" ON review_responses
  FOR SELECT USING (dealer_id = current_setting('app.current_dealer_id', true));

CREATE POLICY "Users can insert their own review_responses" ON review_responses
  FOR INSERT WITH CHECK (dealer_id = current_setting('app.current_dealer_id', true));

CREATE POLICY "Users can update their own review_responses" ON review_responses
  FOR UPDATE USING (dealer_id = current_setting('app.current_dealer_id', true));

-- Acquisition Metrics policies
CREATE POLICY "Users can view their own acquisition_metrics" ON acquisition_metrics
  FOR SELECT USING (dealer_id = current_setting('app.current_dealer_id', true));

CREATE POLICY "Users can insert their own acquisition_metrics" ON acquisition_metrics
  FOR INSERT WITH CHECK (dealer_id = current_setting('app.current_dealer_id', true));

CREATE POLICY "Users can update their own acquisition_metrics" ON acquisition_metrics
  FOR UPDATE USING (dealer_id = current_setting('app.current_dealer_id', true));

-- VIN Resurface Alerts policies
CREATE POLICY "Users can view their own vin_resurface_alerts" ON vin_resurface_alerts
  FOR SELECT USING (dealer_id = current_setting('app.current_dealer_id', true));

-- Beta Recalibration Log policies
CREATE POLICY "Users can view their own beta_recalibration_log" ON beta_recalibration_log
  FOR SELECT USING (dealer_id = current_setting('app.current_dealer_id', true));

-- Functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_hrp_alerts_updated_at BEFORE UPDATE ON hrp_alerts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_review_responses_updated_at BEFORE UPDATE ON review_responses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_acquisition_metrics_updated_at BEFORE UPDATE ON acquisition_metrics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vin_resurface_alerts_updated_at BEFORE UPDATE ON vin_resurface_alerts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- View for HRP Alert Summary
CREATE OR REPLACE VIEW hrp_alert_summary AS
SELECT 
  dealer_id,
  COUNT(*) as total_alerts,
  COUNT(*) FILTER (WHERE status = 'active') as active_alerts,
  COUNT(*) FILTER (WHERE status = 'cleared') as cleared_alerts,
  COUNT(*) FILTER (WHERE status = 'suppressed') as suppressed_alerts,
  AVG(hrp_score) as avg_hrp_score,
  MAX(created_at) as last_alert
FROM hrp_alerts
GROUP BY dealer_id;

-- View for Acquisition Performance Summary
CREATE OR REPLACE VIEW acquisition_performance_summary AS
SELECT 
  dealer_id,
  SUM(appraisals) as total_appraisals,
  SUM(retail_sales) as total_retail_sales,
  SUM(trades_captured) as total_trades_captured,
  SUM(missed_trades) as total_missed_trades,
  CASE 
    WHEN SUM(retail_sales) > 0 THEN (SUM(appraisals)::NUMERIC / SUM(retail_sales)) * 100
    ELSE 0
  END as a2s_ratio,
  CASE 
    WHEN SUM(appraisals) > 0 THEN (SUM(trades_captured)::NUMERIC / SUM(appraisals)) * 100
    ELSE 0
  END as trade_capture_pct,
  CASE 
    WHEN SUM(appraisals) > 0 THEN (SUM(missed_trades)::NUMERIC / SUM(appraisals)) * 100
    ELSE 0
  END as missed_trades_pct,
  MAX(date) as last_metric_date
FROM acquisition_metrics
GROUP BY dealer_id;

-- Function to calculate Acquisition Efficiency Score
CREATE OR REPLACE FUNCTION calculate_acquisition_efficiency(
  a2s_ratio NUMERIC,
  trade_capture_pct NUMERIC,
  missed_trades_pct NUMERIC
) RETURNS NUMERIC AS $$
BEGIN
  RETURN (a2s_ratio * 0.4) + (trade_capture_pct * 0.4) - (missed_trades_pct * 0.2);
END;
$$ LANGUAGE plpgsql;

-- Function to check if VIN should trigger resurface alert
CREATE OR REPLACE FUNCTION check_vin_resurface(
  p_dealer_id TEXT,
  p_vin TEXT,
  p_auction_date DATE,
  p_auction_price NUMERIC
) RETURNS BOOLEAN AS $$
DECLARE
  appraisal_date DATE;
  days_diff INTEGER;
BEGIN
  -- Check if VIN was appraised within last 60 days
  SELECT date INTO appraisal_date
  FROM acquisition_metrics
  WHERE dealer_id = p_dealer_id
    AND date >= p_auction_date - INTERVAL '60 days'
  ORDER BY date DESC
  LIMIT 1;
  
  IF appraisal_date IS NULL THEN
    RETURN FALSE;
  END IF;
  
  days_diff := p_auction_date - appraisal_date;
  
  -- Alert if VIN resurfaced within 60 days
  IF days_diff <= 60 THEN
    INSERT INTO vin_resurface_alerts (
      dealer_id, vin, appraisal_date, auction_date, 
      days_since_appraisal, auction_price, potential_loss
    ) VALUES (
      p_dealer_id, p_vin, appraisal_date, p_auction_date,
      days_diff, p_auction_price, p_auction_price * 0.1 -- Assume 10% potential loss
    );
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql;
