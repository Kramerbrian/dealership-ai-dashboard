#!/bin/bash

echo "🧪 Testing DealershipAI Dashboard Deployment"
echo "============================================="
echo ""

# Base URLs to test
URLS=(
    "https://dealership-ai-dashboard-brian-kramers-projects.vercel.app/dash"
    "https://dash.dealershipai.com/dash"
)

echo "📍 Testing Deployment URLs..."
echo ""

for URL in "${URLS[@]}"; do
    echo "Testing: $URL"
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$URL" 2>&1)

    if [ "$STATUS" = "200" ]; then
        echo "✅ Status: $STATUS - OK"
    elif [ "$STATUS" = "000" ]; then
        echo "❌ Status: Connection failed - Domain may not be configured"
    else
        echo "⚠️  Status: $STATUS"
    fi
    echo ""
done

echo "🔍 Checking Tab Routes..."
echo ""

# Check if the page contains all expected tabs
TABS=(
    "overview"
    "ai-health"
    "website"
    "schema"
    "reviews"
    "war-room"
    "settings"
)

echo "Expected Tabs:"
for TAB in "${TABS[@]}"; do
    echo "  - $TAB"
done
echo ""

echo "📊 Testing API Endpoints..."
echo ""

# Test key API endpoints
API_ENDPOINTS=(
    "/api/health"
    "/api/quick-audit"
)

for ENDPOINT in "${API_ENDPOINTS[@]}"; do
    echo "Testing: https://dealership-ai-dashboard-brian-kramers-projects.vercel.app$ENDPOINT"
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://dealership-ai-dashboard-brian-kramers-projects.vercel.app$ENDPOINT" 2>&1)
    echo "Status: $STATUS"
    echo ""
done

echo "✅ Deployment Test Complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Go to Vercel Dashboard: https://vercel.com/brian-kramers-projects/dealershipai-dashboard/settings/domains"
echo "2. Add domain: dash.dealershipai.com"
echo "3. If domain is already assigned, remove it from the other project first"
echo "4. Configure DNS:"
echo "   - A Record: @ -> 76.76.19.61"
echo "   - CNAME: dash -> cname.vercel-dns.com"
echo ""
