-- Elasticity Tables for Predictive Engine
-- DealershipAI - DTRI Forecast, Elasticity Coefficients, Revenue Predictions
-- Migration: 0016_elasticity_tables.sql

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Elasticity coefficients table
CREATE TABLE IF NOT EXISTS elasticity_coefficients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vertical text NOT NULL,
  elasticity numeric NOT NULL,
  timestamp timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 90-day DTRI forecast table
CREATE TABLE IF NOT EXISTS dtri_forecast (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vertical text NOT NULL,
  forecast_date timestamptz NOT NULL,
  yhat numeric NOT NULL,
  yhat_lower numeric NOT NULL,
  yhat_upper numeric NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Revenue predictions table
CREATE TABLE IF NOT EXISTS revenue_predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vertical text NOT NULL,
  predicted_revenue numeric NOT NULL,
  feature_weights jsonb,
  timestamp timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_elasticity_coefficients_vertical ON elasticity_coefficients(vertical);
CREATE INDEX IF NOT EXISTS idx_elasticity_coefficients_timestamp ON elasticity_coefficients(timestamp);
CREATE INDEX IF NOT EXISTS idx_elasticity_coefficients_vertical_timestamp ON elasticity_coefficients(vertical, timestamp);

CREATE INDEX IF NOT EXISTS idx_dtri_forecast_vertical ON dtri_forecast(vertical);
CREATE INDEX IF NOT EXISTS idx_dtri_forecast_date ON dtri_forecast(forecast_date);
CREATE INDEX IF NOT EXISTS idx_dtri_forecast_vertical_date ON dtri_forecast(vertical, forecast_date);
CREATE INDEX IF NOT EXISTS idx_dtri_forecast_created_at ON dtri_forecast(created_at);

CREATE INDEX IF NOT EXISTS idx_revenue_predictions_vertical ON revenue_predictions(vertical);
CREATE INDEX IF NOT EXISTS idx_revenue_predictions_timestamp ON revenue_predictions(timestamp);
CREATE INDEX IF NOT EXISTS idx_revenue_predictions_vertical_timestamp ON revenue_predictions(vertical, timestamp);

-- Row Level Security (RLS)
ALTER TABLE elasticity_coefficients ENABLE ROW LEVEL SECURITY;
ALTER TABLE dtri_forecast ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_predictions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for elasticity_coefficients
DO $$ BEGIN
  CREATE POLICY elasticity_coefficients_select ON elasticity_coefficients
    FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY elasticity_coefficients_insert ON elasticity_coefficients
    FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- RLS Policies for dtri_forecast
DO $$ BEGIN
  CREATE POLICY dtri_forecast_select ON dtri_forecast
    FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY dtri_forecast_insert ON dtri_forecast
    FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- RLS Policies for revenue_predictions
DO $$ BEGIN
  CREATE POLICY revenue_predictions_select ON revenue_predictions
    FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY revenue_predictions_insert ON revenue_predictions
    FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Utility Functions

-- Function to get latest elasticity coefficient for a vertical
CREATE OR REPLACE FUNCTION get_latest_elasticity(p_vertical text)
RETURNS TABLE (
  vertical text,
  elasticity numeric,
  timestamp timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT ec.vertical, ec.elasticity, ec.timestamp
  FROM elasticity_coefficients ec
  WHERE ec.vertical = p_vertical
  ORDER BY ec.timestamp DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Function to get latest forecast for a vertical
CREATE OR REPLACE FUNCTION get_latest_forecast(p_vertical text, p_days integer DEFAULT 30)
RETURNS TABLE (
  vertical text,
  forecast_date timestamptz,
  yhat numeric,
  yhat_lower numeric,
  yhat_upper numeric,
  created_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT df.vertical, df.forecast_date, df.yhat, df.yhat_lower, df.yhat_upper, df.created_at
  FROM dtri_forecast df
  WHERE df.vertical = p_vertical
    AND df.forecast_date >= now() - (p_days || ' days')::interval
  ORDER BY df.forecast_date ASC;
END;
$$ LANGUAGE plpgsql;

-- Function to get latest revenue prediction for a vertical
CREATE OR REPLACE FUNCTION get_latest_revenue_prediction(p_vertical text)
RETURNS TABLE (
  vertical text,
  predicted_revenue numeric,
  feature_weights jsonb,
  timestamp timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT rp.vertical, rp.predicted_revenue, rp.feature_weights, rp.timestamp
  FROM revenue_predictions rp
  WHERE rp.vertical = p_vertical
  ORDER BY rp.timestamp DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up old forecasts (keep last 90 days)
CREATE OR REPLACE FUNCTION cleanup_old_forecasts()
RETURNS integer AS $$
DECLARE
  deleted_count integer := 0;
BEGIN
  DELETE FROM dtri_forecast 
  WHERE created_at < now() - interval '90 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Sample data for testing (optional)
INSERT INTO elasticity_coefficients (vertical, elasticity) VALUES
  ('sales', 0.42),
  ('acquisition', 0.38),
  ('service', 0.35),
  ('parts', 0.41)
ON CONFLICT DO NOTHING;

-- Comments for documentation
COMMENT ON TABLE elasticity_coefficients IS 'Trust-to-revenue elasticity coefficients by vertical';
COMMENT ON TABLE dtri_forecast IS '90-day DTRI forecasts with confidence intervals';
COMMENT ON TABLE revenue_predictions IS 'Revenue predictions with feature importance weights';

COMMENT ON COLUMN elasticity_coefficients.elasticity IS 'Trust-to-revenue elasticity coefficient (0-1)';
COMMENT ON COLUMN dtri_forecast.yhat IS 'Predicted DTRI score';
COMMENT ON COLUMN dtri_forecast.yhat_lower IS 'Lower confidence bound';
COMMENT ON COLUMN dtri_forecast.yhat_upper IS 'Upper confidence bound';
COMMENT ON COLUMN revenue_predictions.feature_weights IS 'JSON object with feature importance scores';
