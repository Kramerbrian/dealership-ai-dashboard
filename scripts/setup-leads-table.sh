#!/bin/bash
# Script to create the leads table in Supabase

echo "🔧 Setting up leads table in Supabase..."

# Check if required environment variables are set
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
  echo "❌ Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set"
  echo "Please run: source .env.local"
  exit 1
fi

# Extract project ref from Supabase URL
PROJECT_REF=$(echo $NEXT_PUBLIC_SUPABASE_URL | sed -E 's/https:\/\/([^.]+).*/\1/')
echo "📋 Project: $PROJECT_REF"

# Run the migration SQL
echo "🚀 Running migration..."

psql "postgresql://postgres:${SUPABASE_DB_PASSWORD}@db.${PROJECT_REF}.supabase.co:5432/postgres" \
  -f supabase/migrations/20250108_create_leads_table.sql

if [ $? -eq 0 ]; then
  echo "✅ Leads table created successfully!"
  echo ""
  echo "You can now:"
  echo "  1. Test the API: POST /api/leads"
  echo "  2. View leads: GET /api/leads"
  echo "  3. Check Supabase dashboard: https://supabase.com/dashboard/project/$PROJECT_REF/editor"
else
  echo "❌ Migration failed. Please check the error above."
  echo ""
  echo "Alternative: Copy and paste the SQL from supabase/migrations/20250108_create_leads_table.sql"
  echo "into the Supabase SQL Editor at:"
  echo "https://supabase.com/dashboard/project/$PROJECT_REF/sql/new"
  exit 1
fi
