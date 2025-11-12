#!/bin/bash

# Verify Vercel Deployment and Environment Variables

set -e

echo "🔍 Verifying Vercel Deployment"
echo "==============================="
echo ""

# Check environment variables
echo "📋 Step 1: Checking Environment Variables"
echo ""
npx vercel env ls 2>&1 | grep -E "SUPABASE_DB_PASSWORD|DATABASE_PASSWORD" | head -10 || echo "⚠️  Could not list environment variables (may need project linking)"

echo ""
echo "📋 Step 2: Checking Latest Deployment"
echo ""
npx vercel ls 2>&1 | head -10 || echo "⚠️  Could not list deployments"

echo ""
echo "📋 Step 3: Deployment URLs"
echo ""
echo "Dashboard: https://vercel.com/brian-kramers-projects/dealership-ai-dashboard/deployments"
echo "Project: https://vercel.com/brian-kramers-projects/dealership-ai-dashboard"
echo ""

echo "✅ Verification complete!"
echo ""
echo "📝 Next: Check deployment status in Dashboard"
echo "   https://vercel.com/brian-kramers-projects/dealership-ai-dashboard/deployments"
