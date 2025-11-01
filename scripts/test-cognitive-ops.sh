#!/bin/bash

# DealershipAI Cognitive Ops Testing Script
# Tests Orchestrator 3.0, Mystery Shop, HAL Chat, and Status Monitoring

set -e

BASE_URL="${1:-http://localhost:3000}"
DEALER_ID="demo-dealer-123"
DOMAIN="terryreidhyundai.com"

echo "🧠 DealershipAI Cognitive Ops Platform - Testing Suite"
echo "=================================================="
echo "Base URL: $BASE_URL"
echo "Dealer ID: $DEALER_ID"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0

# Test function
test_endpoint() {
    local name=$1
    local method=$2
    local endpoint=$3
    local data=$4
    
    echo -n "Testing $name... "
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL$endpoint" \
            -H "Content-Type: application/json" 2>&1)
    else
        response=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data" 2>&1)
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" = "200" ] || [ "$http_code" = "201" ]; then
        echo -e "${GREEN}✓ PASS${NC} (HTTP $http_code)"
        ((PASSED++))
        echo "  Response: $(echo "$body" | head -c 200)..."
    else
        echo -e "${RED}✗ FAIL${NC} (HTTP $http_code)"
        ((FAILED++))
        echo "  Error: $body"
    fi
    echo ""
}

# 1. Test Orchestrator Status (GET)
echo "1️⃣  Testing Orchestrator 3.0 Status..."
test_endpoint "Orchestrator Status" "GET" "/api/orchestrator?dealerId=$DEALER_ID"

# 2. Test Analyze Visibility
echo "2️⃣  Testing Analyze Visibility..."
test_endpoint "Analyze Visibility" "POST" "/api/orchestrator" \
    "{\"action\":\"analyze_visibility\",\"dealerId\":\"$DEALER_ID\",\"domain\":\"$DOMAIN\"}"

# 3. Test Compute QAI
echo "3️⃣  Testing Compute QAI..."
test_endpoint "Compute QAI" "POST" "/api/orchestrator" \
    "{\"action\":\"compute_qai\",\"dealerId\":\"$DEALER_ID\",\"context\":{\"currentScore\":75}}"

# 4. Test Calculate OCI
echo "4️⃣  Testing Calculate OCI..."
test_endpoint "Calculate OCI" "POST" "/api/orchestrator" \
    "{\"action\":\"calculate_oci\",\"dealerId\":\"$DEALER_ID\",\"context\":{\"monthlySales\":100000,\"visibility\":65}}"

# 5. Test Generate ASR
echo "5️⃣  Testing Generate ASR..."
test_endpoint "Generate ASR" "POST" "/api/orchestrator" \
    "{\"action\":\"generate_asr\",\"dealerId\":\"$DEALER_ID\",\"context\":{\"scores\":{\"aiv\":70,\"qai\":75}}}"

# 6. Test Analyze UGC
echo "6️⃣  Testing Analyze UGC..."
test_endpoint "Analyze UGC" "POST" "/api/orchestrator" \
    "{\"action\":\"analyze_ugc\",\"dealerId\":\"$DEALER_ID\",\"parameters\":{\"platforms\":[\"google\",\"yelp\"]}}"

# 7. Test Mystery Shop Script (GET)
echo "7️⃣  Testing Mystery Shop Script..."
test_endpoint "Mystery Shop Script" "GET" "/api/mystery-shop?dealerId=$DEALER_ID&scenario=full"

# 8. Test Mystery Shop Execution (POST)
echo "8️⃣  Testing Mystery Shop Execution..."
test_endpoint "Mystery Shop Execution" "POST" "/api/mystery-shop" \
    "{\"dealerId\":\"$DEALER_ID\",\"scenario\":\"full\",\"modelCategory\":\"luxury\",\"storePersona\":\"high-volume\"}"

# Summary
echo "=================================================="
echo "Test Summary:"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}❌ Some tests failed. Check output above.${NC}"
    exit 1
fi

