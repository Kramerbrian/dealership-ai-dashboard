#!/bin/bash

# Apply database migrations to Supabase
# This script runs all new migrations that haven't been applied yet

echo "🚀 Applying database migrations to Supabase..."
echo ""

# Get connection details from environment
source .env.production

if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
  echo "❌ Error: NEXT_PUBLIC_SUPABASE_URL not found in .env.production"
  exit 1
fi

if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
  echo "❌ Error: SUPABASE_SERVICE_ROLE_KEY not found in .env.production"
  exit 1
fi

echo "📊 Supabase URL: $NEXT_PUBLIC_SUPABASE_URL"
echo ""

# Extract database connection from Supabase URL
PROJECT_ID=$(echo $NEXT_PUBLIC_SUPABASE_URL | sed 's/https:\/\///' | sed 's/.supabase.co//')
echo "📝 Project ID: $PROJECT_ID"
echo ""

# Migrations to apply
MIGRATIONS=(
  "supabase/migrations/20250109_add_cron_monitoring_tables.sql"
  "supabase/migrations/20250109_add_system_alerts_table.sql"
)

echo "📋 Migrations to apply:"
for migration in "${MIGRATIONS[@]}"; do
  echo "  - $migration"
done
echo ""

# Note: Direct psql connection requires database password
echo "⚠️  Note: This script requires direct database access."
echo "Please apply migrations using one of these methods:"
echo ""
echo "1. Supabase Dashboard SQL Editor:"
echo "   https://supabase.com/dashboard/project/$PROJECT_ID/sql/new"
echo ""
echo "2. Supabase CLI (if linked):"
echo "   supabase db push"
echo ""
echo "3. Copy and paste the SQL from these files into the SQL editor:"
for migration in "${MIGRATIONS[@]}"; do
  echo "   - $migration"
done
echo ""

echo "✅ After applying migrations, verify with:"
echo "   curl https://dealership-ai-dashboard-brian-kramers-projects.vercel.app/api/cron/health | jq"
