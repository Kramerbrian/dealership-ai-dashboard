#!/bin/bash

# Comprehensive Production Testing Script
# Tests all critical features and endpoints

set -e

BASE_URL="${BASE_URL:-https://dealership-ai-dashboard-gm4wob3yq-brian-kramers-projects.vercel.app}"

echo "🚀 Comprehensive Production Verification"
echo "========================================"
echo "Base URL: ${BASE_URL}"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

PASSED=0
FAILED=0
WARNINGS=0

# Test function
test_endpoint() {
    local name=$1
    local url=$2
    local method=${3:-GET}
    local data=${4:-""}
    local expect_auth=${5:-false}
    
    echo -n "  ${name}... "
    
    if [ "$method" = "POST" ] && [ -n "$data" ]; then
        RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$url" \
            -H "Content-Type: application/json" \
            -d "$data" 2>&1)
    else
        RESPONSE=$(curl -s -w "\n%{http_code}" "$url" 2>&1)
    fi
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | head -n-1)
    
    if [ "$HTTP_CODE" -ge 200 ] && [ "$HTTP_CODE" -lt 300 ]; then
        echo -e "${GREEN}✓${NC} (${HTTP_CODE})"
        ((PASSED++))
        return 0
    elif [ "$HTTP_CODE" -eq 401 ] || [ "$HTTP_CODE" -eq 403 ]; then
        if [ "$expect_auth" = "true" ]; then
            echo -e "${GREEN}✓${NC} (${HTTP_CODE} - Auth required, expected)"
            ((PASSED++))
        else
            echo -e "${YELLOW}⚠${NC} (${HTTP_CODE} - Auth required)"
            ((WARNINGS++))
        fi
        return 0
    else
        echo -e "${RED}✗${NC} (${HTTP_CODE})"
        echo "    Response: $(echo "$BODY" | head -1)"
        ((FAILED++))
        return 1
    fi
}

echo -e "${BLUE}1. Environment Variables Check${NC}"
echo "-----------------------------------"
echo "  Go to: https://vercel.com/brian-kramers-projects/dealership-ai-dashboard/settings/environment-variables"
echo "  Verify required variables are set for Production environment"
echo ""

echo -e "${BLUE}2. Public Pages${NC}"
echo "---------------"
test_endpoint "Home Page" "${BASE_URL}/" "GET" "" false
test_endpoint "Pricing Page" "${BASE_URL}/pricing" "GET" "" false
echo ""

echo -e "${BLUE}3. API Endpoints${NC}"
echo "----------------"
test_endpoint "Health Check" "${BASE_URL}/api/health" "GET" "" true
test_endpoint "Redis Diagnostics" "${BASE_URL}/api/diagnostics/redis" "GET" "" false
test_endpoint "Trial Status" "${BASE_URL}/api/trial/status" "GET" "" false
echo ""

echo -e "${BLUE}4. Pricing Page Feature Toggles${NC}"
echo "--------------------------------"
echo "  Manual Test Required:"
echo "  1. Visit: ${BASE_URL}/pricing"
echo "  2. Look for Tier 1 card with 3 buttons:"
echo "     - Schema Fix"
echo "     - Zero-Click Drawer"
echo "     - Mystery Shop"
echo "  3. Click each button and verify success alert"
echo ""

echo -e "${BLUE}5. Redis Pub/Sub System${NC}"
echo "------------------------"
echo -n "  Redis Diagnostics... "
REDIS_RESPONSE=$(curl -s "${BASE_URL}/api/diagnostics/redis" 2>&1)
if echo "$REDIS_RESPONSE" | grep -q "redisUrl"; then
    echo -e "${GREEN}✓${NC}"
    echo "    Status: $(echo "$REDIS_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('status', 'unknown'))" 2>/dev/null || echo "check manually")"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠${NC} (May require auth)"
    ((WARNINGS++))
fi
echo ""

echo -e "${BLUE}6. SSE Real-Time Stream${NC}"
echo "------------------------"
echo "  Test Command:"
echo "    curl -N \"${BASE_URL}/api/realtime/events?dealerId=TEST\""
echo "  Note: May require authentication"
echo ""

echo -e "${BLUE}7. Event Publishing${NC}"
echo "-------------------"
test_endpoint "Test Orchestrator (MSRP)" "${BASE_URL}/api/test/orchestrator" "POST" '{"task":"msrp_sync","dealerId":"TEST"}' false
test_endpoint "Test Orchestrator (AI Scores)" "${BASE_URL}/api/test/orchestrator" "POST" '{"task":"ai_score_recompute","dealerId":"TEST"}' false
echo ""

echo -e "${BLUE}Summary${NC}"
echo "-------"
echo -e "${GREEN}✓ Passed: ${PASSED}${NC}"
echo -e "${YELLOW}⚠ Warnings: ${WARNINGS}${NC}"
if [ $FAILED -gt 0 ]; then
    echo -e "${RED}✗ Failed: ${FAILED}${NC}"
else
    echo -e "${GREEN}✗ Failed: 0${NC}"
fi
echo ""

echo -e "${CYAN}Next Steps:${NC}"
echo "1. Verify environment variables in Vercel dashboard"
echo "2. Test pricing page feature toggles in browser"
echo "3. Monitor Redis Pub/Sub events (if configured)"
echo "4. Test SSE stream with authenticated session"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All automated tests passed!${NC}"
    exit 0
else
    echo -e "${RED}❌ Some tests failed - review above${NC}"
    exit 1
fi

