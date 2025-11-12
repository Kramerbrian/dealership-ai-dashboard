#!/bin/bash

# Deploy Landing Page to Vercel Production
# This script deploys the new landing page with LandingAnalyzer to https://dealershipai.com/

set -e

echo "🚀 Deploying Landing Page to Vercel"
echo "===================================="
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
  echo "❌ Vercel CLI not found. Installing..."
  npm install -g vercel@latest
fi

# Check if project is linked
if [ ! -f .vercel/project.json ]; then
  echo "❌ Project not linked to Vercel"
  echo "   Run: npx vercel link"
  echo "   Select: team_J5h3AZhwYBLSHC561ioEMwGH / dealership-ai-dashboard"
  exit 1
fi

echo "✅ Project linked"
echo ""

# Show current deployment info
echo "📋 Current Deployment Info:"
cat .vercel/project.json | grep -E "projectId|orgId|projectName" || true
echo ""

# Deploy to production
echo "🚀 Deploying to production..."
echo "   This will deploy to: https://dealershipai.com/"
echo ""

npx vercel --prod --yes

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🌐 Your landing page should be live at:"
echo "   https://dealershipai.com/"
echo ""
echo "📊 View deployment status:"
echo "   https://vercel.com/team_J5h3AZhwYBLSHC561ioEMwGH/dealership-ai-dashboard"
echo ""

