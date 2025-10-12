#!/bin/bash

# DealershipAI Database Deployment Script
# Runs migrations on Supabase

set -e

echo "🗄️  DealershipAI Database Deployment"
echo "===================================="
echo ""

# Load environment variables
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

# Check for Supabase URL
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
  echo "❌ Error: NEXT_PUBLIC_SUPABASE_URL not set"
  echo "Please set it in .env file"
  exit 1
fi

# Extract project ID from URL
PROJECT_ID=$(echo $NEXT_PUBLIC_SUPABASE_URL | sed -E 's/https:\/\/([^.]+).*/\1/')
echo "📊 Project ID: $PROJECT_ID"

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
  echo "⚠️  Supabase CLI not installed"
  echo "Installing via npm..."
  npm install -g supabase
fi

echo ""
echo "🔗 Connecting to Supabase..."

# Option 1: Use Supabase CLI (recommended)
echo "Running migration via Supabase CLI..."
supabase db push --db-url "postgresql://postgres.${PROJECT_ID}:${SUPABASE_DB_PASSWORD}@aws-0-us-west-1.pooler.supabase.com:6543/postgres" || {
  echo ""
  echo "⚠️  CLI push failed. Trying direct psql..."

  # Option 2: Use psql directly
  if command -v psql &> /dev/null; then
    echo "Running migration via psql..."
    PGPASSWORD="${SUPABASE_DB_PASSWORD}" psql \
      "postgresql://postgres.${PROJECT_ID}@aws-0-us-west-1.pooler.supabase.com:6543/postgres" \
      -f supabase/migrations/20250112000001_beta_calibration_and_sentinel.sql
  else
    echo ""
    echo "❌ Neither Supabase CLI nor psql is available"
    echo ""
    echo "📝 Manual Steps:"
    echo "1. Go to: https://supabase.com/dashboard/project/${PROJECT_ID}/sql/new"
    echo "2. Copy the contents of: supabase/migrations/20250112000001_beta_calibration_and_sentinel.sql"
    echo "3. Paste and run in the SQL Editor"
    exit 1
  fi
}

echo ""
echo "✅ Database migration complete!"
echo ""
echo "📊 Verify tables were created:"
echo "   SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;"
echo ""
echo "🔗 View in Supabase:"
echo "   https://supabase.com/dashboard/project/${PROJECT_ID}/editor"
