-- AIV Closed-Loop Analytics System Schema
-- Self-improving Algorithmic Visibility Index with continuous learning

-- Raw signals table for ingesting fresh data
CREATE TABLE aiv_raw_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id UUID NOT NULL,
  date DATE NOT NULL,
  seo NUMERIC(5,2),
  aeo NUMERIC(5,2),
  geo NUMERIC(5,2),
  ugc NUMERIC(5,2),
  geolocal NUMERIC(5,2),
  observed_aiv NUMERIC(5,2),
  observed_rar NUMERIC(10,2),
  elasticity_usd_per_pt NUMERIC(8,2),
  confidence_score NUMERIC(3,2),
  data_source TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure one record per dealer per date
  UNIQUE(dealer_id, date)
);

-- Model weights table for tracking weight evolution
CREATE TABLE model_weights (
  asof_date DATE PRIMARY KEY,
  seo_w NUMERIC(4,3) NOT NULL DEFAULT 0.25,
  aeo_w NUMERIC(4,3) NOT NULL DEFAULT 0.30,
  geo_w NUMERIC(4,3) NOT NULL DEFAULT 0.25,
  ugc_w NUMERIC(4,3) NOT NULL DEFAULT 0.10,
  geolocal_w NUMERIC(4,3) NOT NULL DEFAULT 0.10,
  r2 NUMERIC(4,3),
  rmse NUMERIC(5,2),
  mape NUMERIC(5,2),
  learning_rate NUMERIC(6,4) DEFAULT 0.1,
  reward_signal NUMERIC(8,2),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure weights sum to 1.0
  CONSTRAINT weights_sum_to_one CHECK (
    ABS((seo_w + aeo_w + geo_w + ugc_w + geolocal_w) - 1.0) < 0.001
  )
);

-- Model audit table for tracking performance over time
CREATE TABLE model_audit (
  run_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_date TIMESTAMPTZ DEFAULT NOW(),
  run_type TEXT NOT NULL, -- 'reinforce', 'evaluate', 'predict', 'anomaly'
  dealer_id UUID,
  rmse NUMERIC(5,2),
  mape NUMERIC(5,2),
  r2 NUMERIC(4,3),
  delta_accuracy NUMERIC(5,2),
  accuracy_gain_mom NUMERIC(5,2), -- Month over month
  model_version TEXT DEFAULT 'v1.0',
  notes TEXT,
  metadata JSONB,
  
  -- Index for performance
  INDEX idx_model_audit_date (run_date),
  INDEX idx_model_audit_type (run_type),
  INDEX idx_model_audit_dealer (dealer_id)
);

-- Anomaly detection results
CREATE TABLE anomaly_detection (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id UUID NOT NULL,
  detection_date TIMESTAMPTZ DEFAULT NOW(),
  anomaly_type TEXT NOT NULL, -- 'velocity_spike', 'sentiment_anomaly', 'fraud_probability'
  severity TEXT NOT NULL, -- 'low', 'medium', 'high', 'critical'
  fraud_probability NUMERIC(3,2),
  fraudguard_penalty NUMERIC(3,2),
  evidence JSONB,
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID,
  
  INDEX idx_anomaly_dealer_date (dealer_id, detection_date),
  INDEX idx_anomaly_severity (severity),
  INDEX idx_anomaly_resolved (resolved)
);

-- Predictive forecasts storage
CREATE TABLE predictive_forecasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id UUID NOT NULL,
  forecast_date DATE NOT NULL,
  predicted_aiv NUMERIC(5,2),
  confidence_interval_lower NUMERIC(5,2),
  confidence_interval_upper NUMERIC(5,2),
  predicted_rar NUMERIC(10,2),
  trend_classification TEXT, -- 'growth', 'stable', 'decline'
  trend_confidence NUMERIC(3,2),
  model_accuracy NUMERIC(3,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(dealer_id, forecast_date),
  INDEX idx_forecast_dealer_date (dealer_id, forecast_date)
);

-- Reinforcement learning history
CREATE TABLE reinforcement_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id UUID NOT NULL,
  training_date TIMESTAMPTZ DEFAULT NOW(),
  old_weights JSONB NOT NULL,
  new_weights JSONB NOT NULL,
  reward_signal NUMERIC(8,2),
  learning_rate NUMERIC(6,4),
  gradient_magnitude NUMERIC(8,4),
  convergence_metric NUMERIC(8,4),
  training_samples INTEGER,
  
  INDEX idx_reinforcement_dealer_date (dealer_id, training_date)
);

-- Row Level Security (RLS) policies
ALTER TABLE aiv_raw_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_weights ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE anomaly_detection ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictive_forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE reinforcement_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies (adjust based on your auth system)
CREATE POLICY "Users can view their own dealer data" ON aiv_raw_signals
  FOR SELECT USING (dealer_id IN (
    SELECT dealer_id FROM user_dealers WHERE user_id = auth.uid()
  ));

CREATE POLICY "Service role can manage all data" ON aiv_raw_signals
  FOR ALL USING (auth.role() = 'service_role');

-- Similar policies for other tables
CREATE POLICY "Service role can manage model weights" ON model_weights
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage model audit" ON model_audit
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage anomalies" ON anomaly_detection
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage forecasts" ON predictive_forecasts
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage reinforcement" ON reinforcement_history
  FOR ALL USING (auth.role() = 'service_role');

-- Functions for automated processing

-- Function to compute 8-week rolling regression
CREATE OR REPLACE FUNCTION recompute_elasticity_8w(dealer_uuid UUID)
RETURNS TABLE (
  slope NUMERIC,
  r2 NUMERIC,
  rmse NUMERIC,
  elasticity_usd_per_pt NUMERIC
) AS $$
DECLARE
  signals_data RECORD;
  x_vals NUMERIC[];
  y_vals NUMERIC[];
  n INTEGER;
  x_mean NUMERIC;
  y_mean NUMERIC;
  numerator NUMERIC;
  denominator NUMERIC;
  slope_val NUMERIC;
  intercept NUMERIC;
  ss_res NUMERIC;
  ss_tot NUMERIC;
  r2_val NUMERIC;
  rmse_val NUMERIC;
BEGIN
  -- Get last 8 weeks of data
  SELECT ARRAY_AGG(geo ORDER BY date), ARRAY_AGG(observed_rar ORDER BY date)
  INTO x_vals, y_vals
  FROM aiv_raw_signals
  WHERE dealer_id = dealer_uuid
    AND date >= CURRENT_DATE - INTERVAL '8 weeks'
    AND geo IS NOT NULL
    AND observed_rar IS NOT NULL;
  
  -- Check if we have enough data
  IF array_length(x_vals, 1) < 4 THEN
    RETURN QUERY SELECT 0::NUMERIC, 0::NUMERIC, 0::NUMERIC, 0::NUMERIC;
    RETURN;
  END IF;
  
  n := array_length(x_vals, 1);
  
  -- Calculate means
  x_mean := (SELECT AVG(unnest) FROM unnest(x_vals));
  y_mean := (SELECT AVG(unnest) FROM unnest(y_vals));
  
  -- Calculate slope (simple linear regression)
  numerator := 0;
  denominator := 0;
  
  FOR i IN 1..n LOOP
    numerator := numerator + (x_vals[i] - x_mean) * (y_vals[i] - y_mean);
    denominator := denominator + (x_vals[i] - x_mean) * (x_vals[i] - x_mean);
  END LOOP;
  
  slope_val := numerator / NULLIF(denominator, 0);
  intercept := y_mean - slope_val * x_mean;
  
  -- Calculate R²
  ss_res := 0;
  ss_tot := 0;
  
  FOR i IN 1..n LOOP
    ss_res := ss_res + (y_vals[i] - (slope_val * x_vals[i] + intercept))^2;
    ss_tot := ss_tot + (y_vals[i] - y_mean)^2;
  END LOOP;
  
  r2_val := 1 - (ss_res / NULLIF(ss_tot, 0));
  
  -- Calculate RMSE
  rmse_val := SQRT(ss_res / n);
  
  RETURN QUERY SELECT slope_val, r2_val, rmse_val, slope_val;
END;
$$ LANGUAGE plpgsql;

-- Function to update model weights using reinforcement learning
CREATE OR REPLACE FUNCTION update_model_weights(
  dealer_uuid UUID,
  reward_signal NUMERIC,
  learning_rate NUMERIC DEFAULT 0.1
)
RETURNS JSONB AS $$
DECLARE
  current_weights RECORD;
  new_weights JSONB;
  gradient_magnitude NUMERIC;
BEGIN
  -- Get current weights
  SELECT * INTO current_weights
  FROM model_weights
  ORDER BY asof_date DESC
  LIMIT 1;
  
  -- If no weights exist, use defaults
  IF current_weights IS NULL THEN
    current_weights.seo_w := 0.25;
    current_weights.aeo_w := 0.30;
    current_weights.geo_w := 0.25;
    current_weights.ugc_w := 0.10;
    current_weights.geolocal_w := 0.10;
  END IF;
  
  -- Simple gradient update (in practice, use more sophisticated RL)
  new_weights := jsonb_build_object(
    'seo_w', GREATEST(0.05, LEAST(0.5, current_weights.seo_w + learning_rate * reward_signal * 0.1)),
    'aeo_w', GREATEST(0.05, LEAST(0.5, current_weights.aeo_w + learning_rate * reward_signal * 0.2)),
    'geo_w', GREATEST(0.05, LEAST(0.5, current_weights.geo_w + learning_rate * reward_signal * 0.3)),
    'ugc_w', GREATEST(0.05, LEAST(0.5, current_weights.ugc_w + learning_rate * reward_signal * 0.2)),
    'geolocal_w', GREATEST(0.05, LEAST(0.5, current_weights.geolocal_w + learning_rate * reward_signal * 0.2))
  );
  
  -- Normalize weights to sum to 1.0
  new_weights := jsonb_build_object(
    'seo_w', (new_weights->>'seo_w')::NUMERIC / (
      (new_weights->>'seo_w')::NUMERIC + 
      (new_weights->>'aeo_w')::NUMERIC + 
      (new_weights->>'geo_w')::NUMERIC + 
      (new_weights->>'ugc_w')::NUMERIC + 
      (new_weights->>'geolocal_w')::NUMERIC
    ),
    'aeo_w', (new_weights->>'aeo_w')::NUMERIC / (
      (new_weights->>'seo_w')::NUMERIC + 
      (new_weights->>'aeo_w')::NUMERIC + 
      (new_weights->>'geo_w')::NUMERIC + 
      (new_weights->>'ugc_w')::NUMERIC + 
      (new_weights->>'geolocal_w')::NUMERIC
    ),
    'geo_w', (new_weights->>'geo_w')::NUMERIC / (
      (new_weights->>'seo_w')::NUMERIC + 
      (new_weights->>'aeo_w')::NUMERIC + 
      (new_weights->>'geo_w')::NUMERIC + 
      (new_weights->>'ugc_w')::NUMERIC + 
      (new_weights->>'geolocal_w')::NUMERIC
    ),
    'ugc_w', (new_weights->>'ugc_w')::NUMERIC / (
      (new_weights->>'seo_w')::NUMERIC + 
      (new_weights->>'aeo_w')::NUMERIC + 
      (new_weights->>'geo_w')::NUMERIC + 
      (new_weights->>'ugc_w')::NUMERIC + 
      (new_weights->>'geolocal_w')::NUMERIC
    ),
    'geolocal_w', (new_weights->>'geolocal_w')::NUMERIC / (
      (new_weights->>'seo_w')::NUMERIC + 
      (new_weights->>'aeo_w')::NUMERIC + 
      (new_weights->>'geo_w')::NUMERIC + 
      (new_weights->>'ugc_w')::NUMERIC + 
      (new_weights->>'geolocal_w')::NUMERIC
    )
  );
  
  -- Insert new weights
  INSERT INTO model_weights (
    asof_date, seo_w, aeo_w, geo_w, ugc_w, geolocal_w,
    learning_rate, reward_signal
  ) VALUES (
    CURRENT_DATE,
    (new_weights->>'seo_w')::NUMERIC,
    (new_weights->>'aeo_w')::NUMERIC,
    (new_weights->>'geo_w')::NUMERIC,
    (new_weights->>'ugc_w')::NUMERIC,
    (new_weights->>'geolocal_w')::NUMERIC,
    learning_rate,
    reward_signal
  );
  
  -- Log reinforcement learning history
  INSERT INTO reinforcement_history (
    dealer_id, old_weights, new_weights, reward_signal, learning_rate
  ) VALUES (
    dealer_uuid,
    to_jsonb(current_weights),
    new_weights,
    reward_signal,
    learning_rate
  );
  
  RETURN new_weights;
END;
$$ LANGUAGE plpgsql;

-- Function to detect anomalies in review data
CREATE OR REPLACE FUNCTION detect_review_anomalies(dealer_uuid UUID)
RETURNS TABLE (
  anomaly_type TEXT,
  severity TEXT,
  fraud_probability NUMERIC,
  fraudguard_penalty NUMERIC
) AS $$
DECLARE
  avg_velocity NUMERIC;
  current_velocity NUMERIC;
  velocity_std NUMERIC;
  anomaly_score NUMERIC;
BEGIN
  -- Calculate average review velocity over last 8 weeks
  SELECT AVG(daily_reviews), STDDEV(daily_reviews)
  INTO avg_velocity, velocity_std
  FROM (
    SELECT DATE(created_at) as review_date, COUNT(*) as daily_reviews
    FROM reviews 
    WHERE dealer_id = dealer_uuid 
      AND created_at >= CURRENT_DATE - INTERVAL '8 weeks'
    GROUP BY DATE(created_at)
  ) daily_counts;
  
  -- Get current week's velocity
  SELECT COUNT(*)
  INTO current_velocity
  FROM reviews
  WHERE dealer_id = dealer_uuid
    AND created_at >= CURRENT_DATE - INTERVAL '7 days';
  
  -- Calculate anomaly score (simplified)
  IF velocity_std > 0 THEN
    anomaly_score := ABS(current_velocity - avg_velocity) / velocity_std;
  ELSE
    anomaly_score := 0;
  END IF;
  
  -- Determine severity and fraud probability
  IF anomaly_score > 4 THEN
    RETURN QUERY SELECT 
      'velocity_spike'::TEXT,
      'critical'::TEXT,
      0.9::NUMERIC,
      0.1::NUMERIC;
  ELSIF anomaly_score > 3 THEN
    RETURN QUERY SELECT 
      'velocity_spike'::TEXT,
      'high'::TEXT,
      0.7::NUMERIC,
      0.3::NUMERIC;
  ELSIF anomaly_score > 2 THEN
    RETURN QUERY SELECT 
      'velocity_spike'::TEXT,
      'medium'::TEXT,
      0.4::NUMERIC,
      0.6::NUMERIC;
  ELSE
    RETURN QUERY SELECT 
      'normal'::TEXT,
      'low'::TEXT,
      0.1::NUMERIC,
      0.9::NUMERIC;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create indexes for performance
CREATE INDEX idx_aiv_raw_signals_dealer_date ON aiv_raw_signals(dealer_id, date);
CREATE INDEX idx_aiv_raw_signals_date ON aiv_raw_signals(date);
CREATE INDEX idx_model_weights_date ON model_weights(asof_date);
CREATE INDEX idx_model_audit_run_date ON model_audit(run_date);
CREATE INDEX idx_anomaly_detection_dealer ON anomaly_detection(dealer_id);
CREATE INDEX idx_predictive_forecasts_dealer ON predictive_forecasts(dealer_id);

-- Insert initial model weights
INSERT INTO model_weights (asof_date, seo_w, aeo_w, geo_w, ugc_w, geolocal_w, r2, rmse)
VALUES (CURRENT_DATE, 0.25, 0.30, 0.25, 0.10, 0.10, 0.85, 2.5);

COMMENT ON TABLE aiv_raw_signals IS 'Raw signals for AIV computation - ingested from various data sources';
COMMENT ON TABLE model_weights IS 'Evolution of model weights over time through reinforcement learning';
COMMENT ON TABLE model_audit IS 'Audit trail of model performance and training runs';
COMMENT ON TABLE anomaly_detection IS 'Results of fraud and anomaly detection';
COMMENT ON TABLE predictive_forecasts IS 'Stored predictions for future AIV and revenue';
COMMENT ON TABLE reinforcement_history IS 'History of weight updates through reinforcement learning';
