#!/bin/bash

# Run Supabase migration for telemetry and trials tables
# This script applies the migration to your Supabase project

set -e

echo "🚀 Running Supabase migration for telemetry and trials..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Install it with: npm install -g supabase"
    exit 1
fi

# Check if migration file exists
MIGRATION_FILE="supabase/migrations/20250115000004_telemetry_trials_rls.sql"
if [ ! -f "$MIGRATION_FILE" ]; then
    echo "❌ Migration file not found: $MIGRATION_FILE"
    exit 1
fi

echo "📄 Migration file: $MIGRATION_FILE"

# Check if we're linked to a project
if [ -z "$SUPABASE_PROJECT_ID" ] && [ ! -f ".supabase/config.toml" ]; then
    echo "⚠️  Not linked to a Supabase project."
    echo "   Run: supabase link --project-ref YOUR_PROJECT_REF"
    echo "   Or set SUPABASE_PROJECT_ID environment variable"
    exit 1
fi

# Apply migration
echo "📤 Applying migration..."
supabase db push

echo "✅ Migration applied successfully!"
echo ""
echo "📋 Next steps:"
echo "   1. Verify tables in Supabase dashboard"
echo "   2. Test trial grant API: POST /api/trial/grant"
echo "   3. Test trial status API: GET /api/trial/status"
echo "   4. Test pricing page trial flow"

