#!/bin/bash

# Visual Testing Automation Script
# Helps automate some visual testing checks

echo "🧪 DealershipAI Dashboard Visual Testing"
echo "========================================"
echo ""

# Check if dev server is running
echo "📡 Checking if dev server is running..."
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Dev server is running"
else
    echo "❌ Dev server is not running"
    echo "   Please start it with: npm run dev"
    exit 1
fi

echo ""
echo "🔍 Testing API Endpoints..."
echo ""

# Test endpoints
ENDPOINTS=(
    "/api/health"
    "/api/dashboard/overview?dealerId=test&timeRange=30d"
    "/api/visibility/seo?domain=dealershipai.com&timeRange=30d"
    "/api/dashboard/ai-health?timeRange=30d"
)

PASSED=0
FAILED=0

for endpoint in "${ENDPOINTS[@]}"; do
    response=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000$endpoint")
    if [ "$response" -eq 200 ] || [ "$response" -eq 401 ]; then
        echo "✅ $endpoint - HTTP $response"
        ((PASSED++))
    else
        echo "❌ $endpoint - HTTP $response"
        ((FAILED++))
    fi
done

echo ""
echo "📊 Results:"
echo "   Passed: $PASSED"
echo "   Failed: $FAILED"
echo ""

if [ $FAILED -eq 0 ]; then
    echo "✅ All endpoint tests passed!"
    echo ""
    echo "🌐 Open http://localhost:3000/dashboard in your browser"
    echo "📋 Follow the checklist in scripts/visual-testing-checklist.md"
else
    echo "⚠️  Some endpoints failed. Check the dev server logs."
fi

echo ""
echo "💡 Tips:"
echo "   - Open DevTools (F12) to check Network and Console"
echo "   - Use Lighthouse for performance audit"
echo "   - Test on mobile devices or use browser DevTools device emulation"

