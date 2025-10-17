-- Answer Engine Training & Scoring Schema
-- This schema supports the dAI training loop with feature store, labels, and β-calibration

-- Answer Engine Runs table
CREATE TABLE IF NOT EXISTS ae_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  engine TEXT NOT NULL CHECK (engine IN ('chatgpt', 'claude', 'gemini', 'perplexity', 'copilot', 'grok')),
  model TEXT NOT NULL,
  prompt_id TEXT NOT NULL,
  response_json JSONB NOT NULL,
  links_json JSONB DEFAULT '[]',
  friction_turns INTEGER DEFAULT 0,
  hallucination_flags JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Answer Engine Scores table
CREATE TABLE IF NOT EXISTS ae_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID REFERENCES ae_runs(id) ON DELETE CASCADE,
  citation_share NUMERIC(5,2) CHECK (citation_share >= 0 AND citation_share <= 100),
  summary_acc NUMERIC(5,2) CHECK (summary_acc >= 0 AND summary_acc <= 100),
  inventory_fidelity NUMERIC(5,2) CHECK (inventory_fidelity >= 0 AND inventory_fidelity <= 100),
  offer_integrity NUMERIC(5,2) CHECK (offer_integrity >= 0 AND offer_integrity <= 100),
  trust_signals NUMERIC(5,2) CHECK (trust_signals >= 0 AND trust_signals <= 100),
  friction_tax NUMERIC(5,2) CHECK (friction_tax >= 0 AND friction_tax <= 100),
  engine_score NUMERIC(5,2) CHECK (engine_score >= 0 AND engine_score <= 100),
  aiv_pct NUMERIC(5,2) CHECK (aiv_pct >= 0 AND aiv_pct <= 100),
  ati_pct NUMERIC(5,2) CHECK (ati_pct >= 0 AND ati_pct <= 100),
  tsis_pct NUMERIC(5,2) CHECK (tsis_pct >= 0 AND tsis_pct <= 100),
  vli_pct NUMERIC(5,2) CHECK (vli_pct >= 0 AND vli_pct <= 100),
  zero_click_pct NUMERIC(5,2) CHECK (zero_click_pct >= 0 AND zero_click_pct <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Parity Events table (pricing/mismatch tracking)
CREATE TABLE IF NOT EXISTS parity_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  vin TEXT,
  source TEXT NOT NULL,
  field TEXT NOT NULL,
  site_value TEXT,
  engine_value TEXT,
  delta NUMERIC(10,2),
  severity INTEGER DEFAULT 1 CHECK (severity >= 1 AND severity <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Outcome Labels table (supervised learning targets)
CREATE TABLE IF NOT EXISTS outcome_labels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID REFERENCES ae_runs(id) ON DELETE CASCADE,
  task_success BOOLEAN,
  parity_success BOOLEAN,
  leads INTEGER DEFAULT 0,
  sales INTEGER DEFAULT 0,
  revenue_usd NUMERIC(12,2) DEFAULT 0,
  window TEXT CHECK (window IN ('7d', '28d', '90d')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Entity Graph table (knowledge graph entities)
CREATE TABLE IF NOT EXISTS entity_graph (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('Vehicle', 'GBP', 'Page', 'Schema', 'OEM', 'Review')),
  entity_id TEXT NOT NULL,
  properties JSONB NOT NULL DEFAULT '{}',
  relationships JSONB DEFAULT '[]',
  confidence NUMERIC(3,2) DEFAULT 0.9 CHECK (confidence >= 0 AND confidence <= 1),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fee Disclosure Audits table
CREATE TABLE IF NOT EXISTS fee_disclosure_audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  vin TEXT,
  label TEXT NOT NULL,
  site_fees JSONB DEFAULT '[]',
  engine_fees JSONB DEFAULT '[]',
  compliance_score NUMERIC(5,2) CHECK (compliance_score >= 0 AND compliance_score <= 100),
  violations JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Hours Reliability table
CREATE TABLE IF NOT EXISTS hours_reliability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  place_id TEXT NOT NULL,
  gbp_hours JSONB,
  engine_hours JSONB,
  match_rate NUMERIC(5,2) CHECK (match_rate >= 0 AND match_rate <= 1),
  staleness_days INTEGER DEFAULT 0,
  variance_score NUMERIC(5,2) DEFAULT 0,
  last_checked TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Consensus Events table (multi-engine agreement tracking)
CREATE TABLE IF NOT EXISTS consensus_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  query_hash TEXT NOT NULL,
  engines JSONB NOT NULL DEFAULT '[]',
  agreement_rate NUMERIC(5,2) CHECK (agreement_rate >= 0 AND agreement_rate <= 1),
  disagreement_fields JSONB DEFAULT '[]',
  consensus_score NUMERIC(5,2) CHECK (consensus_score >= 0 AND consensus_score <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Uplift Attribution table
CREATE TABLE IF NOT EXISTS uplift_attribution (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  metric_type TEXT NOT NULL CHECK (metric_type IN ('AIV', 'ATI', 'VLI', 'TSIS')),
  baseline_value NUMERIC(10,2),
  uplift_value NUMERIC(10,2),
  revenue_impact NUMERIC(12,2),
  elasticity_usd_per_point NUMERIC(10,2),
  attribution_window TEXT CHECK (attribution_window IN ('7d', '28d', '90d')),
  confidence_interval JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Model Weights table (β-calibration storage)
CREATE TABLE IF NOT EXISTS model_weights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID,
  model_version TEXT NOT NULL,
  metric_type TEXT NOT NULL,
  global_weights JSONB NOT NULL,
  tenant_deltas JSONB DEFAULT '{}',
  calibration_date TIMESTAMPTZ DEFAULT NOW(),
  validation_score NUMERIC(5,2),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ae_runs_tenant_engine ON ae_runs(tenant_id, engine);
CREATE INDEX IF NOT EXISTS idx_ae_runs_created_at ON ae_runs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ae_runs_prompt_id ON ae_runs(prompt_id);

CREATE INDEX IF NOT EXISTS idx_ae_scores_run_id ON ae_scores(run_id);
CREATE INDEX IF NOT EXISTS idx_ae_scores_engine_score ON ae_scores(engine_score DESC);

CREATE INDEX IF NOT EXISTS idx_parity_events_tenant_id ON parity_events(tenant_id);
CREATE INDEX IF NOT EXISTS idx_parity_events_vin ON parity_events(vin);
CREATE INDEX IF NOT EXISTS idx_parity_events_severity ON parity_events(severity);
CREATE INDEX IF NOT EXISTS idx_parity_events_created_at ON parity_events(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_outcome_labels_run_id ON outcome_labels(run_id);
CREATE INDEX IF NOT EXISTS idx_outcome_labels_window ON outcome_labels(window);
CREATE INDEX IF NOT EXISTS idx_outcome_labels_task_success ON outcome_labels(task_success);

CREATE INDEX IF NOT EXISTS idx_entity_graph_tenant_type ON entity_graph(tenant_id, entity_type);
CREATE INDEX IF NOT EXISTS idx_entity_graph_entity_id ON entity_graph(entity_id);
CREATE INDEX IF NOT EXISTS idx_entity_graph_confidence ON entity_graph(confidence DESC);

CREATE INDEX IF NOT EXISTS idx_fee_disclosure_tenant_id ON fee_disclosure_audits(tenant_id);
CREATE INDEX IF NOT EXISTS idx_fee_disclosure_vin ON fee_disclosure_audits(vin);
CREATE INDEX IF NOT EXISTS idx_fee_disclosure_compliance ON fee_disclosure_audits(compliance_score);

CREATE INDEX IF NOT EXISTS idx_hours_reliability_tenant_place ON hours_reliability(tenant_id, place_id);
CREATE INDEX IF NOT EXISTS idx_hours_reliability_match_rate ON hours_reliability(match_rate);
CREATE INDEX IF NOT EXISTS idx_hours_reliability_last_checked ON hours_reliability(last_checked DESC);

CREATE INDEX IF NOT EXISTS idx_consensus_events_tenant_id ON consensus_events(tenant_id);
CREATE INDEX IF NOT EXISTS idx_consensus_events_agreement_rate ON consensus_events(agreement_rate);
CREATE INDEX IF NOT EXISTS idx_consensus_events_created_at ON consensus_events(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_uplift_attribution_tenant_metric ON uplift_attribution(tenant_id, metric_type);
CREATE INDEX IF NOT EXISTS idx_uplift_attribution_window ON uplift_attribution(attribution_window);
CREATE INDEX IF NOT EXISTS idx_uplift_attribution_created_at ON uplift_attribution(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_model_weights_tenant_metric ON model_weights(tenant_id, metric_type);
CREATE INDEX IF NOT EXISTS idx_model_weights_active ON model_weights(is_active);
CREATE INDEX IF NOT EXISTS idx_model_weights_calibration_date ON model_weights(calibration_date DESC);

-- RLS Policies
ALTER TABLE ae_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ae_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE parity_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE outcome_labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE entity_graph ENABLE ROW LEVEL SECURITY;
ALTER TABLE fee_disclosure_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE hours_reliability ENABLE ROW LEVEL SECURITY;
ALTER TABLE consensus_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE uplift_attribution ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_weights ENABLE ROW LEVEL SECURITY;

-- AE Runs policies
CREATE POLICY "Users can view their own ae_runs" ON ae_runs
  FOR SELECT USING (tenant_id = current_setting('app.current_tenant_id', true));

CREATE POLICY "Users can insert their own ae_runs" ON ae_runs
  FOR INSERT WITH CHECK (tenant_id = current_setting('app.current_tenant_id', true));

-- AE Scores policies
CREATE POLICY "Users can view their own ae_scores" ON ae_scores
  FOR SELECT USING (
    run_id IN (
      SELECT id FROM ae_runs 
      WHERE tenant_id = current_setting('app.current_tenant_id', true)
    )
  );

CREATE POLICY "Users can insert their own ae_scores" ON ae_scores
  FOR INSERT WITH CHECK (
    run_id IN (
      SELECT id FROM ae_runs 
      WHERE tenant_id = current_setting('app.current_tenant_id', true)
    )
  );

-- Parity Events policies
CREATE POLICY "Users can view their own parity_events" ON parity_events
  FOR SELECT USING (tenant_id = current_setting('app.current_tenant_id', true));

CREATE POLICY "Users can insert their own parity_events" ON parity_events
  FOR INSERT WITH CHECK (tenant_id = current_setting('app.current_tenant_id', true));

-- Outcome Labels policies
CREATE POLICY "Users can view their own outcome_labels" ON outcome_labels
  FOR SELECT USING (
    run_id IN (
      SELECT id FROM ae_runs 
      WHERE tenant_id = current_setting('app.current_tenant_id', true)
    )
  );

CREATE POLICY "Users can insert their own outcome_labels" ON outcome_labels
  FOR INSERT WITH CHECK (
    run_id IN (
      SELECT id FROM ae_runs 
      WHERE tenant_id = current_setting('app.current_tenant_id', true)
    )
  );

-- Entity Graph policies
CREATE POLICY "Users can view their own entity_graph" ON entity_graph
  FOR SELECT USING (tenant_id = current_setting('app.current_tenant_id', true));

CREATE POLICY "Users can insert their own entity_graph" ON entity_graph
  FOR INSERT WITH CHECK (tenant_id = current_setting('app.current_tenant_id', true));

CREATE POLICY "Users can update their own entity_graph" ON entity_graph
  FOR UPDATE USING (tenant_id = current_setting('app.current_tenant_id', true));

-- Fee Disclosure Audits policies
CREATE POLICY "Users can view their own fee_disclosure_audits" ON fee_disclosure_audits
  FOR SELECT USING (tenant_id = current_setting('app.current_tenant_id', true));

CREATE POLICY "Users can insert their own fee_disclosure_audits" ON fee_disclosure_audits
  FOR INSERT WITH CHECK (tenant_id = current_setting('app.current_tenant_id', true));

-- Hours Reliability policies
CREATE POLICY "Users can view their own hours_reliability" ON hours_reliability
  FOR SELECT USING (tenant_id = current_setting('app.current_tenant_id', true));

CREATE POLICY "Users can insert their own hours_reliability" ON hours_reliability
  FOR INSERT WITH CHECK (tenant_id = current_setting('app.current_tenant_id', true));

CREATE POLICY "Users can update their own hours_reliability" ON hours_reliability
  FOR UPDATE USING (tenant_id = current_setting('app.current_tenant_id', true));

-- Consensus Events policies
CREATE POLICY "Users can view their own consensus_events" ON consensus_events
  FOR SELECT USING (tenant_id = current_setting('app.current_tenant_id', true));

CREATE POLICY "Users can insert their own consensus_events" ON consensus_events
  FOR INSERT WITH CHECK (tenant_id = current_setting('app.current_tenant_id', true));

-- Uplift Attribution policies
CREATE POLICY "Users can view their own uplift_attribution" ON uplift_attribution
  FOR SELECT USING (tenant_id = current_setting('app.current_tenant_id', true));

CREATE POLICY "Users can insert their own uplift_attribution" ON uplift_attribution
  FOR INSERT WITH CHECK (tenant_id = current_setting('app.current_tenant_id', true));

-- Model Weights policies
CREATE POLICY "Users can view their own model_weights" ON model_weights
  FOR SELECT USING (tenant_id = current_setting('app.current_tenant_id', true) OR tenant_id IS NULL);

CREATE POLICY "Users can insert their own model_weights" ON model_weights
  FOR INSERT WITH CHECK (tenant_id = current_setting('app.current_tenant_id', true) OR tenant_id IS NULL);

-- Functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_entity_graph_updated_at BEFORE UPDATE ON entity_graph
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Views for analytics
CREATE OR REPLACE VIEW ae_performance_summary AS
SELECT 
  ar.tenant_id,
  ar.engine,
  COUNT(*) as total_runs,
  AVG(COALESCE(asc.engine_score, 0)) as avg_engine_score,
  AVG(COALESCE(asc.aiv_pct, 0)) as avg_aiv_pct,
  AVG(COALESCE(asc.ati_pct, 0)) as avg_ati_pct,
  AVG(COALESCE(asc.tsis_pct, 0)) as avg_tsis_pct,
  AVG(COALESCE(asc.vli_pct, 0)) as avg_vli_pct,
  AVG(COALESCE(asc.zero_click_pct, 0)) as avg_zero_click_pct,
  COUNT(ol.id) as labeled_outcomes,
  AVG(CASE WHEN ol.task_success THEN 1 ELSE 0 END) as task_success_rate,
  AVG(CASE WHEN ol.parity_success THEN 1 ELSE 0 END) as parity_success_rate,
  SUM(COALESCE(ol.revenue_usd, 0)) as total_revenue_attributed,
  MAX(ar.created_at) as last_run
FROM ae_runs ar
LEFT JOIN ae_scores asc ON ar.id = asc.run_id
LEFT JOIN outcome_labels ol ON ar.id = ol.run_id
GROUP BY ar.tenant_id, ar.engine;

CREATE OR REPLACE VIEW parity_issues_summary AS
SELECT 
  tenant_id,
  field,
  COUNT(*) as total_issues,
  AVG(severity) as avg_severity,
  COUNT(*) FILTER (WHERE severity >= 3) as high_severity_count,
  AVG(ABS(delta)) as avg_delta,
  MAX(created_at) as last_issue
FROM parity_events
GROUP BY tenant_id, field;

CREATE OR REPLACE VIEW consensus_health_summary AS
SELECT 
  tenant_id,
  COUNT(*) as total_queries,
  AVG(agreement_rate) as avg_agreement_rate,
  AVG(consensus_score) as avg_consensus_score,
  COUNT(*) FILTER (WHERE agreement_rate < 0.7) as low_agreement_count,
  MAX(created_at) as last_consensus_check
FROM consensus_events
GROUP BY tenant_id;
