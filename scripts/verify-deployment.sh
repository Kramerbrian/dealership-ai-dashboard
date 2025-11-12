#!/bin/bash

# DealershipAI Deployment Verification Script
# Verifies configuration and provides testing guidance

set -e

PROD_URL="https://dealership-ai-dashboard-qkaslz71g-brian-kramer-dealershipai.vercel.app"

echo "🔍 DealershipAI Deployment Verification"
echo "======================================="
echo ""
echo "Production URL: $PROD_URL"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}📋 Step 1: Environment Variables${NC}"
echo "Checking Vercel environment variables..."
echo ""

# Check Clerk variables
CLERK_PUBLIC=$(npx vercel env ls 2>&1 | grep -c "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" || echo "0")
CLERK_SECRET=$(npx vercel env ls 2>&1 | grep -c "CLERK_SECRET_KEY" || echo "0")
SIGN_IN_REDIRECT=$(npx vercel env ls 2>&1 | grep "NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL" | head -1 || echo "")
SIGN_UP_REDIRECT=$(npx vercel env ls 2>&1 | grep "NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL" | head -1 || echo "")

if [ "$CLERK_PUBLIC" -gt 0 ]; then
    echo -e "${GREEN}✅ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY - Set${NC}"
else
    echo -e "${RED}❌ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY - Missing${NC}"
fi

if [ "$CLERK_SECRET" -gt 0 ]; then
    echo -e "${GREEN}✅ CLERK_SECRET_KEY - Set${NC}"
else
    echo -e "${RED}❌ CLERK_SECRET_KEY - Missing${NC}"
fi

if [ -n "$SIGN_IN_REDIRECT" ]; then
    echo -e "${GREEN}✅ NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL - Set${NC}"
    echo "   $SIGN_IN_REDIRECT"
else
    echo -e "${YELLOW}⚠️  NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL - Not found${NC}"
fi

if [ -n "$SIGN_UP_REDIRECT" ]; then
    echo -e "${GREEN}✅ NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL - Set${NC}"
    echo "   $SIGN_UP_REDIRECT"
else
    echo -e "${YELLOW}⚠️  NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL - Not found${NC}"
fi

echo ""
echo -e "${BLUE}📋 Step 2: API Endpoints${NC}"
echo "Testing critical API endpoints..."
echo ""

# Test API endpoints
SCAN_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$PROD_URL/api/scan/quick" \
    -H "Content-Type: application/json" \
    -d '{"url":"example.com"}' 2>/dev/null || echo "000")

if [ "$SCAN_STATUS" = "200" ] || [ "$SCAN_STATUS" = "400" ]; then
    echo -e "${GREEN}✅ /api/scan/quick - Working (HTTP $SCAN_STATUS)${NC}"
else
    echo -e "${RED}❌ /api/scan/quick - Failed (HTTP $SCAN_STATUS)${NC}"
fi

WEIGHTS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$PROD_URL/api/formulas/weights" 2>/dev/null || echo "000")
if [ "$WEIGHTS_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ /api/formulas/weights - Working (HTTP $WEIGHTS_STATUS)${NC}"
else
    echo -e "${YELLOW}⚠️  /api/formulas/weights - (HTTP $WEIGHTS_STATUS)${NC}"
fi

echo ""
echo -e "${BLUE}📋 Step 3: Manual Testing Required${NC}"
echo ""
echo "Please test the following in your browser:"
echo ""
echo -e "${YELLOW}1. Landing Page${NC}"
echo "   Visit: $PROD_URL"
echo "   - [ ] Page loads without errors"
echo "   - [ ] URL validation works"
echo "   - [ ] Mobile menu works"
echo ""
echo -e "${YELLOW}2. Sign Up Flow${NC}"
echo "   - [ ] Click 'Get Your Free Report'"
echo "   - [ ] Complete sign up"
echo "   - [ ] Should redirect to /onboarding"
echo ""
echo -e "${YELLOW}3. Onboarding Flow${NC}"
echo "   - [ ] Complete onboarding form"
echo "   - [ ] Should redirect to /dashboard"
echo "   - [ ] Check Clerk metadata updated"
echo ""
echo -e "${YELLOW}4. Clerk Configuration${NC}"
echo "   Go to: https://dashboard.clerk.com"
echo "   Navigate to: Configure → Paths"
echo "   Verify:"
echo "   - [ ] After Sign In: /onboarding"
echo "   - [ ] After Sign Up: /onboarding"
echo ""
echo -e "${BLUE}📋 Step 4: View Logs${NC}"
echo ""
echo "To view deployment logs:"
echo "  npx vercel logs <deployment-id>"
echo ""
echo "Or check in Vercel dashboard:"
echo "  https://vercel.com/brian-kramer-dealershipai/dealership-ai-dashboard"
echo ""
echo -e "${GREEN}✅ Verification script complete!${NC}"
echo ""
echo "Next: Follow MANUAL_TESTING_CHECKLIST.md for detailed testing"

