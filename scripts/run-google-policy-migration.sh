#!/bin/bash

# Run Google Policy Compliance Migration
# Usage: ./scripts/run-google-policy-migration.sh

set -e

PROJECT_REF=$(cat supabase/.temp/project-ref 2>/dev/null || echo "")

if [ -z "$PROJECT_REF" ]; then
  echo "❌ Error: Supabase project reference not found"
  echo "Please run: supabase link --project-ref YOUR_PROJECT_REF"
  exit 1
fi

echo "🚀 Running Google Policy Compliance Migration"
echo "Project: $PROJECT_REF"
echo ""

# Check if SUPABASE_DB_PASSWORD is set
if [ -z "$SUPABASE_DB_PASSWORD" ]; then
  echo "⚠️  SUPABASE_DB_PASSWORD not set in environment"
  echo "Enter your Supabase database password:"
  read -s DB_PASSWORD
  export SUPABASE_DB_PASSWORD="$DB_PASSWORD"
fi

# Construct connection string
POOLER_URL="postgresql://postgres.${PROJECT_REF}:${SUPABASE_DB_PASSWORD}@aws-0-us-east-2.pooler.supabase.com:6543/postgres"

echo "📦 Running migration..."
PGPASSWORD="$SUPABASE_DB_PASSWORD" psql "$POOLER_URL" -f supabase/migrations/20251020_google_policy_compliance.sql

echo ""
echo "✅ Migration completed successfully!"
echo ""
echo "Verify with:"
echo "  SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename LIKE 'google_policy%';"
