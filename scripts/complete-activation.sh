#!/bin/bash

# Complete Activation Script
# Tests and verifies all components for 100% go-live

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "🚀 Complete Activation Verification"
echo "===================================="
echo ""

PASSED=0
FAILED=0
WARNINGS=0

# Function to test endpoint
test_endpoint() {
    local name=$1
    local url=$2
    local expected_status=${3:-200}
    
    echo -n "Testing $name... "
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null || echo "000")
    
    if [ "$response" = "$expected_status" ] || [ "$response" = "200" ]; then
        echo -e "${GREEN}✓ PASS${NC} (HTTP $response)"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}✗ FAIL${NC} (HTTP $response, expected $expected_status)"
        ((FAILED++))
        return 1
    fi
}

# Function to check env var
check_env_var() {
    local var=$1
    echo -n "Checking $var... "
    
    if vercel env ls 2>&1 | grep -q "$var"; then
        echo -e "${GREEN}✓ SET${NC}"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}✗ MISSING${NC}"
        ((FAILED++))
        return 1
    fi
}

echo -e "${BLUE}📋 Phase 1: Environment Variables${NC}"
echo "-----------------------------------"

check_env_var "NEXT_PUBLIC_SUPABASE_URL"
check_env_var "NEXT_PUBLIC_SUPABASE_ANON_KEY"
check_env_var "SUPABASE_SERVICE_ROLE_KEY"
check_env_var "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"
check_env_var "CLERK_SECRET_KEY"

echo ""
echo -e "${BLUE}📋 Phase 2: Endpoint Testing${NC}"
echo "-----------------------------------"

test_endpoint "Landing Page" "https://dealershipai.com" 200
test_endpoint "Landing Health API" "https://dealershipai.com/api/health" 200
test_endpoint "Sign-In Page" "https://dash.dealershipai.com/sign-in" 200
test_endpoint "Dashboard Root" "https://dash.dealershipai.com" 308

echo ""
echo -e "${BLUE}📋 Phase 3: DNS Verification${NC}"
echo "-----------------------------------"

# Check DNS resolution
echo -n "Checking DNS for dealershipai.com... "
if dig +short dealershipai.com | grep -qE "^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$"; then
    echo -e "${GREEN}✓ RESOLVES${NC}"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠ CHECK MANUALLY${NC}"
    ((WARNINGS++))
fi

echo -n "Checking DNS for dash.dealershipai.com... "
if dig +short dash.dealershipai.com | grep -qE "^[a-z0-9.-]+\.vercel-dns\.com$|^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$"; then
    echo -e "${GREEN}✓ RESOLVES${NC}"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠ CHECK MANUALLY${NC}"
    ((WARNINGS++))
fi

echo ""
echo "===================================="
echo "📊 Summary"
echo "===================================="
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${YELLOW}Warnings: $WARNINGS${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All critical checks passed!${NC}"
    echo ""
    echo "📋 Next: Browser testing"
    echo "  1. Visit: https://dealershipai.com"
    echo "  2. Visit: https://dash.dealershipai.com/sign-in"
    echo "  3. Test sign-in flow"
    exit 0
else
    echo -e "${RED}❌ Some checks failed. Review errors above.${NC}"
    echo ""
    echo "🔧 Fix Steps:"
    echo "  1. Set missing environment variables"
    echo "  2. Configure Clerk Dashboard"
    echo "  3. Verify DNS records"
    echo "  4. Redeploy: vercel --prod"
    exit 1
fi

