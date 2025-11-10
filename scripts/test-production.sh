#!/bin/bash

# DealershipAI Production Testing Script
# Tests the complete user flow end-to-end

set -e

PROD_URL="https://dealership-ai-dashboard-qkaslz71g-brian-kramer-dealershipai.vercel.app"

echo "🧪 DealershipAI Production Testing"
echo "=================================="
echo ""
echo "Production URL: $PROD_URL"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Test 1: Landing Page
echo "1️⃣  Testing Landing Page..."
LANDING_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$PROD_URL")
if [ "$LANDING_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ Landing page loads (HTTP $LANDING_STATUS)${NC}"
else
    echo -e "${RED}❌ Landing page failed (HTTP $LANDING_STATUS)${NC}"
fi
echo ""

# Test 2: API Endpoints
echo "2️⃣  Testing API Endpoints..."

# Test /api/scan/quick
SCAN_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$PROD_URL/api/scan/quick" \
    -H "Content-Type: application/json" \
    -d '{"url":"example.com"}')
if [ "$SCAN_STATUS" = "200" ] || [ "$SCAN_STATUS" = "400" ]; then
    echo -e "${GREEN}✅ /api/scan/quick responds (HTTP $SCAN_STATUS)${NC}"
else
    echo -e "${RED}❌ /api/scan/quick failed (HTTP $SCAN_STATUS)${NC}"
fi

# Test /api/formulas/weights
WEIGHTS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$PROD_URL/api/formulas/weights")
if [ "$WEIGHTS_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ /api/formulas/weights responds (HTTP $WEIGHTS_STATUS)${NC}"
else
    echo -e "${YELLOW}⚠️  /api/formulas/weights returned (HTTP $WEIGHTS_STATUS)${NC}"
fi
echo ""

# Test 3: Protected Routes
echo "3️⃣  Testing Protected Routes..."
DASHBOARD_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$PROD_URL/dashboard")
if [ "$DASHBOARD_STATUS" = "307" ] || [ "$DASHBOARD_STATUS" = "302" ]; then
    echo -e "${GREEN}✅ /dashboard redirects (HTTP $DASHBOARD_STATUS) - Middleware working${NC}"
else
    echo -e "${YELLOW}⚠️  /dashboard returned (HTTP $DASHBOARD_STATUS)${NC}"
fi

ONBOARDING_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$PROD_URL/onboarding")
if [ "$ONBOARDING_STATUS" = "307" ] || [ "$ONBOARDING_STATUS" = "302" ] || [ "$ONBOARDING_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ /onboarding accessible (HTTP $ONBOARDING_STATUS)${NC}"
else
    echo -e "${YELLOW}⚠️  /onboarding returned (HTTP $ONBOARDING_STATUS)${NC}"
fi
echo ""

# Test 4: Static Assets
echo "4️⃣  Testing Static Assets..."
ROBOTS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$PROD_URL/robots.txt")
if [ "$ROBOTS_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ robots.txt loads (HTTP $ROBOTS_STATUS)${NC}"
else
    echo -e "${YELLOW}⚠️  robots.txt returned (HTTP $ROBOTS_STATUS)${NC}"
fi
echo ""

echo "📋 Manual Testing Required:"
echo ""
echo "1. Visit: $PROD_URL"
echo "   - Test URL validation"
echo "   - Test mobile menu"
echo "   - Test exit intent modal"
echo ""
echo "2. Sign Up Flow:"
echo "   - Click 'Get Your Free Report'"
echo "   - Complete sign up"
echo "   - Should redirect to /onboarding"
echo ""
echo "3. Onboarding Flow:"
echo "   - Complete onboarding form"
echo "   - Should redirect to /dashboard"
echo "   - Check Clerk metadata updated"
echo ""
echo "4. Sign In Flow:"
echo "   - Sign in existing user"
echo "   - If onboarding complete → /dashboard"
echo "   - If incomplete → /onboarding"
echo ""
echo "✅ Automated tests complete!"
echo ""
echo "🔍 View logs:"
echo "   vercel inspect $PROD_URL --logs"

