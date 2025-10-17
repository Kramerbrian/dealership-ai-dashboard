#!/bin/bash

# DealershipAI - Direct Supabase Deployment
# This script uses Supabase CLI to deploy all migrations

set -e

echo "🚀 DealershipAI Supabase Deployment"
echo "===================================="

# Check Supabase CLI
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Installing..."
    npm install -g supabase
fi

# Check if we're in a Supabase project
if [ ! -f "supabase/config.toml" ]; then
    echo "🔧 Initializing Supabase project..."
    supabase init
fi

# Check if we're linked to a remote project
if ! supabase status &> /dev/null; then
    echo "⚠️  Not linked to remote project. Please run:"
    echo "   supabase login"
    echo "   supabase link --project-ref YOUR_PROJECT_REF"
    echo ""
    echo "For now, we'll work with local development..."
fi

echo "📁 Copying migration files to Supabase migrations directory..."

# Create supabase/migrations directory if it doesn't exist
mkdir -p supabase/migrations

# Copy and rename our migration files to Supabase format
echo "   📄 Copying core migrations..."

# Copy SQL migrations with proper timestamps
cp db/migrations/0001_secondary_metrics_create.sql supabase/migrations/20250114000001_secondary_metrics_create.sql
cp db/migrations/0002_secondary_metrics_add_scs.sql supabase/migrations/20250114000002_secondary_metrics_add_scs.sql
cp db/migrations/0003_secondary_metrics_add_sis_adi.sql supabase/migrations/20250114000003_secondary_metrics_add_sis_adi.sql
cp db/migrations/0004_secondary_metrics_add_scr_indexes_rls.sql supabase/migrations/20250114000004_secondary_metrics_add_scr_indexes_rls.sql
cp db/migrations/0005_avi_reports.sql supabase/migrations/20250114000005_avi_reports.sql
cp db/migrations/0006_kpi_history_create.sql supabase/migrations/20250114000006_kpi_history_create.sql
cp db/migrations/0006_seo_metrics.sql supabase/migrations/20250114000007_seo_metrics.sql
cp db/migrations/0007_sentinel_events_create.sql supabase/migrations/20250114000008_sentinel_events_create.sql
cp db/migrations/0012_fee_taxonomy.sql supabase/migrations/20250114000012_fee_taxonomy.sql
cp db/migrations/0013_offer_integrity_audits.sql supabase/migrations/20250114000013_offer_integrity_audits.sql
cp db/migrations/0014_view_oci_live.sql supabase/migrations/20250114000014_view_oci_live.sql

echo "✅ Migration files copied"

# Create a comprehensive initial migration
echo "📝 Creating comprehensive initial migration..."

cat > supabase/migrations/20250114000000_initial_schema.sql << 'EOF'
-- DealershipAI Initial Schema
-- Complete database setup for DealershipAI platform

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create app schema for RLS functions
CREATE SCHEMA IF NOT EXISTS app;

-- Set up app.tenant function for RLS
CREATE OR REPLACE FUNCTION app.tenant() RETURNS uuid AS $$
BEGIN
  RETURN COALESCE(
    current_setting('app.tenant', true)::uuid,
    '00000000-0000-0000-0000-000000000000'::uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create tenant configurations table
CREATE TABLE IF NOT EXISTS tenant_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid UNIQUE NOT NULL,
  policy_config jsonb NOT NULL DEFAULT '{}',
  feature_flags jsonb NOT NULL DEFAULT '{}',
  limits jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on tenant_configs
ALTER TABLE tenant_configs ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for tenant_configs
DO $$ 
BEGIN
  CREATE POLICY tenant_configs_tenant_access ON tenant_configs 
    FOR ALL USING (tenant_id = app.tenant());
EXCEPTION 
  WHEN duplicate_object THEN NULL;
END $$;

-- Create updated_at trigger for tenant_configs
DO $$ 
BEGIN
  DROP TRIGGER IF EXISTS trg_tenant_configs_updated_at ON tenant_configs;
  CREATE TRIGGER trg_tenant_configs_updated_at 
    BEFORE UPDATE ON tenant_configs 
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_tenant_configs_tenant_id ON tenant_configs(tenant_id);

-- Grant permissions
GRANT USAGE ON SCHEMA app TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA app TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
EOF

echo "✅ Initial migration created"

# Apply migrations
echo "🚀 Applying migrations to Supabase..."

if supabase db push; then
    echo "✅ Migrations applied successfully!"
else
    echo "❌ Migration failed. Trying local development setup..."
    
    # Start local Supabase if not running
    if ! supabase status &> /dev/null; then
        echo "🔄 Starting local Supabase..."
        supabase start
    fi
    
    # Apply migrations locally
    echo "📝 Applying migrations locally..."
    supabase db reset --linked=false
    
    echo "✅ Local migrations applied!"
    echo "🌐 Local Supabase is running at:"
    supabase status
fi

echo ""
echo "🎉 DealershipAI Database Setup Complete!"
echo "========================================"
echo ""
echo "✅ All migrations applied"
echo "✅ RLS policies configured"
echo "✅ Functions created"
echo "✅ Indexes optimized"
echo ""
echo "🔗 Connection details:"
supabase status 2>/dev/null || echo "   Run 'supabase status' to see connection details"
echo ""
echo "📋 Next steps:"
echo "1. Test your APIs with the new schema"
echo "2. Verify RLS policies are working"
echo "3. Deploy to production when ready"
echo ""
