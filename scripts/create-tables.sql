-- Integration Tables for DealershipAI
-- Run this SQL in your Supabase SQL editor or via psql

-- Telemetry Events Table
CREATE TABLE IF NOT EXISTS telemetry_events (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  event_type TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  user_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  session_id TEXT,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_telemetry_tenant ON telemetry_events(tenant_id);
CREATE INDEX IF NOT EXISTS idx_telemetry_type ON telemetry_events(event_type);
CREATE INDEX IF NOT EXISTS idx_telemetry_timestamp ON telemetry_events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_telemetry_tenant_type ON telemetry_events(tenant_id, event_type);

-- Schema Fixes Table
CREATE TABLE IF NOT EXISTS schema_fixes (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  tenant_id TEXT NOT NULL,
  url TEXT NOT NULL,
  field TEXT NOT NULL,
  value TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  fixed_at TIMESTAMPTZ,
  job_id TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_schema_fixes_tenant ON schema_fixes(tenant_id);
CREATE INDEX IF NOT EXISTS idx_schema_fixes_status ON schema_fixes(status);
CREATE INDEX IF NOT EXISTS idx_schema_fixes_job ON schema_fixes(job_id);

-- Reprobe Jobs Table
CREATE TABLE IF NOT EXISTS reprobe_jobs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  tenant_id TEXT NOT NULL,
  scope TEXT NOT NULL CHECK (scope IN ('schema', 'cwv', 'crawl', 'all')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  completed_at TIMESTAMPTZ,
  job_id TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reprobe_tenant ON reprobe_jobs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_reprobe_status ON reprobe_jobs(status);
CREATE INDEX IF NOT EXISTS idx_reprobe_job ON reprobe_jobs(job_id);

-- Crawl Jobs Table
CREATE TABLE IF NOT EXISTS crawl_jobs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  tenant_id TEXT NOT NULL,
  urls JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  completed_at TIMESTAMPTZ,
  job_id TEXT,
  error_message TEXT,
  urls_crawled INTEGER DEFAULT 0,
  urls_failed INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crawl_tenant ON crawl_jobs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_crawl_status ON crawl_jobs(status);
CREATE INDEX IF NOT EXISTS idx_crawl_job ON crawl_jobs(job_id);

-- RLS Policies (if using Supabase RLS)
-- Enable RLS
ALTER TABLE telemetry_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE schema_fixes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reprobe_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE crawl_jobs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their tenant's data
CREATE POLICY "Users can view own tenant telemetry" ON telemetry_events
  FOR SELECT USING (tenant_id = current_setting('app.tenant_id', true));

CREATE POLICY "Users can view own tenant schema fixes" ON schema_fixes
  FOR SELECT USING (tenant_id = current_setting('app.tenant_id', true));

CREATE POLICY "Users can view own tenant reprobe jobs" ON reprobe_jobs
  FOR SELECT USING (tenant_id = current_setting('app.tenant_id', true));

CREATE POLICY "Users can view own tenant crawl jobs" ON crawl_jobs
  FOR SELECT USING (tenant_id = current_setting('app.tenant_id', true));

-- Grant permissions (adjust based on your setup)
-- GRANT SELECT, INSERT ON telemetry_events TO authenticated;
-- GRANT SELECT, INSERT ON schema_fixes TO authenticated;
-- GRANT SELECT, INSERT ON reprobe_jobs TO authenticated;
-- GRANT SELECT, INSERT ON crawl_jobs TO authenticated;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Integration tables created successfully!';
  RAISE NOTICE 'Tables: telemetry_events, schema_fixes, reprobe_jobs, crawl_jobs';
END $$;

