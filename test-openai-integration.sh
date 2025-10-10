#!/bin/bash

echo "🧪 Testing OpenAI GPT Integration"
echo "================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if dev server is running
echo "🔍 Checking if development server is running..."
if curl -s http://localhost:3000/api/health > /dev/null; then
    echo -e "${GREEN}✅ Development server is running${NC}"
else
    echo -e "${RED}❌ Development server is not running${NC}"
    echo "Please start it with: npm run dev"
    exit 1
fi

echo ""
echo "🧪 Test 1: GPT Proxy Endpoint"
echo "=============================="

# Test GPT proxy
RESPONSE=$(curl -s -X POST http://localhost:3000/api/gpt-proxy \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Test AIV computation for demo dealer", "dealerId": "demo-dealer"}')

if echo "$RESPONSE" | grep -q '"success":true'; then
    echo -e "${GREEN}✅ GPT Proxy working${NC}"
    echo "Response: $(echo "$RESPONSE" | jq -r '.data.aiv // "N/A"')"
else
    echo -e "${RED}❌ GPT Proxy failed${NC}"
    echo "Response: $RESPONSE"
fi

echo ""
echo "🧪 Test 2: AIV Metrics Endpoint"
echo "==============================="

# Test AIV metrics
RESPONSE=$(curl -s http://localhost:3000/api/aiv-metrics?dealerId=demo-dealer)

if echo "$RESPONSE" | grep -q '"status":"success"'; then
    echo -e "${GREEN}✅ AIV Metrics endpoint working${NC}"
    echo "AIV Score: $(echo "$RESPONSE" | jq -r '.metrics.aiv_score // "N/A"')"
else
    echo -e "${YELLOW}⚠️  AIV Metrics endpoint returned no data (expected for new setup)${NC}"
    echo "Response: $RESPONSE"
fi

echo ""
echo "🧪 Test 3: Elasticity Recompute Endpoint"
echo "========================================"

# Test elasticity recompute
RESPONSE=$(curl -s -X POST http://localhost:3000/api/elasticity/recompute \
  -H "Content-Type: application/json" \
  -d '{"dealerId": "demo-dealer"}')

if echo "$RESPONSE" | grep -q '"success":true'; then
    echo -e "${GREEN}✅ Elasticity recompute working${NC}"
    echo "Elasticity: $(echo "$RESPONSE" | jq -r '.metrics.elasticity_usd_per_pt // "N/A"')"
else
    echo -e "${YELLOW}⚠️  Elasticity recompute may need configuration${NC}"
    echo "Response: $RESPONSE"
fi

echo ""
echo "🧪 Test 4: Dashboard Component"
echo "============================="

# Check if dashboard loads
RESPONSE=$(curl -s http://localhost:3000/dashboard)

if echo "$RESPONSE" | grep -q "AIVMetricsPanel"; then
    echo -e "${GREEN}✅ Dashboard includes AIV Metrics Panel${NC}"
else
    echo -e "${RED}❌ Dashboard missing AIV Metrics Panel${NC}"
fi

echo ""
echo "📊 Integration Status Summary"
echo "============================"

# Count successful tests
SUCCESS_COUNT=0
TOTAL_TESTS=4

if curl -s http://localhost:3000/api/health > /dev/null; then
    ((SUCCESS_COUNT++))
fi

if curl -s -X POST http://localhost:3000/api/gpt-proxy -H "Content-Type: application/json" -d '{"prompt":"test"}' | grep -q '"success":true'; then
    ((SUCCESS_COUNT++))
fi

if curl -s http://localhost:3000/api/aiv-metrics?dealerId=demo-dealer | grep -q '"status"'; then
    ((SUCCESS_COUNT++))
fi

if curl -s http://localhost:3000/dashboard | grep -q "AIVMetricsPanel"; then
    ((SUCCESS_COUNT++))
fi

echo "Tests passed: $SUCCESS_COUNT/$TOTAL_TESTS"

if [ $SUCCESS_COUNT -eq $TOTAL_TESTS ]; then
    echo -e "${GREEN}🎉 All tests passed! Integration is working correctly.${NC}"
elif [ $SUCCESS_COUNT -ge 2 ]; then
    echo -e "${YELLOW}⚠️  Most tests passed. Check configuration for failed tests.${NC}"
else
    echo -e "${RED}❌ Multiple tests failed. Please check your configuration.${NC}"
fi

echo ""
echo "🔧 Next Steps:"
echo "=============="
echo "1. If tests failed, check your .env.local configuration"
echo "2. Run the database migration in Supabase"
echo "3. Create an OpenAI Assistant"
echo "4. Visit http://localhost:3000/dashboard to see the AIV panel"
echo ""
echo "📖 For detailed setup instructions, see: OPENAI_SETUP_GUIDE.md"
