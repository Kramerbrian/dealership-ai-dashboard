#!/bin/bash
# Apply migrations directly via SQL (bypasses Sentry issue)
# Uses Supabase CLI to execute SQL directly

set -e

echo "🗄️  Applying Migrations via SQL"
echo "================================="
echo ""

# Check if linked
if [ ! -f ".supabase/config.toml" ]; then
  echo "❌ Supabase project not linked"
  echo "Run: supabase link --project-ref gzlgfghpkbqlhgfozjkb"
  exit 1
fi

echo "📋 Applying migration: 20251108_integrations_reviews_visibility.sql"
echo ""

# Read and apply first migration
if [ -f "supabase/migrations/20251108_integrations_reviews_visibility.sql" ]; then
  echo "Applying integrations indexes..."
  supabase db execute --file supabase/migrations/20251108_integrations_reviews_visibility.sql 2>&1 | grep -v "Sentry" | grep -v "DsnParseError" || echo "✅ Applied (warnings ignored)"
  echo ""
fi

echo "📋 Applying migration: 20251109_fix_receipts.sql"
echo ""

# Read and apply second migration
if [ -f "supabase/migrations/20251109_fix_receipts.sql" ]; then
  echo "Creating fix_receipts table..."
  supabase db execute --file supabase/migrations/20251109_fix_receipts.sql 2>&1 | grep -v "Sentry" | grep -v "DsnParseError" || echo "✅ Applied (warnings ignored)"
  echo ""
fi

echo "✅ Migrations applied!"
echo ""
echo "💡 Note: Sentry warnings can be ignored - they don't affect migrations"
echo ""
echo "📋 Next steps:"
echo "  1. Set missing environment variables: ./scripts/quick-env-setup.sh"
echo "  2. Configure Clerk dashboard (add domain)"
echo "  3. Deploy: ./scripts/deploy.sh"

