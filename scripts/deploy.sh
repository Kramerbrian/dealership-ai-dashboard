#!/bin/bash
# Full deployment script with pre-flight checks

set -e

echo "🚀 DealershipAI Dashboard Deployment"
echo "====================================="
echo ""

# Pre-flight checks
echo "🔍 Pre-flight checks..."
echo ""

# Check Vercel CLI
if ! command -v vercel &> /dev/null; then
  echo "❌ Vercel CLI not found. Install with: npm i -g vercel"
  exit 1
fi

# Check if logged in
if ! vercel whoami &> /dev/null; then
  echo "⚠️  Not logged into Vercel. Logging in..."
  vercel login
fi

# Check environment variables
echo "📋 Checking environment variables..."
required_vars=(
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"
  "CLERK_SECRET_KEY"
  "SUPABASE_URL"
  "SUPABASE_SERVICE_ROLE"
  "UPSTASH_REDIS_REST_URL"
  "UPSTASH_REDIS_REST_TOKEN"
)

missing_vars=()
for var in "${required_vars[@]}"; do
  if ! vercel env ls production 2>/dev/null | grep -q "$var"; then
    missing_vars+=("$var")
  fi
done

if [ ${#missing_vars[@]} -gt 0 ]; then
  echo "⚠️  Missing environment variables:"
  for var in "${missing_vars[@]}"; do
    echo "   - $var"
  done
  echo ""
  read -p "Run setup script to add them? (y/n): " run_setup
  if [ "$run_setup" = "y" ]; then
    ./scripts/setup-env.sh
  else
    echo "❌ Please set environment variables before deploying"
    exit 1
  fi
else
  echo "✅ All required environment variables set"
fi

# Check migrations
echo ""
echo "📋 Checking Supabase migrations..."
if command -v supabase &> /dev/null; then
  if [ -f ".supabase/config.toml" ]; then
    echo "✅ Supabase project linked"
    echo "💡 Run './scripts/setup-supabase.sh' if migrations aren't applied"
  else
    echo "⚠️  Supabase project not linked"
    echo "💡 Run './scripts/setup-supabase.sh' to apply migrations"
  fi
else
  echo "⚠️  Supabase CLI not installed"
  echo "💡 Apply migrations manually via Supabase Dashboard"
fi

# Build check
echo ""
echo "🔨 Checking build..."
if npm run build &> /dev/null; then
  echo "✅ Build successful"
else
  echo "❌ Build failed. Fix errors before deploying."
  exit 1
fi

# Deploy
echo ""
echo "🚀 Deploying to Vercel..."
echo ""
read -p "Deploy to production? (y/n): " confirm
if [ "$confirm" != "y" ]; then
  echo "Cancelled"
  exit 0
fi

vercel --prod

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🧪 Test your deployment:"
echo "  1. Visit your production URL"
echo "  2. Sign up → Should redirect to /dashboard"
echo "  3. Check pulses, fix drawer, Impact Ledger"
echo "  4. Hover over AIV chip → Should see sparkline"
echo ""
echo "📊 Health check:"
echo "  curl https://your-domain.com/api/health"

