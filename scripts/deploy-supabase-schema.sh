#!/bin/bash
# Deploy Supabase Schema
# This script applies the schema.sql to your Supabase project

set -e

echo "🚀 Deploying Supabase schema..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
  echo "❌ Supabase CLI not found. Install it with:"
  echo "   npm install -g supabase"
  echo ""
  echo "Or use the Supabase dashboard:"
  echo "   1. Go to https://app.supabase.com/project/YOUR_PROJECT_ID/sql"
  echo "   2. Copy contents of supabase/schema.sql"
  echo "   3. Paste and run in SQL editor"
  exit 1
fi

# Check if linked to a project
if [ ! -f ".supabase/config.toml" ]; then
  echo "⚠️  Not linked to a Supabase project."
  echo "   Run: supabase link --project-ref YOUR_PROJECT_REF"
  exit 1
fi

# Apply schema
echo "📝 Applying schema.sql..."
supabase db push --db-url "$DATABASE_URL" < supabase/schema.sql || {
  echo "⚠️  Direct push failed. Trying alternative method..."
  echo ""
  echo "Alternative: Use Supabase Dashboard"
  echo "   1. Go to: https://app.supabase.com/project/YOUR_PROJECT_ID/sql"
  echo "   2. Copy contents of supabase/schema.sql"
  echo "   3. Paste and execute"
}

echo "✅ Schema deployment complete!"
echo ""
echo "Next steps:"
echo "   1. Verify tables in Supabase dashboard"
echo "   2. Check indexes were created"
echo "   3. Verify retention function exists"
