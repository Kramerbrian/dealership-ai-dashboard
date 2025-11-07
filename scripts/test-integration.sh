#!/bin/bash

# Integration Testing Script
# Tests all integration points

set -e

BASE_URL="${NEXT_PUBLIC_APP_URL:-http://localhost:3000}"

echo "🧪 Testing DealershipAI Integration"
echo "==================================="
echo "Base URL: $BASE_URL"
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
    local method=$2
    local url=$3
    local data=$4
    
    echo -n "Testing $name... "
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "$url" || echo "000")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$url" || echo "000")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" = "200" ] || [ "$http_code" = "202" ]; then
        echo -e "${GREEN}✓ PASS${NC} (HTTP $http_code)"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}✗ FAIL${NC} (HTTP $http_code)"
        echo "  Response: $body"
        ((FAILED++))
        return 1
    fi
}

# Test 1: Queue Monitoring
echo "1. Queue Monitoring"
test_endpoint "Queue Health" "GET" "$BASE_URL/api/monitoring/queue" ""

# Test 2: Schema Fix (requires auth - will likely fail without auth)
echo ""
echo "2. Schema Fix Endpoint"
echo "   Note: Requires authentication. Testing endpoint availability..."
test_endpoint "Schema Fix" "POST" "$BASE_URL/api/schema/fix" \
    '{"url":"/test","field":"offers.availability","value":"InStock"}'

# Test 3: Evidence Packet (requires auth)
echo ""
echo "3. Evidence Packet"
test_endpoint "Evidence Packet" "POST" "$BASE_URL/api/evidence/packet" \
    '{"sources":["Cars.com"],"scores":{},"issues":[],"cwv":{}}'

# Test 4: Visibility Relevance
echo ""
echo "4. Visibility Relevance"
test_endpoint "Relevance API" "GET" "$BASE_URL/api/visibility/relevance" ""

# Test 5: Core Web Vitals
echo ""
echo "5. Core Web Vitals"
test_endpoint "CWV API" "GET" "$BASE_URL/api/health/cwv" ""

# Test 6: Crawl Errors
echo ""
echo "6. Crawl Errors"
test_endpoint "Crawl API" "GET" "$BASE_URL/api/health/crawl" ""

# Summary
echo ""
echo "==================================="
echo "Test Summary"
echo "==================================="
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All tests passed!${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠️  Some tests failed. This may be expected if:${NC}"
    echo "   - Server is not running"
    echo "   - Authentication is required"
    echo "   - Environment variables not set"
    exit 1
fi

