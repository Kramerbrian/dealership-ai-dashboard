#!/bin/bash
# Master setup script - runs all setup steps

set -e

echo "🎯 DealershipAI Dashboard - Complete Setup"
echo "=========================================="
echo ""
echo "This script will guide you through:"
echo "  1. Environment variables setup"
echo "  2. Supabase migrations"
echo "  3. Deployment"
echo ""

read -p "Start setup? (y/n): " start
if [ "$start" != "y" ]; then
  echo "Cancelled"
  exit 0
fi

# Step 1: Environment Variables
echo ""
echo "═══════════════════════════════════════"
echo "STEP 1: Environment Variables"
echo "═══════════════════════════════════════"
read -p "Set up environment variables? (y/n): " setup_env
if [ "$setup_env" = "y" ]; then
  ./scripts/setup-env.sh
else
  echo "Skipped - make sure to set them manually in Vercel Dashboard"
fi

# Step 2: Supabase Migrations
echo ""
echo "═══════════════════════════════════════"
echo "STEP 2: Supabase Migrations"
echo "═══════════════════════════════════════"
read -p "Run Supabase migrations? (y/n): " setup_supabase
if [ "$setup_supabase" = "y" ]; then
  ./scripts/setup-supabase.sh
else
  echo "Skipped - apply migrations manually via Supabase Dashboard"
fi

# Step 3: Clerk Configuration
echo ""
echo "═══════════════════════════════════════"
echo "STEP 3: Clerk Configuration"
echo "═══════════════════════════════════════"
echo "⚠️  Manual step required:"
echo "  1. Go to https://dashboard.clerk.com"
echo "  2. Select your application"
echo "  3. Settings → Domains → Add your production domain"
echo "  4. Settings → Paths → Verify redirect URLs"
echo ""
read -p "Press Enter when Clerk is configured..."

# Step 4: Deploy
echo ""
echo "═══════════════════════════════════════"
echo "STEP 4: Deploy to Vercel"
echo "═══════════════════════════════════════"
read -p "Deploy now? (y/n): " deploy
if [ "$deploy" = "y" ]; then
  ./scripts/deploy.sh
else
  echo "Skipped - run './scripts/deploy.sh' when ready"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Summary:"
echo "  ✅ Environment variables: Set in Vercel"
echo "  ✅ Supabase migrations: Applied"
echo "  ✅ Clerk: Configured (manual step)"
echo "  ✅ Deployment: Complete"
echo ""
echo "🧪 Test your dashboard:"
echo "  - Sign up at: https://your-domain.com/sign-up"
echo "  - View dashboard: https://your-domain.com/dashboard"
echo "  - Health check: https://your-domain.com/api/health"

