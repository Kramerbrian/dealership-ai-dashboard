#!/bin/bash

# Post-Deployment Verification Script
# Tests all critical endpoints and features

BASE_URL="https://dash.dealershipai.com"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "🔍 DealershipAI Post-Deployment Verification"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test health endpoint
echo "1. Testing Health Endpoint..."
HEALTH=$(curl -s "$BASE_URL/api/health")
if echo "$HEALTH" | grep -q "healthy"; then
    echo -e "${GREEN}✓ Health endpoint: OK${NC}"
    echo "$HEALTH" | jq -r '.checks // .services' 2>/dev/null || echo "$HEALTH"
else
    echo -e "${RED}✗ Health endpoint: FAILED${NC}"
    echo "$HEALTH"
fi
echo ""

# Test public endpoints
echo "2. Testing Public Endpoints..."
ENDPOINTS=(
    "/api/scenarios/templates"
)

for endpoint in "${ENDPOINTS[@]}"; do
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$endpoint")
    if [ "$STATUS" = "200" ] || [ "$STATUS" = "401" ]; then
        echo -e "${GREEN}✓ $endpoint: $STATUS${NC}"
    else
        echo -e "${YELLOW}⚠ $endpoint: $STATUS${NC}"
    fi
done
echo ""

# Test authenticated endpoints (will return 401, which is expected)
echo "3. Testing Authenticated Endpoints (expected: 401)..."
AUTH_ENDPOINTS=(
    "/api/diagnostics?domain=test.com"
    "/api/relevance/overlay?domain=test.com"
    "/api/analytics/trends?domain=test.com"
)

for endpoint in "${AUTH_ENDPOINTS[@]}"; do
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$endpoint")
    if [ "$STATUS" = "401" ]; then
        echo -e "${GREEN}✓ $endpoint: 401 (Auth required)${NC}"
    elif [ "$STATUS" = "200" ]; then
        echo -e "${GREEN}✓ $endpoint: 200 (Working)${NC}"
    else
        echo -e "${YELLOW}⚠ $endpoint: $STATUS${NC}"
    fi
done
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Manual Verification Required:"
echo "  1. Visit: $BASE_URL/dashboard"
echo "  2. Sign in (if needed)"
echo "  3. Verify Diagnostic Dashboard is visible"
echo "  4. Test all interactive features"
echo "  5. Check browser console (F12) for errors"
echo ""
echo "✅ Automated checks complete!"
