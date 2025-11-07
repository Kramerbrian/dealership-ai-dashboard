-- GPT Interactions Database Schema
-- 
-- Stores all GPT chat interactions, function calls, and feedback for analytics

CREATE TABLE IF NOT EXISTS gpt_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interaction_id VARCHAR(255) UNIQUE NOT NULL,
  user_id VARCHAR(255),
  session_id VARCHAR(255),
  
  -- Query and response
  user_query TEXT NOT NULL,
  bot_response TEXT NOT NULL,
  prompt_version VARCHAR(50) DEFAULT '1.0.0',
  
  -- Function calls
  functions_used JSONB DEFAULT '[]'::jsonb,
  function_results JSONB DEFAULT '[]'::jsonb,
  
  -- Context
  retrieval_context JSONB,
  user_location VARCHAR(255),
  dealership_info JSONB,
  
  -- Outcomes
  outcome VARCHAR(50) NOT NULL, -- 'success', 'fallback', 'error'
  error_details TEXT,
  
  -- Feedback and conversion
  user_feedback VARCHAR(50), -- 'good', 'bad', 'neutral'
  conversion_event JSONB,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  inserted_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_gpt_interactions_user_id ON gpt_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_gpt_interactions_interaction_id ON gpt_interactions(interaction_id);
CREATE INDEX IF NOT EXISTS idx_gpt_interactions_outcome ON gpt_interactions(outcome);
CREATE INDEX IF NOT EXISTS idx_gpt_interactions_inserted_at ON gpt_interactions(inserted_at DESC);
CREATE INDEX IF NOT EXISTS idx_gpt_interactions_conversion ON gpt_interactions((conversion_event->>'type'));

-- Function call details table (for deeper analytics)
CREATE TABLE IF NOT EXISTS gpt_function_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interaction_id VARCHAR(255) NOT NULL REFERENCES gpt_interactions(interaction_id),
  function_name VARCHAR(100) NOT NULL,
  parameters JSONB NOT NULL,
  result JSONB,
  success BOOLEAN DEFAULT true,
  execution_time_ms INTEGER,
  error_message TEXT,
  called_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gpt_function_calls_interaction_id ON gpt_function_calls(interaction_id);
CREATE INDEX IF NOT EXISTS idx_gpt_function_calls_function_name ON gpt_function_calls(function_name);
CREATE INDEX IF NOT EXISTS idx_gpt_function_calls_success ON gpt_function_calls(success);

-- Analytics views
CREATE OR REPLACE VIEW gpt_interaction_analytics AS
SELECT
  DATE(inserted_at) as date,
  COUNT(*) as total_interactions,
  COUNT(*) FILTER (WHERE outcome = 'success') as successful,
  COUNT(*) FILTER (WHERE outcome = 'error') as errors,
  COUNT(*) FILTER (WHERE user_feedback = 'good') as positive_feedback,
  COUNT(*) FILTER (WHERE user_feedback = 'bad') as negative_feedback,
  COUNT(*) FILTER (WHERE conversion_event IS NOT NULL) as conversions,
  AVG(jsonb_array_length(functions_used)) as avg_functions_per_interaction,
  COUNT(DISTINCT user_id) as unique_users
FROM gpt_interactions
GROUP BY DATE(inserted_at);

-- Function performance view
CREATE OR REPLACE VIEW gpt_function_performance AS
SELECT
  function_name,
  COUNT(*) as total_calls,
  COUNT(*) FILTER (WHERE success = true) as successful_calls,
  AVG(execution_time_ms) as avg_execution_time_ms,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY execution_time_ms) as p95_execution_time_ms,
  COUNT(*) FILTER (WHERE error_message IS NOT NULL) as error_count
FROM gpt_function_calls
GROUP BY function_name;

