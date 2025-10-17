#!/bin/bash

# DealershipAI - Quick Schema Deployment
# One-command deployment of all schemas to Supabase

echo "🚀 DealershipAI Schema Deployment"
echo "================================="

# Check if Supabase CLI is available
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Installing..."
    npm install -g supabase
fi

# Initialize Supabase if needed
if [ ! -f "supabase/config.toml" ]; then
    echo "🔧 Initializing Supabase project..."
    supabase init
fi

# Create migrations directory
mkdir -p supabase/migrations

# Copy all SQL migrations to Supabase format
echo "📁 Copying migration files..."
for file in db/migrations/*.sql; do
    if [ -f "$file" ]; then
        filename=$(basename "$file")
        # Extract number and add timestamp prefix
        number=$(echo "$filename" | grep -o '^[0-9]*')
        if [ -n "$number" ]; then
            new_name="20250114$(printf "%06d" $number)_${filename#*_}"
            cp "$file" "supabase/migrations/$new_name"
            echo "   ✅ $filename -> $new_name"
        fi
    fi
done

# Create initial schema
cat > supabase/migrations/20250114000000_initial_setup.sql << 'EOF'
-- DealershipAI Initial Setup
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

CREATE SCHEMA IF NOT EXISTS app;

CREATE OR REPLACE FUNCTION app.tenant() RETURNS uuid AS $$
BEGIN
  RETURN COALESCE(
    current_setting('app.tenant', true)::uuid,
    '00000000-0000-0000-0000-000000000000'::uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
EOF

echo "✅ Migration files prepared"

# Deploy to Supabase
echo "🚀 Deploying to Supabase..."

if supabase db push; then
    echo "✅ Schema deployed successfully!"
    echo ""
    echo "🎉 DealershipAI database is ready!"
    echo ""
    echo "📊 Your database now includes:"
    echo "   • AVI Reports with elasticity calculations"
    echo "   • Offer Integrity Audits with RLS"
    echo "   • Fee Taxonomy for compliance"
    echo "   • OCI Live materialized views"
    echo "   • SEO Metrics tracking"
    echo "   • Secondary metrics (SCS, SIS, ADI, SCR)"
    echo "   • Tenant configurations for policies"
    echo ""
    echo "🔗 Test your APIs now!"
else
    echo "❌ Deployment failed. Check your Supabase connection."
    echo "💡 Try: supabase login && supabase link"
fi
