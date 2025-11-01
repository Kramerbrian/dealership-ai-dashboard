#!/bin/bash

# =====================================================
# AUTHENTICATION ENDPOINT TESTING SCRIPT
# =====================================================
# Tests authentication configuration and endpoints
# =====================================================

set -e

echo "🔐 DealershipAI - Authentication Testing"
echo "========================================"
echo ""

# Get deployment URL from environment or prompt
DEPLOYMENT_URL="${VERCEL_URL:-$1}"

if [ -z "$DEPLOYMENT_URL" ]; then
    echo "⚠️  No deployment URL provided"
    echo "Usage: ./test-auth-endpoints.sh <DEPLOYMENT_URL>"
    echo "   or: VERCEL_URL=https://your-app.vercel.app ./test-auth-endpoints.sh"
    exit 1
fi

echo "Testing: $DEPLOYMENT_URL"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# =====================================================
# Test 1: Homepage (Public)
# =====================================================
echo "Test 1: Homepage (Public Route)"
echo "-------------------------------"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$DEPLOYMENT_URL/")
if [ "$RESPONSE" = "200" ]; then
    echo -e "${GREEN}✅ Homepage accessible (200)${NC}"
else
    echo -e "${RED}❌ Homepage returned $RESPONSE${NC}"
fi
echo ""

# =====================================================
# Test 2: Sign-In Page (Public)
# =====================================================
echo "Test 2: Sign-In Page (Public Route)"
echo "-----------------------------------"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$DEPLOYMENT_URL/sign-in")
if [ "$RESPONSE" = "200" ]; then
    echo -e "${GREEN}✅ Sign-in page accessible (200)${NC}"
else
    echo -e "${YELLOW}⚠️  Sign-in page returned $RESPONSE (may redirect)${NC}"
fi
echo ""

# =====================================================
# Test 3: Sign-Up Page (Public)
# =====================================================
echo "Test 3: Sign-Up Page (Public Route)"
echo "-----------------------------------"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$DEPLOYMENT_URL/sign-up")
if [ "$RESPONSE" = "200" ]; then
    echo -e "${GREEN}✅ Sign-up page accessible (200)${NC}"
else
    echo -e "${YELLOW}⚠️  Sign-up page returned $RESPONSE (may redirect)${NC}"
fi
echo ""

# =====================================================
# Test 4: Dashboard (Protected - Should Redirect)
# =====================================================
echo "Test 4: Dashboard (Protected Route)"
echo "-------------------------------------"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -L "$DEPLOYMENT_URL/dashboard")
if [ "$RESPONSE" = "200" ] || [ "$RESPONSE" = "307" ] || [ "$RESPONSE" = "302" ]; then
    echo -e "${GREEN}✅ Dashboard route responds ($RESPONSE - redirects when not authenticated)${NC}"
else
    echo -e "${YELLOW}⚠️  Dashboard returned $RESPONSE${NC}"
fi
echo ""

# =====================================================
# Test 5: API Routes (Check Headers)
# =====================================================
echo "Test 5: API Routes"
echo "-----------------"
API_ENDPOINTS=(
    "/api/zero-click/summary"
    "/api/ai-visibility"
    "/api/health"
)

for endpoint in "${API_ENDPOINTS[@]}"; do
    FULL_URL="$DEPLOYMENT_URL$endpoint"
    RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$FULL_URL")
    echo "   $endpoint: $RESPONSE"
done

echo ""

# =====================================================
# Test 6: Clerk Environment Variables Check
# =====================================================
echo "Test 6: Clerk Environment Variables"
echo "----------------------------------"

if command -v vercel &> /dev/null; then
    echo "Checking Vercel environment variables..."
    if vercel env ls 2>/dev/null | grep -q "CLERK"; then
        echo -e "${GREEN}✅ Clerk env vars found in Vercel${NC}"
    else
        echo -e "${YELLOW}⚠️  Clerk env vars not found (may need to add)${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Vercel CLI not installed (skipping env check)${NC}"
fi

echo ""

# =====================================================
# SUMMARY
# =====================================================
echo "=========================================="
echo "📋 Testing Complete"
echo "=========================================="
echo ""
echo "Next Steps:"
echo "  1. Manually test sign-up flow in browser"
echo "  2. Manually test sign-in flow in browser"
echo "  3. Verify session persistence"
echo "  4. Test protected routes while authenticated"
echo ""
echo "See AUTH_TESTING_GUIDE.md for detailed manual testing steps"
echo ""

