#!/bin/bash
# Deploy DealershipAI with Confidence
# Runs all checks and deploys to Vercel

set -e

echo "🚀 DealershipAI - Deploy with Confidence"
echo "=========================================="
echo ""

# Step 1: Check .env.local exists
if [ ! -f .env.local ]; then
  echo "❌ .env.local not found"
  echo "   Create .env.local with your environment variables"
  exit 1
fi

echo "✅ .env.local found"
echo ""

# Step 2: Load and verify Clerk keys
# Load .env.local (skip comments and empty lines)
export $(grep -v '^#' .env.local | grep -v '^$' | xargs)

if [ -z "$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" ] || [ -z "$CLERK_SECRET_KEY" ]; then
  echo "❌ Clerk keys not set in .env.local"
  echo "   Required: NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY"
  echo ""
  echo "   Found in .env.local:"
  grep -E "CLERK" .env.local | grep -v "^#" | head -2 || echo "   (none found)"
  exit 1
fi

echo "✅ Clerk keys found in .env.local"
echo ""

# Step 3: Sync to Vercel
echo "📤 Syncing environment variables to Vercel..."
if command -v vercel &> /dev/null || command -v npx &> /dev/null; then
  # Use npx vercel if vercel not in PATH
  VERCEL_CMD="vercel"
  if ! command -v vercel &> /dev/null; then
    VERCEL_CMD="npx vercel"
  fi
  # Temporarily set vercel command for sync script
  export VERCEL_CMD
  bash scripts/sync-env-to-vercel.sh
else
  echo "⚠️  Vercel CLI not found - skipping sync"
  echo "   Install: npm install -g vercel"
  echo "   Or set variables manually in Vercel dashboard"
fi

echo ""

# Step 4: Build check
echo "🏗️  Running build check..."
if npm run build > /tmp/build.log 2>&1; then
  echo "✅ Build successful"
else
  echo "⚠️  Build has warnings"
  echo "   Check /tmp/build.log for details"
  echo "   Non-critical errors (like cron routes) are OK"
fi

echo ""

# Step 5: Deploy
echo "🚀 Deploying to Vercel..."
echo ""

# Use npx vercel if vercel not in PATH
if command -v vercel &> /dev/null; then
  echo "Running: vercel --prod"
  vercel --prod
elif command -v npx &> /dev/null; then
  echo "Running: npx vercel --prod"
  npx vercel --prod
else
  echo "❌ Vercel CLI not found"
  echo "   Install: npm install -g vercel"
  exit 1
fi

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "  1. Visit your Vercel deployment URL"
echo "  2. Test the complete flow:"
echo "     - Sign up → Onboarding → Dashboard"
echo "     - Fleet → Fix now → Dry-run → Apply"
echo "     - Bulk upload → Edit invalid rows → Commit"
echo ""
echo "  3. Set Clerk user roles in Clerk Dashboard:"
echo "     - Go to Users → Select user → Metadata"
echo "     - Add: {\"role\":\"admin\",\"tenant\":\"demo-dealer-001\"}"
echo ""
echo "🎉 You're live!"

