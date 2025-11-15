#!/bin/bash

# Production Readiness Verification Script
# Verifies all critical components for 100% production readiness

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASSED=0
FAILED=0
WARNINGS=0

echo "🚀 Production Readiness Verification"
echo "======================================"
echo ""

# Function to test endpoint
test_endpoint() {
    local name=$1
    local url=$2
    local expected_status=${3:-200}
    
    echo -n "Testing $name... "
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url" || echo "000")
    
    if [ "$response" = "$expected_status" ]; then
        echo -e "${GREEN}✓ PASS${NC} ($response)"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}✗ FAIL${NC} (expected $expected_status, got $response)"
        ((FAILED++))
        return 1
    fi
}

# Function to test API response
test_api() {
    local name=$1
    local url=$2
    
    echo -n "Testing $name... "
    
    response=$(curl -s "$url" || echo "ERROR")
    
    if echo "$response" | grep -q "error\|Error\|ERROR"; then
        if echo "$response" | grep -q "Unauthorized"; then
            echo -e "${YELLOW}⚠ WARN${NC} (401 - Auth required, expected)"
            ((WARNINGS++))
            return 0
        else
            echo -e "${RED}✗ FAIL${NC} (Error in response)"
            echo "  Response: $response"
            ((FAILED++))
            return 1
        fi
    else
        echo -e "${GREEN}✓ PASS${NC}"
        ((PASSED++))
        return 0
    fi
}

# Step 1: Test Sign-In Page
echo "📋 Step 1: Sign-In Page"
echo "----------------------"
test_endpoint "Sign-In Page" "https://dash.dealershipai.com/sign-in" 200
echo ""

# Step 2: Test Health Endpoint
echo "📋 Step 2: Health Endpoint"
echo "--------------------------"
test_api "Health Endpoint" "https://dash.dealershipai.com/api/health"
echo ""

# Step 3: Test API Endpoints (may require auth)
echo "📋 Step 3: API Endpoints"
echo "-----------------------"
test_api "Pulse API" "https://dash.dealershipai.com/api/pulse?dealerId=demo-tenant"
test_endpoint "Market Pulse API" "https://dash.dealershipai.com/api/marketpulse/compute?dealer=example.com" 200
echo ""

# Step 4: Test Dashboard Routes
echo "📋 Step 4: Dashboard Routes"
echo "---------------------------"
test_endpoint "Dashboard Root" "https://dash.dealershipai.com" 308
test_endpoint "Onboarding Page" "https://dash.dealershipai.com/onboarding" 200
echo ""

# Summary
echo "======================================"
echo "📊 Verification Summary"
echo "======================================"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${YELLOW}Warnings: $WARNINGS${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All automated checks passed!${NC}"
    echo ""
    echo "Next: Complete browser testing:"
    echo "  1. Open: https://dash.dealershipai.com/sign-in"
    echo "  2. Test sign-in flow"
    echo "  3. Test Pulse dashboard"
    exit 0
else
    echo -e "${RED}❌ Some checks failed. Review errors above.${NC}"
    exit 1
fi

