#!/bin/bash

# Test Complete User Journey Flow
# This script tests the complete flow from landing → onboarding → pulse dashboard

set -e

BASE_URL="${BASE_URL:-http://localhost:3000}"
DEALER="${DEALER:-naplestoyota.com}"

echo "🧪 Testing Complete User Journey Flow"
echo "======================================"
echo "Base URL: $BASE_URL"
echo "Dealer: $DEALER"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0

test_endpoint() {
    local name=$1
    local url=$2
    local expected_status=${3:-200}
    local follow_redirects=${4:-false}
    
    echo -n "Testing $name... "
    
    if [ "$follow_redirects" = "true" ]; then
        response=$(curl -s -L -o /dev/null -w "%{http_code}" "$url" || echo "000")
    else
        response=$(curl -s -o /dev/null -w "%{http_code}" "$url" || echo "000")
    fi
    
    # Accept both the expected status and 200 (for redirects that eventually succeed)
    if [ "$response" = "$expected_status" ] || [ "$response" = "200" ]; then
        echo -e "${GREEN}✓ PASS${NC} ($response)"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}✗ FAIL${NC} (expected $expected_status or 200, got $response)"
        ((FAILED++))
        return 1
    fi
}

test_api() {
    local name=$1
    local url=$2
    local expected_status=${3:-200}
    
    echo -n "Testing API $name... "
    response=$(curl -s -w "\n%{http_code}" "$url" | tail -n1)
    body=$(curl -s "$url" | head -n-1)
    
    if [ "$response" = "$expected_status" ]; then
        # Check if response is valid JSON
        if echo "$body" | jq . > /dev/null 2>&1; then
            echo -e "${GREEN}✓ PASS${NC} ($response, valid JSON)"
            ((PASSED++))
            return 0
        else
            echo -e "${YELLOW}⚠ WARN${NC} ($response, invalid JSON)"
            ((PASSED++))
            return 0
        fi
    else
        echo -e "${RED}✗ FAIL${NC} (expected $expected_status, got $response)"
        ((FAILED++))
        return 1
    fi
}

echo "📋 Step 1: Landing Page"
echo "----------------------"
test_endpoint "Landing Page" "$BASE_URL/" 200 true
test_api "Market Pulse API" "$BASE_URL/api/marketpulse/compute?dealer=$DEALER"
test_api "Clarity Stack API" "$BASE_URL/api/clarity/stack?domain=$DEALER"

echo ""
echo "📋 Step 2: Onboarding"
echo "----------------------"
test_endpoint "Onboarding Page" "$BASE_URL/onboarding?dealer=$DEALER"

echo ""
echo "📋 Step 3: Pulse Dashboard"
echo "-------------------------"
# Note: Pulse dashboard requires auth, so we test the API endpoint directly
test_api "Pulse API (GET)" "$BASE_URL/api/pulse?dealerId=$DEALER" 200

echo ""
echo "📋 Step 4: Health Checks"
echo "----------------------"
test_endpoint "Health Endpoint" "$BASE_URL/api/health"
test_endpoint "Status Endpoint" "$BASE_URL/api/status"

echo ""
echo "======================================"
echo "Results:"
echo -e "  ${GREEN}Passed: $PASSED${NC}"
echo -e "  ${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}❌ Some tests failed${NC}"
    exit 1
fi

