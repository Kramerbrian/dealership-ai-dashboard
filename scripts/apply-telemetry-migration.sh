#!/bin/bash

# Apply telemetry migration to Supabase
# This script executes the migration SQL directly via Supabase REST API

echo "🚀 Applying Telemetry Migration to Supabase..."
echo ""

# Check for environment variables
if [ -z "$SUPABASE_URL" ] && [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
  echo "❌ Error: SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL not found"
  echo "Please set environment variables or use Supabase Dashboard SQL Editor"
  exit 1
fi

SUPABASE_URL=${SUPABASE_URL:-$NEXT_PUBLIC_SUPABASE_URL}
SERVICE_KEY=${SUPABASE_SERVICE_ROLE_KEY:-$SUPABASE_SERVICE_KEY}

if [ -z "$SERVICE_KEY" ]; then
  echo "⚠️  Warning: SUPABASE_SERVICE_ROLE_KEY not found"
  echo "Migration will need to be run manually via Supabase Dashboard"
  echo ""
  echo "📋 To run manually:"
  echo "1. Visit: https://supabase.com/dashboard/project/gzlgfghpkbqlhgfozjkb"
  echo "2. Go to SQL Editor"
  echo "3. Copy and paste the contents of: supabase/migrations/20251105110958_telemetry_and_pulse_schema.sql"
  echo "4. Click Run"
  exit 0
fi

echo "📊 Supabase URL: $SUPABASE_URL"
echo ""

# Read migration SQL
MIGRATION_FILE="supabase/migrations/20251105110958_telemetry_and_pulse_schema.sql"

if [ ! -f "$MIGRATION_FILE" ]; then
  echo "❌ Error: Migration file not found: $MIGRATION_FILE"
  exit 1
fi

echo "📄 Migration file: $MIGRATION_FILE"
echo ""

# Note: Supabase REST API doesn't support arbitrary SQL execution
# We need to use the Supabase Dashboard SQL Editor or psql
echo "ℹ️  Supabase REST API doesn't support arbitrary SQL execution"
echo ""
echo "✅ Recommended: Use Supabase Dashboard SQL Editor"
echo ""
echo "📋 Steps:"
echo "1. Visit: https://supabase.com/dashboard/project/gzlgfghpkbqlhgfozjkb/sql/new"
echo "2. Copy the SQL below:"
echo ""
echo "--- SQL START ---"
cat "$MIGRATION_FILE"
echo ""
echo "--- SQL END ---"
echo ""
echo "3. Paste into SQL Editor and click Run"
echo ""
echo "✅ Migration SQL ready to execute!"

