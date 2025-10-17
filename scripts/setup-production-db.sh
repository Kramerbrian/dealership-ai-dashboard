#!/bin/bash

# DealershipAI Production Database Setup Script
# This script sets up the production database with all required tables and data

set -e

echo "🚀 Setting up DealershipAI Production Database..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL environment variable is not set"
    echo "Please set your production database URL:"
    echo "export DATABASE_URL='postgresql://username:password@host:port/database'"
    exit 1
fi

echo "✅ Database URL configured"

# Run Prisma migrations
echo "📊 Running database migrations..."
npx prisma migrate deploy

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Seed initial data
echo "🌱 Seeding initial data..."
npx prisma db seed

# Create indexes for performance
echo "⚡ Creating performance indexes..."
psql "$DATABASE_URL" -c "
-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_scores_dealership_created ON scores(dealershipId, createdAt DESC);
CREATE INDEX IF NOT EXISTS idx_audits_dealership_created ON audits(dealershipId, createdAt DESC);
CREATE INDEX IF NOT EXISTS idx_aeo_runs_tenant_date ON aeo_runs(tenant_id, run_date DESC);
CREATE INDEX IF NOT EXISTS idx_aeo_queries_run_id ON aeo_queries(run_id);
CREATE INDEX IF NOT EXISTS idx_ai_answer_events_tenant_observed ON ai_answer_events(tenant_id, observed_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_snippet_share_tenant_asof ON ai_snippet_share(tenant_id, as_of DESC);
"

# Set up Row Level Security (RLS)
echo "🔒 Setting up Row Level Security..."
psql "$DATABASE_URL" -c "
-- Enable RLS on sensitive tables
ALTER TABLE dealerships ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE aeo_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE aeo_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_answer_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_snippet_share ENABLE ROW LEVEL SECURITY;
ALTER TABLE idempotency_events ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (basic tenant isolation)
CREATE POLICY IF NOT EXISTS dealerships_tenant_isolation ON dealerships
    FOR ALL USING (id = current_setting('app.tenant_id', true)::text);

CREATE POLICY IF NOT EXISTS scores_tenant_isolation ON scores
    FOR ALL USING (dealershipId = current_setting('app.tenant_id', true)::text);

CREATE POLICY IF NOT EXISTS audits_tenant_isolation ON audits
    FOR ALL USING (dealershipId = current_setting('app.tenant_id', true)::text);
"

# Create materialized views for performance
echo "📈 Creating materialized views..."
psql "$DATABASE_URL" -c "
-- AI Answer Intelligence Materialized View
CREATE MATERIALIZED VIEW IF NOT EXISTS ai_zero_click_impact_mv AS
SELECT 
    tenant_id,
    engine,
    DATE_TRUNC('day', observed_at) as date,
    COUNT(*) as total_queries,
    SUM(CASE WHEN appeared THEN 1 ELSE 0 END) as total_appearances,
    SUM(CASE WHEN cited THEN 1 ELSE 0 END) as total_citations,
    AVG(CASE WHEN appeared THEN clicks_est ELSE NULL END) as avg_clicks_when_appeared,
    ROUND(
        (SUM(CASE WHEN appeared THEN 1 ELSE 0 END)::decimal / COUNT(*)) * 100, 2
    ) as appearance_rate_pct,
    ROUND(
        (SUM(CASE WHEN cited THEN 1 ELSE 0 END)::decimal / NULLIF(SUM(CASE WHEN appeared THEN 1 ELSE 0 END), 0)) * 100, 2
    ) as citation_rate_pct
FROM ai_answer_events
WHERE observed_at >= NOW() - INTERVAL '30 days'
GROUP BY tenant_id, engine, DATE_TRUNC('day', observed_at)
ORDER BY date DESC;

-- Create index on materialized view
CREATE INDEX IF NOT EXISTS idx_ai_zero_click_impact_mv_tenant_date 
ON ai_zero_click_impact_mv(tenant_id, date DESC);

-- AEO Surface Breakdown Materialized View
CREATE MATERIALIZED VIEW IF NOT EXISTS aeo_surface_breakdown AS
SELECT 
    ar.tenant_id,
    DATE_TRUNC('day', ar.run_date) as date,
    aq.surface_type,
    COUNT(*) as query_count,
    SUM(CASE WHEN aq.aeo_present THEN 1 ELSE 0 END) as appearances,
    ROUND(
        (SUM(CASE WHEN aq.aeo_present THEN 1 ELSE 0 END)::decimal / COUNT(*)) * 100, 2
    ) as appearance_rate_pct
FROM aeo_runs ar
JOIN aeo_queries aq ON ar.id = aq.run_id
WHERE ar.run_date >= NOW() - INTERVAL '30 days'
GROUP BY ar.tenant_id, DATE_TRUNC('day', ar.run_date), aq.surface_type
ORDER BY date DESC;

-- Create index on materialized view
CREATE INDEX IF NOT EXISTS idx_aeo_surface_breakdown_tenant_date 
ON aeo_surface_breakdown(tenant_id, date DESC);
"

# Set up database monitoring
echo "📊 Setting up database monitoring..."
psql "$DATABASE_URL" -c "
-- Create monitoring functions
CREATE OR REPLACE FUNCTION get_database_stats()
RETURNS TABLE (
    table_name text,
    row_count bigint,
    size_mb numeric
) AS \$\$
BEGIN
    RETURN QUERY
    SELECT 
        schemaname||'.'||tablename as table_name,
        n_tup_ins - n_tup_del as row_count,
        ROUND(pg_total_relation_size(schemaname||'.'||tablename) / 1024.0 / 1024.0, 2) as size_mb
    FROM pg_stat_user_tables
    WHERE schemaname = 'public'
    ORDER BY size_mb DESC;
END;
\$\$ LANGUAGE plpgsql;
"

echo "✅ Production database setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Configure environment variables"
echo "2. Set up Redis for caching"
echo "3. Configure monitoring and alerts"
echo "4. Set up custom domains"
echo "5. Deploy to production"
echo ""
echo "🔗 Database URL: $DATABASE_URL"
echo "📊 You can now run: psql \"$DATABASE_URL\" -c \"SELECT * FROM get_database_stats();\""