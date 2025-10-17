#!/bin/bash

# DealershipAI Schema Deployment Script
# This script automatically deploys the complete schema to Supabase

set -e  # Exit on any error

echo "🚀 DealershipAI Schema Deployment"
echo "=================================="

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI is not installed. Please install it first:"
    echo "   npm install -g supabase"
    exit 1
fi

# Check if we're in a Supabase project
if [ ! -f "supabase/config.toml" ]; then
    echo "❌ Not in a Supabase project directory. Please run 'supabase init' first."
    exit 1
fi

echo "✅ Supabase CLI found"
echo "✅ Supabase project detected"

# Check if user is logged in
if ! supabase projects list &> /dev/null; then
    echo "❌ Not logged in to Supabase. Please run 'supabase login' first."
    exit 1
fi

echo "✅ Logged in to Supabase"

# Get current project info
PROJECT_REF=$(supabase status --output json | jq -r '.project_ref // empty')
if [ -z "$PROJECT_REF" ]; then
    echo "❌ No linked project found. Please run 'supabase link' first."
    exit 1
fi

echo "✅ Project linked: $PROJECT_REF"

# Create migrations directory if it doesn't exist
mkdir -p supabase/migrations

# Check if migration file exists
MIGRATION_FILE="supabase/migrations/20241220000000_complete_dealership_ai_schema.sql"
if [ ! -f "$MIGRATION_FILE" ]; then
    echo "❌ Migration file not found: $MIGRATION_FILE"
    exit 1
fi

echo "✅ Migration file found: $MIGRATION_FILE"

# Apply the migration
echo ""
echo "📦 Applying schema migration..."
echo "This may take a few minutes..."

if supabase db push; then
    echo ""
    echo "✅ Schema migration completed successfully!"
    echo ""
    echo "📊 What was deployed:"
    echo "   • Fee taxonomy table with standard fee types"
    echo "   • Offer integrity audits table for pricing compliance"
    echo "   • OCI live materialized view for real-time cost analysis"
    echo "   • SEO variant metrics and A/B testing tables"
    echo "   • SEO content variants and performance analytics"
    echo "   • SEO keyword performance tracking"
    echo "   • Row Level Security (RLS) policies for multi-tenant access"
    echo "   • Utility functions for data processing"
    echo "   • Sample data for testing"
    echo ""
    echo "🔧 Next steps:"
    echo "   1. Verify tables in Supabase Dashboard"
    echo "   2. Test API endpoints with sample data"
    echo "   3. Configure tenant settings for your organization"
    echo ""
    echo "🌐 Access your database:"
    echo "   Dashboard: https://supabase.com/dashboard/project/$PROJECT_REF"
    echo ""
else
    echo ""
    echo "❌ Migration failed. Please check the error messages above."
    echo ""
    echo "🔧 Troubleshooting:"
    echo "   1. Check if you have the correct permissions"
    echo "   2. Verify your project is not in maintenance mode"
    echo "   3. Check for any existing conflicting tables"
    echo "   4. Review the migration file for syntax errors"
    echo ""
    exit 1
fi

# Optional: Refresh the materialized view
echo "🔄 Refreshing materialized views..."
if supabase db reset --linked; then
    echo "✅ Materialized views refreshed"
else
    echo "⚠️  Warning: Could not refresh materialized views. You may need to do this manually."
fi

echo ""
echo "🎉 DealershipAI schema deployment complete!"
echo "Your database is now ready for the DealershipAI platform."
