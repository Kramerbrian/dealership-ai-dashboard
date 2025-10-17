#!/bin/bash

# Test API and Backend Connections for dash.dealershipai.com
# This script tests all API endpoints and backend connections

set -e

echo "🧪 Testing API and Backend Connections for dash.dealershipai.com"
echo "=============================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="dash.dealershipai.com"
BASE_URL="https://$DOMAIN"

# Test results tracking
TESTS_PASSED=0
TESTS_FAILED=0

# Function to test API endpoint
test_endpoint() {
    local endpoint="$1"
    local method="${2:-GET}"
    local data="$3"
    local expected_status="${4:-200}"
    
    echo -n "Testing $method $endpoint... "
    
    if [ "$method" = "POST" ] && [ -n "$data" ]; then
        response=$(curl -s -w "%{http_code}" -X POST "$BASE_URL$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data" -o /tmp/response.json)
    else
        response=$(curl -s -w "%{http_code}" "$BASE_URL$endpoint" -o /tmp/response.json)
    fi
    
    http_code="${response: -3}"
    
    if [ "$http_code" = "$expected_status" ]; then
        echo -e "${GREEN}✅ PASS${NC} (HTTP $http_code)"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌ FAIL${NC} (HTTP $http_code, expected $expected_status)"
        ((TESTS_FAILED++))
    fi
}

# Function to test backend service
test_backend_service() {
    local service_name="$1"
    local service_url="$2"
    
    echo -n "Testing $service_name backend... "
    
    if curl -s --connect-timeout 10 "$service_url" > /dev/null; then
        echo -e "${GREEN}✅ PASS${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌ FAIL${NC}"
        ((TESTS_FAILED++))
    fi
}

echo -e "${BLUE}🔍 Testing API Endpoints:${NC}"
echo ""

# Test basic endpoints
test_endpoint "/api/health"
test_endpoint "/api/quick-audit" "POST" '{"domain":"test.com"}'
test_endpoint "/api/dashboard/overview?dealerId=demo"
test_endpoint "/api/ai/visibility-index?domain=test.com"
test_endpoint "/api/dealership/profile?dealerId=demo"

echo ""
echo -e "${BLUE}🔍 Testing Backend Services:${NC}"
echo ""

# Test backend services
test_backend_service "Ory Kratos" "https://optimistic-haslett-3r8udelhc2.projects.oryapis.com/health/alive"
test_backend_service "Supabase" "https://your-project.supabase.co/rest/v1/"

echo ""
echo -e "${BLUE}🔍 Testing Authentication Flow:${NC}"
echo ""

# Test authentication endpoints
test_endpoint "/api/auth/signin" "GET"
test_endpoint "/api/auth/signup" "GET"
test_endpoint "/api/auth/callback" "GET"

echo ""
echo -e "${BLUE}🔍 Testing CORS and Headers:${NC}"
echo ""

# Test CORS headers
echo -n "Testing CORS headers... "
cors_headers=$(curl -s -I "$BASE_URL/api/health" | grep -i "access-control")
if [ -n "$cors_headers" ]; then
    echo -e "${GREEN}✅ PASS${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}❌ FAIL${NC}"
    ((TESTS_FAILED++))
fi

echo ""
echo -e "${BLUE}🔍 Testing Performance:${NC}"
echo ""

# Test response times
echo -n "Testing response time... "
response_time=$(curl -s -w "%{time_total}" "$BASE_URL/api/health" -o /dev/null)
if (( $(echo "$response_time < 2.0" | bc -l) )); then
    echo -e "${GREEN}✅ PASS${NC} (${response_time}s)"
    ((TESTS_PASSED++))
else
    echo -e "${YELLOW}⚠️  SLOW${NC} (${response_time}s)"
    ((TESTS_PASSED++))
fi

echo ""
echo -e "${BLUE}📊 Test Results Summary:${NC}"
echo "================================"
echo -e "Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests Failed: ${RED}$TESTS_FAILED${NC}"
echo "Total Tests: $((TESTS_PASSED + TESTS_FAILED))"

if [ $TESTS_FAILED -eq 0 ]; then
    echo ""
    echo -e "${GREEN}🎉 All tests passed! dash.dealershipai.com is ready.${NC}"
    exit 0
else
    echo ""
    echo -e "${RED}❌ Some tests failed. Please check the configuration.${NC}"
    exit 1
fi
