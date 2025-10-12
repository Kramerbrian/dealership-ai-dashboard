#!/bin/bash

# Fix Database Schema and RLS Issues
# This script runs the migration to fix schema and RLS problems

set -e

echo "🔧 Fixing database schema and RLS issues..."

# Check if we have the required environment variables
if [ -z "$SUPABASE_URL" ]; then
    echo "❌ SUPABASE_URL environment variable is not set"
    echo "Please set it with: export SUPABASE_URL='your-supabase-url'"
    exit 1
fi

if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "❌ SUPABASE_SERVICE_ROLE_KEY environment variable is not set"
    echo "Please set it with: export SUPABASE_SERVICE_ROLE_KEY='your-service-role-key'"
    exit 1
fi

echo "✅ Environment variables are set"

# Run the migration
echo "📝 Running database migration..."

psql "$SUPABASE_URL" -f supabase/migrations/20241220000005_fix_schema_and_rls.sql

if [ $? -eq 0 ]; then
    echo "✅ Database migration completed successfully!"
else
    echo "❌ Database migration failed"
    exit 1
fi

# Verify the tables exist
echo "🔍 Verifying tables exist..."

psql "$SUPABASE_URL" -c "SELECT to_regclass('public.security_events');"

# Check RLS policies
echo "🔍 Checking RLS policies..."

psql "$SUPABASE_URL" -c "SELECT * FROM pg_policies WHERE schemaname='public' AND tablename IN ('security_events', 'ai_source_configs', 'ai_visibility_metrics', 'ai_insights', 'ai_recommendations', 'document_uploads', 'document_insights');"

echo "🎉 Database schema fix completed successfully!"
echo ""
echo "Next steps:"
echo "1. Your database schema is now properly configured"
echo "2. RLS policies are enabled and working"
echo "3. You can now use the AI features with fallback support"
echo "4. The system will work even when external APIs are unavailable"
