#!/bin/bash

# DealershipAI Cognitive Interface 3.0 - Automated Testing Orchestrator
# Uses CLI and MCP-style testing approach

set -e

BASE_URL="http://localhost:3000"
TEST_RESULTS="test-results-$(date +%Y%m%d-%H%M%S).json"
PASSED=0
FAILED=0
TOTAL=0

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test result tracking
declare -a TEST_RESULTS_ARRAY

print_test() {
    echo -e "${YELLOW}🧪 Testing: $1${NC}"
    TOTAL=$((TOTAL + 1))
}

print_pass() {
    echo -e "${GREEN}✅ PASS: $1${NC}"
    PASSED=$((PASSED + 1))
    TEST_RESULTS_ARRAY+=("{\"test\": \"$1\", \"status\": \"PASS\"}")
}

print_fail() {
    echo -e "${RED}❌ FAIL: $1${NC}"
    FAILED=$((FAILED + 1))
    TEST_RESULTS_ARRAY+=("{\"test\": \"$1\", \"status\": \"FAIL\", \"error\": \"$2\"}")
}

# Check if server is running
check_server() {
    print_test "Server Status"
    if curl -s -f "$BASE_URL" > /dev/null 2>&1; then
        print_pass "Server is running on port 3000"
        return 0
    else
        print_fail "Server is not running" "Could not connect to $BASE_URL"
        echo "💡 Start server with: npm run dev"
        exit 1
    fi
}

# Test landing page
test_landing_page() {
    print_test "Landing Page (/)"
    RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL")
    if [ "$RESPONSE" = "200" ]; then
        print_pass "Landing page returns 200"
    else
        print_fail "Landing page" "Returned status $RESPONSE"
    fi
}

# Test API endpoints
test_api_endpoints() {
    print_test "API: /api/health"
    if curl -s -f "$BASE_URL/api/health" > /dev/null 2>&1; then
        print_pass "Health endpoint accessible"
    else
        print_fail "Health endpoint" "Not accessible or returned error"
    fi

    print_test "API: /api/save-metrics (POST validation)"
    RESPONSE=$(curl -s -X POST "$BASE_URL/api/save-metrics" \
        -H "Content-Type: application/json" \
        -d '{"pvr": "invalid"}' \
        -w "%{http_code}" -o /dev/null)
    if [ "$RESPONSE" = "401" ] || [ "$RESPONSE" = "400" ]; then
        print_pass "Save metrics endpoint validates input (expected 401/400)"
    else
        print_fail "Save metrics validation" "Unexpected status $RESPONSE"
    fi
}

# Test routes exist
test_routes() {
    print_test "Route: /onboarding"
    RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/onboarding")
    if [ "$RESPONSE" = "200" ] || [ "$RESPONSE" = "307" ] || [ "$RESPONSE" = "302" ]; then
        print_pass "Onboarding route exists"
    else
        print_fail "Onboarding route" "Returned status $RESPONSE"
    fi

    print_test "Route: /dashboard/preview"
    RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/dashboard/preview")
    if [ "$RESPONSE" = "200" ] || [ "$RESPONSE" = "307" ] || [ "$RESPONSE" = "302" ]; then
        print_pass "Preview route exists"
    else
        print_fail "Preview route" "Returned status $RESPONSE"
    fi
}

# Test static assets
test_static_assets() {
    print_test "Static Assets"
    if curl -s -f "$BASE_URL/favicon.ico" > /dev/null 2>&1; then
        print_pass "Static assets accessible"
    else
        print_fail "Static assets" "Could not load favicon"
    fi
}

# Test build artifacts
test_build() {
    print_test "Build Artifacts"
    if [ -d ".next" ]; then
        print_pass ".next directory exists"
    else
        print_fail "Build artifacts" ".next directory not found"
    fi
}

# Test TypeScript compilation
test_typescript() {
    print_test "TypeScript Compilation"
    if npm run type-check > /dev/null 2>&1; then
        print_pass "TypeScript compiles without errors"
    else
        print_fail "TypeScript compilation" "Type errors found"
    fi
}

# Generate test report
generate_report() {
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📊 Test Summary"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Total Tests: $TOTAL"
    echo -e "${GREEN}Passed: $PASSED${NC}"
    echo -e "${RED}Failed: $FAILED${NC}"
    
    if [ $FAILED -eq 0 ]; then
        echo -e "${GREEN}✅ All tests passed!${NC}"
        exit 0
    else
        echo -e "${RED}❌ Some tests failed${NC}"
        exit 1
    fi
}

# Main test execution
main() {
    echo "🚀 DealershipAI Cognitive Interface 3.0 - Test Orchestrator"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    check_server
    test_build
    test_typescript
    test_landing_page
    test_routes
    test_api_endpoints
    test_static_assets
    
    generate_report
}

# Run tests
main

