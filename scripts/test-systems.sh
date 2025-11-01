#!/bin/bash

# DealershipAI Systems End-to-End Test Script
# Tests all 9 priority systems

set -e

echo "🧪 Testing DealershipAI Systems..."
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BASE_URL="${BASE_URL:-http://localhost:3000}"
TEST_COUNT=0
PASS_COUNT=0
FAIL_COUNT=0

test_endpoint() {
    TEST_COUNT=$((TEST_COUNT + 1))
    local name=$1
    local method=$2
    local endpoint=$3
    local expected_status=$4
    
    echo -n "Testing $name... "
    
    if [ "$method" = "GET" ]; then
        status=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$endpoint" || echo "000")
    else
        status=$(curl -s -o /dev/null -w "%{http_code}" -X "$method" "$BASE_URL$endpoint" || echo "000")
    fi
    
    if [ "$status" = "$expected_status" ]; then
        echo -e "${GREEN}✓ PASS${NC} (Status: $status)"
        PASS_COUNT=$((PASS_COUNT + 1))
    else
        echo -e "${RED}✗ FAIL${NC} (Expected: $expected_status, Got: $status)"
        FAIL_COUNT=$((FAIL_COUNT + 1))
    fi
}

echo "═══════════════════════════════════════════════════════"
echo "  DealershipAI Systems Test Suite"
echo "═══════════════════════════════════════════════════════"
echo ""

# 1. Onboarding Flow
echo "📋 Testing Onboarding Flow..."
test_endpoint "Onboarding Step 1" "GET" "/onboard/step-1" "200"
test_endpoint "Onboarding Step 2" "GET" "/onboard/step-2" "200"
test_endpoint "Onboarding Step 3" "GET" "/onboard/step-3" "200"
test_endpoint "Onboarding Step 4" "GET" "/onboard/step-4" "200"
test_endpoint "URL Validation API" "POST" "/api/onboarding/validate-url" "400"
echo ""

# 2. Email System
echo "📧 Testing Email System..."
test_endpoint "Email Send API" "POST" "/api/emails/send" "400"
echo ""

# 3. Billing Portal
echo "💳 Testing Billing Portal..."
test_endpoint "Billing Page" "GET" "/dashboard/billing" "302"
test_endpoint "Billing Portal API" "POST" "/api/billing/portal" "401"
echo ""

# 4. Analytics
echo "📊 Testing Analytics..."
test_endpoint "Analytics Hook" "GET" "/" "200"
echo ""

# 5. Legal Pages
echo "⚖️  Testing Legal Pages..."
test_endpoint "Terms of Service" "GET" "/legal/terms" "200"
test_endpoint "Privacy Policy" "GET" "/legal/privacy" "200"
test_endpoint "Cookie Policy" "GET" "/legal/cookies" "200"
echo ""

# 6. Admin Panel
echo "🔐 Testing Admin Panel..."
test_endpoint "Admin Dashboard" "GET" "/admin" "302"
test_endpoint "Admin Stats API" "GET" "/api/admin/stats" "401"
test_endpoint "Admin Access Check" "GET" "/api/admin/check-access" "401"
echo ""

# 7. Export/Reporting
echo "📄 Testing Export System..."
test_endpoint "Report Generation API" "POST" "/api/reports/generate" "401"
echo ""

# 8. Webhooks
echo "🔔 Testing Webhook System..."
test_endpoint "Webhook Send API" "POST" "/api/webhooks/send" "401"
test_endpoint "Webhooks Settings" "GET" "/dashboard/settings/webhooks" "302"
echo ""

# 9. Help System
echo "❓ Testing Help System..."
test_endpoint "Help Center" "GET" "/help" "200"
echo ""

# 10. GDPR
echo "🔒 Testing GDPR Compliance..."
test_endpoint "GDPR Export API" "POST" "/api/gdpr/export" "401"
test_endpoint "GDPR Delete API" "POST" "/api/gdpr/delete" "401"
echo ""

# Summary
echo "═══════════════════════════════════════════════════════"
echo "  Test Summary"
echo "═══════════════════════════════════════════════════════"
echo ""
echo -e "Total Tests: ${TEST_COUNT}"
echo -e "${GREEN}Passed: ${PASS_COUNT}${NC}"
echo -e "${RED}Failed: ${FAIL_COUNT}${NC}"
echo ""

if [ $FAIL_COUNT -eq 0 ]; then
    echo -e "${GREEN}✅ All systems operational!${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠️  Some tests failed. Check endpoints and authentication.${NC}"
    exit 1
fi

