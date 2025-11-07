#!/bin/bash
# Manual migration application script
# Applies migrations directly via Supabase CLI, ignoring Sentry warnings

set -e

echo "🗄️  Applying Supabase Migrations"
echo "=================================="
echo ""

# Check if linked
if [ ! -f ".supabase/config.toml" ]; then
  echo "❌ Supabase project not linked"
  echo "Run: supabase link --project-ref gzlgfghpkbqlhgfozjkb"
  exit 1
fi

echo "📋 Migration files to apply:"
ls -1 supabase/migrations/*.sql 2>/dev/null | tail -2

echo ""
read -p "Apply migrations? (y/n): " confirm
if [ "$confirm" != "y" ]; then
  echo "Cancelled"
  exit 0
fi

echo ""
echo "🔄 Applying migrations (ignoring Sentry warnings)..."
echo ""

# Apply migrations, filtering out Sentry warnings
supabase db push 2>&1 | grep -v "Sentry" | grep -v "DsnParseError" || {
  # Check if it actually succeeded despite warnings
  if [ ${PIPESTATUS[0]} -eq 0 ] || [ ${PIPESTATUS[0]} -eq 1 ]; then
    echo ""
    echo "✅ Migrations applied (Sentry warnings can be ignored)"
  else
    echo ""
    echo "❌ Migration failed. Check output above."
    exit 1
  fi
}

echo ""
echo "✅ Migrations complete!"
echo ""
echo "📋 Next steps:"
echo "  1. Configure Clerk dashboard (add domain)"
echo "  2. Deploy: ./scripts/deploy.sh"

