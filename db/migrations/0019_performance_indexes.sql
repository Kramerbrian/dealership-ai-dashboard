-- Performance Optimization Indexes
-- Add indexes to improve query performance

-- AI Answer Events indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ai_answer_events_tenant_observed 
ON ai_answer_events(tenant_id, observed_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ai_answer_events_engine_observed 
ON ai_answer_events(ai_engine, observed_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ai_answer_events_tenant_engine 
ON ai_answer_events(tenant_id, ai_engine);

-- AI Snippet Share indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ai_snippet_share_tenant_asof 
ON ai_snippet_share(tenant_id, as_of DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ai_snippet_share_engine_asof 
ON ai_snippet_share(ai_engine, as_of DESC);

-- Tenants indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tenants_domain 
ON tenants(domain);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tenants_created_at 
ON tenants(created_at DESC);

-- Performance monitoring indexes (if tables exist)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_performance_metrics_timestamp 
ON performance_metrics(timestamp DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_performance_metrics_page_timestamp 
ON performance_metrics(page, timestamp DESC);

-- Analytics indexes (if tables exist)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_analytics_events_timestamp 
ON analytics_events(timestamp DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_analytics_events_type_timestamp 
ON analytics_events(event_type, timestamp DESC);

-- Dashboard metrics indexes (if tables exist)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_dashboard_metrics_tenant_date 
ON dashboard_metrics(tenant_id, date DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_dashboard_metrics_metric_date 
ON dashboard_metrics(metric_name, date DESC);

-- Add composite indexes for common query patterns
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ai_answer_events_tenant_engine_observed 
ON ai_answer_events(tenant_id, ai_engine, observed_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ai_snippet_share_tenant_engine_asof 
ON ai_snippet_share(tenant_id, ai_engine, as_of DESC);

-- Partial indexes for active records
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tenants_active 
ON tenants(id) WHERE deleted_at IS NULL;

-- Statistics update
ANALYZE ai_answer_events;
ANALYZE ai_snippet_share;
ANALYZE tenants;

-- Performance monitoring view refresh
REFRESH MATERIALIZED VIEW CONCURRENTLY IF EXISTS ai_zero_click_impact_mv;
