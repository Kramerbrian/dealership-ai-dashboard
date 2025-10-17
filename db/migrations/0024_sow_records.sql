-- SOW Records table for tracking Statement of Work documents
CREATE TABLE IF NOT EXISTS sow_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sow_id TEXT UNIQUE NOT NULL,
  dealer_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  title TEXT NOT NULL,
  owner TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  predicted_roi_usd NUMERIC,
  cost_of_effort_usd NUMERIC DEFAULT 2000,
  net_impact_usd NUMERIC,
  expected_dtri_uplift NUMERIC,
  actual_roi_usd NUMERIC,
  roi_accuracy NUMERIC,
  description TEXT,
  status TEXT DEFAULT 'Pending Confirmation',
  notes TEXT,
  pdf_binary TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_sow_records_dealer_id ON sow_records(dealer_id);
CREATE INDEX IF NOT EXISTS idx_sow_records_status ON sow_records(status);
CREATE INDEX IF NOT EXISTS idx_sow_records_created_at ON sow_records(created_at);
CREATE INDEX IF NOT EXISTS idx_sow_records_due_date ON sow_records(due_date);
CREATE INDEX IF NOT EXISTS idx_sow_records_event_type ON sow_records(event_type);

-- RLS policies
ALTER TABLE sow_records ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users to read their own SOWs
CREATE POLICY "Users can view their own SOWs" ON sow_records
  FOR SELECT USING (auth.uid()::text = dealer_id);

-- Policy for service role to manage all SOWs
CREATE POLICY "Service role can manage all SOWs" ON sow_records
  FOR ALL USING (auth.role() = 'service_role');

-- Comments for documentation
COMMENT ON TABLE sow_records IS 'Statement of Work records for MAXIMUS system';
COMMENT ON COLUMN sow_records.sow_id IS 'Unique identifier for the SOW document';
COMMENT ON COLUMN sow_records.dealer_id IS 'Dealer identifier';
COMMENT ON COLUMN sow_records.event_type IS 'Type of event that triggered the SOW';
COMMENT ON COLUMN sow_records.predicted_roi_usd IS 'Predicted return on investment in USD';
COMMENT ON COLUMN sow_records.actual_roi_usd IS 'Actual return on investment in USD';
COMMENT ON COLUMN sow_records.roi_accuracy IS 'Accuracy of prediction as percentage';
COMMENT ON COLUMN sow_records.status IS 'Current status of the SOW';
COMMENT ON COLUMN sow_records.pdf_binary IS 'Base64 encoded PDF document';
