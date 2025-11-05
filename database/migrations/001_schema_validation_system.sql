-- Schema validation failure tracking
CREATE TABLE IF NOT EXISTS validation_failures (
  id SERIAL PRIMARY KEY,
  event_type TEXT NOT NULL,
  dealer_id TEXT,
  schema_type TEXT,
  reason TEXT,
  occurred_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_validation_failures_dealer ON validation_failures(dealer_id, occurred_at);
CREATE INDEX idx_validation_failures_schema ON validation_failures(schema_type, occurred_at);

-- Failure clusters for adaptive remediation
CREATE TABLE IF NOT EXISTS schema_failure_clusters (
  id SERIAL PRIMARY KEY,
  schema_type TEXT NOT NULL,
  dealer_id TEXT NOT NULL,
  failure_count INT,
  last_seen TIMESTAMP DEFAULT NOW(),
  status TEXT DEFAULT 'pending',
  UNIQUE(schema_type, dealer_id)
);

CREATE INDEX idx_clusters_status ON schema_failure_clusters(status, last_seen);

-- Remediation rewards for RL training
CREATE TABLE IF NOT EXISTS remediation_rewards (
  id SERIAL PRIMARY KEY,
  schema_type TEXT,
  dealer_id TEXT,
  before_confidence FLOAT,
  after_confidence FLOAT,
  reward FLOAT,
  arr_gain_usd FLOAT,
  ati_delta FLOAT,
  aiv_delta FLOAT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_rewards_schema ON remediation_rewards(schema_type, created_at);
CREATE INDEX idx_rewards_created ON remediation_rewards(created_at DESC);

-- Decision explanations for explainability
CREATE TABLE IF NOT EXISTS decision_explanations (
  id SERIAL PRIMARY KEY,
  dealer_id TEXT,
  schema_type TEXT,
  decision_time TIMESTAMP DEFAULT NOW(),
  score FLOAT,
  weight_arr FLOAT,
  weight_ati FLOAT,
  weight_aiv FLOAT,
  feature_importance JSONB,
  expected_outcomes JSONB,
  narrative TEXT
);

CREATE INDEX idx_explanations_dealer ON decision_explanations(dealer_id, decision_time DESC);
CREATE INDEX idx_explanations_time ON decision_explanations(decision_time DESC);

