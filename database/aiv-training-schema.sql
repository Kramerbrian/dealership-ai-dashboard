-- AIV Model Training and Optimization Schema
-- This schema supports self-improving AI models with feedback loops

-- 1. Training signals - Raw data for model training
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
  observed_rar NUMERIC(5,2), -- Revenue Attribution Rate
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Indexes for performance
  INDEX idx_dealer_date ON aiv_raw_signals(dealer_id, date),
  INDEX idx_date_signals ON aiv_raw_signals(date)
);

-- 2. Model weights - Learned parameters from training
CREATE TABLE model_weights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asof_date DATE DEFAULT CURRENT_DATE,
  model_version VARCHAR(50) DEFAULT 'v1.0',
  seo_w NUMERIC(8,6),
  aeo_w NUMERIC(8,6), 
  geo_w NUMERIC(8,6),
  ugc_w NUMERIC(8,6),
  geolocal_w NUMERIC(8,6),
  intercept NUMERIC(8,6),
  r2 NUMERIC(5,4),
  rmse NUMERIC(8,4),
  mape NUMERIC(5,2), -- Mean Absolute Percentage Error
  training_samples INTEGER,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure one weight set per date
  UNIQUE(asof_date, model_version)
);

-- 3. Model audit - Performance tracking and feedback loop
CREATE TABLE model_audit (
  run_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_date TIMESTAMPTZ DEFAULT NOW(),
  model_version VARCHAR(50),
  rmse NUMERIC(8,4),
  mape NUMERIC(5,2),
  r2 NUMERIC(5,4),
  delta_accuracy NUMERIC(5,2), -- Improvement over previous model
  delta_roi NUMERIC(8,2), -- ROI improvement
  training_time_seconds INTEGER,
  validation_samples INTEGER,
  notes TEXT,
  
  -- Indexes for performance analysis
  INDEX idx_audit_date ON model_audit(run_date),
  INDEX idx_audit_version ON model_audit(model_version)
);

-- 4. Prompt optimization logs - Track AI prompt performance
CREATE TABLE prompt_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id TEXT NOT NULL,
  run_date TIMESTAMPTZ DEFAULT NOW(),
  variant TEXT,
  model_used VARCHAR(50), -- gpt-4, claude-3, etc.
  hallucination_rate NUMERIC(5,4),
  factual_precision NUMERIC(5,4),
  response_variance NUMERIC(5,4),
  tokens_used INTEGER,
  cost_usd NUMERIC(10,6),
  response_time_ms INTEGER,
  
  -- Indexes for prompt analysis
  INDEX idx_prompt_id ON prompt_runs(prompt_id),
  INDEX idx_prompt_date ON prompt_runs(run_date)
);

-- 5. Model predictions - Store predictions for validation
CREATE TABLE model_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id UUID NOT NULL,
  prediction_date DATE NOT NULL,
  model_version VARCHAR(50),
  predicted_aiv NUMERIC(5,2),
  predicted_rar NUMERIC(5,2),
  confidence_interval_lower NUMERIC(5,2),
  confidence_interval_upper NUMERIC(5,2),
  actual_aiv NUMERIC(5,2), -- Filled in later for validation
  actual_rar NUMERIC(5,2),
  prediction_error NUMERIC(5,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Indexes for validation analysis
  INDEX idx_pred_dealer_date ON model_predictions(dealer_id, prediction_date),
  INDEX idx_pred_model ON model_predictions(model_version)
);

-- 6. Feature importance tracking
CREATE TABLE feature_importance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_version VARCHAR(50),
  feature_name VARCHAR(50),
  importance_score NUMERIC(8,6),
  shap_value NUMERIC(8,6),
  permutation_importance NUMERIC(8,6),
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(model_version, feature_name)
);

-- Views for analysis

-- Model performance summary
CREATE VIEW model_performance_summary AS
SELECT
  DATE_TRUNC('month', run_date) AS month,
  model_version,
  AVG(r2) AS mean_r2,
  AVG(rmse) AS mean_rmse,
  AVG(mape) AS mean_mape,
  AVG(delta_accuracy) AS mean_accuracy_gain,
  AVG(delta_roi) AS mean_roi_gain,
  COUNT(*) AS audit_runs
FROM model_audit
GROUP BY 1, 2
ORDER BY month DESC, model_version;

-- Training data quality metrics
CREATE VIEW training_data_quality AS
SELECT
  DATE_TRUNC('week', date) AS week,
  COUNT(*) AS signal_count,
  COUNT(DISTINCT dealer_id) AS unique_dealers,
  AVG(observed_aiv) AS mean_aiv,
  STDDEV(observed_aiv) AS aiv_stddev,
  AVG(observed_rar) AS mean_rar,
  COUNT(CASE WHEN observed_aiv IS NULL THEN 1 END) AS missing_aiv,
  COUNT(CASE WHEN observed_rar IS NULL THEN 1 END) AS missing_rar
FROM aiv_raw_signals
GROUP BY 1
ORDER BY week DESC;

-- Feature importance trends
CREATE VIEW feature_importance_trends AS
SELECT
  feature_name,
  model_version,
  importance_score,
  shap_value,
  calculated_at,
  LAG(importance_score) OVER (PARTITION BY feature_name ORDER BY calculated_at) AS prev_importance,
  importance_score - LAG(importance_score) OVER (PARTITION BY feature_name ORDER BY calculated_at) AS importance_delta
FROM feature_importance
ORDER BY feature_name, calculated_at DESC;

-- Prompt performance analysis
CREATE VIEW prompt_performance_analysis AS
SELECT
  prompt_id,
  variant,
  model_used,
  DATE_TRUNC('day', run_date) AS day,
  AVG(hallucination_rate) AS avg_hallucination_rate,
  AVG(factual_precision) AS avg_factual_precision,
  AVG(response_variance) AS avg_response_variance,
  AVG(cost_usd) AS avg_cost,
  AVG(response_time_ms) AS avg_response_time,
  COUNT(*) AS run_count
FROM prompt_runs
GROUP BY 1, 2, 3, 4
ORDER BY day DESC, prompt_id;

-- Model validation accuracy
CREATE VIEW model_validation_accuracy AS
SELECT
  model_version,
  AVG(ABS(prediction_error)) AS mean_absolute_error,
  STDDEV(prediction_error) AS error_stddev,
  COUNT(*) AS validation_samples,
  AVG(CASE WHEN ABS(prediction_error) <= 5 THEN 1.0 ELSE 0.0 END) AS accuracy_within_5_points,
  AVG(CASE WHEN ABS(prediction_error) <= 10 THEN 1.0 ELSE 0.0 END) AS accuracy_within_10_points
FROM model_predictions
WHERE actual_aiv IS NOT NULL
GROUP BY model_version
ORDER BY mean_absolute_error;

-- Row Level Security (RLS) policies
ALTER TABLE aiv_raw_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_weights ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_importance ENABLE ROW LEVEL SECURITY;

-- RLS policies (adjust based on your auth system)
CREATE POLICY "Users can view their dealer data" ON aiv_raw_signals
  FOR SELECT USING (dealer_id IN (
    SELECT dealer_id FROM user_dealer_access WHERE user_id = auth.uid()
  ));

CREATE POLICY "Admins can manage model weights" ON model_weights
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Sample data for testing
INSERT INTO model_weights (asof_date, model_version, seo_w, aeo_w, geo_w, ugc_w, geolocal_w, intercept, r2, rmse, mape, training_samples) VALUES
(CURRENT_DATE, 'v1.0', 0.35, 0.28, 0.22, 0.10, 0.05, 12.5, 0.847, 3.2, 4.1, 1250),
(CURRENT_DATE - INTERVAL '1 day', 'v0.9', 0.32, 0.30, 0.20, 0.12, 0.06, 13.1, 0.823, 3.8, 4.9, 1100);

INSERT INTO feature_importance (model_version, feature_name, importance_score, shap_value, permutation_importance) VALUES
('v1.0', 'seo', 0.35, 0.38, 0.33),
('v1.0', 'aeo', 0.28, 0.31, 0.26),
('v1.0', 'geo', 0.22, 0.25, 0.20),
('v1.0', 'ugc', 0.10, 0.08, 0.12),
('v1.0', 'geolocal', 0.05, 0.03, 0.07);
