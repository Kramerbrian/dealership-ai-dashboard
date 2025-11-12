#!/bin/bash

# Check Vercel Deployment Status and Health

set -e

PROD_URL="https://dash.dealershipai.com"

echo "🔍 Checking Deployment Status"
echo "=============================="
echo ""

# Check Vercel deployments
echo "📦 Latest Deployments:"
npx vercel ls 2>&1 | head -10

echo ""
echo "🌐 Health Check:"
response=$(curl -s -o /dev/null -w "%{http_code}" "$PROD_URL/api/health" 2>&1 || echo "000")
if [ "$response" = "200" ]; then
    echo "✅ Health endpoint: HTTP $response (Healthy)"
else
    echo "⚠️  Health endpoint: HTTP $response (May still be deploying)"
fi

echo ""
echo "📊 Deployment URLs:"
echo "  Production: $PROD_URL"
echo "  Vercel Dashboard: https://vercel.com/brian-kramer-dealershipai/dealership-ai-dashboard"
echo ""

# Check if deployment is ready
if [ "$response" = "200" ]; then
    echo "✅ Deployment appears ready!"
    echo "   Run smoke tests: ./scripts/smoke-tests.sh $PROD_URL"
else
    echo "⏳ Deployment may still be building..."
    echo "   Check Vercel dashboard for build status"
    echo "   Wait 2-5 minutes and try again"
fi

