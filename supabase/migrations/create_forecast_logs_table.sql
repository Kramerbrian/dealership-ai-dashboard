-- Create forecast_logs table for storing forecast predictions
-- This enables historical tracking and accuracy analysis

CREATE TABLE IF NOT EXISTS forecast_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ NOT NULL,
  dealers TEXT[] NOT NULL,
  forecast JSONB NOT NULL,
  ci TEXT,
  leads_forecast INTEGER,
  revenue_forecast INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for efficient querying by timestamp
CREATE INDEX IF NOT EXISTS idx_forecast_logs_timestamp ON forecast_logs(timestamp DESC);

-- Create index for JSONB forecast queries
CREATE INDEX IF NOT EXISTS idx_forecast_logs_forecast ON forecast_logs USING GIN(forecast);

-- Add comment for documentation
COMMENT ON TABLE forecast_logs IS 'Stores adaptive forecast predictions for accuracy tracking and trend analysis';
COMMENT ON COLUMN forecast_logs.dealers IS 'Array of dealer names included in this forecast';
COMMENT ON COLUMN forecast_logs.forecast IS 'JSONB object containing forecasted KPI values (AIV, ATI, CVI, ORI, GRI, DPI)';
COMMENT ON COLUMN forecast_logs.ci IS 'Confidence interval as a string (e.g., "2.1")';

