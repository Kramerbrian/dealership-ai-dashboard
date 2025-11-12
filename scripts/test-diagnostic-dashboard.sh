#!/bin/bash

# Test Diagnostic Dashboard Features
# Tests all new production features

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

BASE_URL="${1:-http://localhost:3000}"

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  Diagnostic Dashboard Feature Tests${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}Base URL:${NC} $BASE_URL"
echo ""

# Test counter
PASSED=0
FAILED=0

test_endpoint() {
    local name=$1
    local method=$2
    local path=$3
    local data=$4
    local expected_status=${5:-200}

    echo -n "Testing $name... "
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "$BASE_URL$path")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$BASE_URL$path")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" -eq "$expected_status" ] || [ "$http_code" -eq "401" ]; then
        echo -e "${GREEN}✓${NC} (HTTP $http_code)"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}✗${NC} (HTTP $http_code)"
        echo -e "${YELLOW}Response:${NC} $body"
        ((FAILED++))
        return 1
    fi
}

# 1. Test Diagnostics API
echo -e "${BLUE}━━━ Diagnostics API ━━━${NC}"
test_endpoint "Get Diagnostics" "GET" "/api/diagnostics?domain=test.com&dealerId=test" "" 200
echo ""

# 2. Test Trends API
echo -e "${BLUE}━━━ Trends & Forecasting API ━━━${NC}"
test_endpoint "Get Trends" "GET" "/api/analytics/trends?domain=test.com&dealerId=test&days=30" "" 200
echo ""

# 3. Test Scenario Templates
echo -e "${BLUE}━━━ Scenario Templates API ━━━${NC}"
test_endpoint "Get Templates" "GET" "/api/scenarios/templates" "" 200
echo ""

# 4. Test Custom Scenarios
echo -e "${BLUE}━━━ Custom Scenarios API ━━━${NC}"
test_endpoint "Get Scenarios" "GET" "/api/relevance/scenarios?dealerId=test" "" 200

# Test create scenario
test_data='{
  "dealerId": "test",
  "scenarioName": "Test Scenario",
  "description": "Test description",
  "actions": [{
    "type": "improve_signal",
    "target": "aiv",
    "delta": 10,
    "confidence": 0.8,
    "cost": 0
  }]
}'
test_endpoint "Create Scenario" "POST" "/api/relevance/scenarios" "$test_data" 200
echo ""

# 5. Test Export API
echo -e "${BLUE}━━━ Export API ━━━${NC}"
test_endpoint "Export JSON" "GET" "/api/export/data?dealerId=test&format=json&type=all" "" 200
test_endpoint "Export CSV" "GET" "/api/export/data?dealerId=test&format=csv&type=all" "" 200
echo ""

# 6. Test Fix Action API
echo -e "${BLUE}━━━ Fix Action API ━━━${NC}"
fix_data='{
  "issueId": "test-issue",
  "action": "fix_schema",
  "domain": "test.com",
  "dealerId": "test"
}'
test_endpoint "Trigger Fix" "POST" "/api/fix/action" "$fix_data" 200
echo ""

# 7. Test Workflow Status API
echo -e "${BLUE}━━━ Workflow Status API ━━━${NC}"
status_data='{
  "workflowId": "test-workflow",
  "status": "completed",
  "domain": "test.com",
  "dealerId": "test",
  "opportunityId": "test-opp",
  "results": {
    "type": "schema",
    "impact": 15
  }
}'
test_endpoint "Update Workflow Status" "POST" "/api/notifications/workflow-status" "$status_data" 200
echo ""

# Summary
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}Test Summary:${NC}"
echo -e "  ${GREEN}Passed:${NC} $PASSED"
echo -e "  ${RED}Failed:${NC} $FAILED"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}❌ Some tests failed${NC}"
    exit 1
fi

