-- DealershipAI ZeroPoint Master v3.0 - Supabase Schema
-- Complete automation and analytics infrastructure

-- DTRI Audit Log Table
CREATE TABLE IF NOT EXISTS dtri_audit_log (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    dealer_id text NOT NULL,
    job_type text NOT NULL,
    results jsonb NOT NULL DEFAULT '{}',
    status text NOT NULL DEFAULT 'completed',
    error text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- NCM Benchmarks Table
CREATE TABLE IF NOT EXISTS ncm_benchmarks (
    metric_id text PRIMARY KEY,
    category text NOT NULL,
    target_value numeric NOT NULL,
    description text,
    source text DEFAULT 'NCM Group 20',
    updated_at timestamptz DEFAULT now(),
    created_at timestamptz DEFAULT now()
);

-- ADA Training Buffer Table
CREATE TABLE IF NOT EXISTS ada_training_buffer (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    source text NOT NULL,
    payload jsonb NOT NULL DEFAULT '{}',
    trained boolean DEFAULT false,
    training_timestamp timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_dtri_audit_log_dealer_id ON dtri_audit_log(dealer_id);
CREATE INDEX IF NOT EXISTS idx_dtri_audit_log_job_type ON dtri_audit_log(job_type);
CREATE INDEX IF NOT EXISTS idx_dtri_audit_log_created_at ON dtri_audit_log(created_at);

CREATE INDEX IF NOT EXISTS idx_ncm_benchmarks_category ON ncm_benchmarks(category);
CREATE INDEX IF NOT EXISTS idx_ncm_benchmarks_updated_at ON ncm_benchmarks(updated_at);

CREATE INDEX IF NOT EXISTS idx_ada_training_buffer_source ON ada_training_buffer(source);
CREATE INDEX IF NOT EXISTS idx_ada_training_buffer_trained ON ada_training_buffer(trained);
CREATE INDEX IF NOT EXISTS idx_ada_training_buffer_created_at ON ada_training_buffer(created_at);

-- Row Level Security (RLS) Policies
ALTER TABLE dtri_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE ncm_benchmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE ada_training_buffer ENABLE ROW LEVEL SECURITY;

-- RLS Policies for dtri_audit_log
CREATE POLICY "Allow read access to dtri_audit_log" ON dtri_audit_log
    FOR SELECT USING (true);

CREATE POLICY "Allow insert access to dtri_audit_log" ON dtri_audit_log
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update access to dtri_audit_log" ON dtri_audit_log
    FOR UPDATE USING (true);

-- RLS Policies for ncm_benchmarks
CREATE POLICY "Allow read access to ncm_benchmarks" ON ncm_benchmarks
    FOR SELECT USING (true);

CREATE POLICY "Allow insert access to ncm_benchmarks" ON ncm_benchmarks
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update access to ncm_benchmarks" ON ncm_benchmarks
    FOR UPDATE USING (true);

-- RLS Policies for ada_training_buffer
CREATE POLICY "Allow read access to ada_training_buffer" ON ada_training_buffer
    FOR SELECT USING (true);

CREATE POLICY "Allow insert access to ada_training_buffer" ON ada_training_buffer
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update access to ada_training_buffer" ON ada_training_buffer
    FOR UPDATE USING (true);

-- Updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_dtri_audit_log_updated_at 
    BEFORE UPDATE ON dtri_audit_log 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ncm_benchmarks_updated_at 
    BEFORE UPDATE ON ncm_benchmarks 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ada_training_buffer_updated_at 
    BEFORE UPDATE ON ada_training_buffer 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample data for testing
INSERT INTO ncm_benchmarks (metric_id, category, target_value, description) VALUES
    ('digital_trust_score', 'performance', 85.0, 'Industry average digital trust score'),
    ('revenue_impact', 'financial', 50000.0, 'Average monthly revenue impact'),
    ('conversion_rate', 'performance', 0.08, 'Target conversion rate'),
    ('customer_satisfaction', 'experience', 0.90, 'Target customer satisfaction score'),
    ('online_presence_score', 'visibility', 80.0, 'Target online presence score'),
    ('ai_visibility_score', 'ai_performance', 85.0, 'Target AI visibility score')
ON CONFLICT (metric_id) DO UPDATE SET
    target_value = EXCLUDED.target_value,
    description = EXCLUDED.description,
    updated_at = now();

-- Comments for documentation
COMMENT ON TABLE dtri_audit_log IS 'Audit trail for all DTRI job executions and results';
COMMENT ON TABLE ncm_benchmarks IS 'NCM Group 20 benchmark metrics for industry comparison';
COMMENT ON TABLE ada_training_buffer IS 'Training data buffer for ADA model updates and synchronization';

COMMENT ON COLUMN dtri_audit_log.dealer_id IS 'Dealer identifier for the job execution';
COMMENT ON COLUMN dtri_audit_log.job_type IS 'Type of job executed (nightly_dtri, ncm_benchmark_sync, etc.)';
COMMENT ON COLUMN dtri_audit_log.results IS 'JSON results from the job execution';

COMMENT ON COLUMN ncm_benchmarks.metric_id IS 'Unique identifier for the benchmark metric';
COMMENT ON COLUMN ncm_benchmarks.category IS 'Category of the metric (performance, financial, etc.)';
COMMENT ON COLUMN ncm_benchmarks.target_value IS 'Target value for the metric';

COMMENT ON COLUMN ada_training_buffer.source IS 'Source of the training data (ncm_benchmarks, etc.)';
COMMENT ON COLUMN ada_training_buffer.payload IS 'Training data payload in JSON format';
COMMENT ON COLUMN ada_training_buffer.trained IS 'Whether this data has been used for training';
