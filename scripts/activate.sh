#!/bin/bash
# Dashboard Activation Script
# Run this to check your setup and guide you through activation

set -e

echo "🚀 DealershipAI Dashboard Activation"
echo "===================================="
echo ""

# Check migrations
echo "📁 Checking migrations..."
if [ -f "supabase/migrations/20251108_integrations_reviews_visibility.sql" ] && [ -f "supabase/migrations/20251109_fix_receipts.sql" ]; then
  echo "  ✅ Migration files found"
else
  echo "  ⚠️  Migration files missing"
fi

# Check dependencies
echo ""
echo "📦 Checking dependencies..."
if grep -q "@upstash/qstash" package.json 2>/dev/null; then
  echo "  ✅ @upstash/qstash installed"
else
  echo "  ⚠️  @upstash/qstash missing - run: npm install @upstash/qstash"
fi

# Check env vars template
echo ""
echo "🔐 Environment variables needed:"
echo "  Required:"
echo "    - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"
echo "    - CLERK_SECRET_KEY"
echo "    - SUPABASE_URL"
echo "    - SUPABASE_SERVICE_ROLE"
echo "    - UPSTASH_REDIS_REST_URL"
echo "    - UPSTASH_REDIS_REST_TOKEN"
echo "    - PUBLIC_BASE_URL (or NEXT_PUBLIC_APP_URL)"
echo ""
echo "  Optional (for async fixes):"
echo "    - QSTASH_TOKEN"
echo "    - QSTASH_CURRENT_SIGNING_KEY"
echo "    - QSTASH_NEXT_SIGNING_KEY"
echo ""

# Check if Vercel CLI is installed
echo "🌐 Checking deployment tools..."
if command -v vercel &> /dev/null; then
  echo "  ✅ Vercel CLI installed"
else
  echo "  ⚠️  Vercel CLI not found - install: npm i -g vercel"
fi

echo ""
echo "📋 Next steps:"
echo "  1. Set environment variables in Vercel dashboard"
echo "  2. Run Supabase migrations"
echo "  3. Configure Clerk dashboard"
echo "  4. Deploy: vercel --prod"
echo ""
echo "📖 See docs/ACTIVATION_CHECKLIST.md for details"

