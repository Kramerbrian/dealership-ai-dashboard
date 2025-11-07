#!/bin/bash
# Run Supabase migrations via CLI

set -e

echo "🗄️  Supabase Migrations Setup"
echo "=============================="
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
  echo "❌ Supabase CLI not found."
  echo ""
  echo "Install with:"
  echo "  brew install supabase/tap/supabase"
  echo "  OR"
  echo "  npm install -g supabase"
  echo ""
  echo "Or apply migrations manually via Supabase Dashboard:"
  echo "  1. Go to https://supabase.com/dashboard"
  echo "  2. Select your project → SQL Editor"
  echo "  3. Copy/paste contents of:"
  echo "     - supabase/migrations/20251108_integrations_reviews_visibility.sql"
  echo "     - supabase/migrations/20251109_fix_receipts.sql"
  exit 1
fi

# Check if logged in
if ! supabase projects list &> /dev/null; then
  echo "⚠️  Not logged into Supabase. Logging in..."
  supabase login
fi

# Check if linked to a project
if [ ! -f ".supabase/config.toml" ]; then
  echo "⚠️  Project not linked. Let's link it..."
  echo ""
  echo "Available projects:"
  supabase projects list
  echo ""
  read -p "Enter your project reference ID: " project_ref
  
  if [ -z "$project_ref" ]; then
    echo "❌ Project reference required"
    exit 1
  fi
  
  supabase link --project-ref "$project_ref"
fi

echo ""
echo "📋 Migration files to apply:"
ls -1 supabase/migrations/*.sql 2>/dev/null | tail -2 || echo "  No migration files found"

echo ""
read -p "Apply migrations? (y/n): " confirm
if [ "$confirm" != "y" ]; then
  echo "Skipped"
  exit 0
fi

echo ""
echo "🔄 Applying migrations..."
supabase db push

echo ""
echo "✅ Migrations applied successfully!"
echo ""
echo "📋 Next steps:"
echo "  1. Configure Clerk dashboard (add domain)"
echo "  2. Run: ./scripts/deploy.sh"
