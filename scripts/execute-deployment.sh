#!/bin/bash
# Execute Complete Deployment
# This script guides you through the full deployment process

set -e

echo "🚀 DealershipAI Orchestrator Deployment"
echo "========================================"
echo ""

# Step 1: Supabase Schema
echo "Step 1: Deploy Supabase Schema"
echo "-------------------------------"
echo ""
echo "1. Open: https://app.supabase.com/project/gzlgfghpkbqlhgfozjkb/sql"
echo "2. Copy the schema:"
echo ""
cat supabase/schema.sql
echo ""
echo ""
read -p "Press Enter after you've deployed the schema to Supabase..."

# Step 2: Environment Variables
echo ""
echo "Step 2: Set Environment Variables"
echo "----------------------------------"
echo ""
read -p "Do you want to set local environment variables now? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
  ./scripts/setup-env-orchestrator.sh
fi

echo ""
echo "⚠️  Don't forget to set environment variables in Vercel Dashboard:"
echo "   → Project Settings → Environment Variables"
echo "   → Add: OPENAI_API_KEY, SLACK_WEBHOOK_URL, VERCEL_TOKEN, SUPABASE_SERVICE_ROLE_KEY"
echo ""

# Step 3: Push to GitHub
echo ""
echo "Step 3: Push to GitHub"
echo "----------------------"
read -p "Ready to push to GitHub? This will trigger Vercel deployment. (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo "Pushing to GitHub..."
  git push origin main
  echo ""
  echo "✅ Pushed to GitHub!"
  echo ""
  echo "Next steps:"
  echo "1. Watch Vercel dashboard for deployment"
  echo "2. Verify cron job: Settings → Cron Jobs"
  echo "3. Test orchestrator console: /pulse/meta/orchestrator-console"
else
  echo "Skipped push. Run 'git push origin main' when ready."
fi

echo ""
echo "========================================"
echo "✅ Deployment process complete!"
echo ""

