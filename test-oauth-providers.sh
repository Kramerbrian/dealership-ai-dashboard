#!/bin/bash

echo "🔍 DealershipAI OAuth Provider Testing"
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test URLs
BASE_URL="https://www.dealershipai.com"
TEST_PAGE="$BASE_URL/test-oauth"
OAUTH_STATUS="$BASE_URL/api/test-oauth"

echo -e "\n${BLUE}1. Testing OAuth Configuration Status${NC}"
echo "----------------------------------------"
curl -s "$OAUTH_STATUS" | jq . 2>/dev/null || echo "Failed to get OAuth status"

echo -e "\n${BLUE}2. Testing OAuth Endpoints${NC}"
echo "----------------------------"

# Test Google OAuth
echo -e "\n${YELLOW}Google OAuth:${NC}"
GOOGLE_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/auth/signin/google")
if [ "$GOOGLE_STATUS" = "302" ]; then
    echo -e "${GREEN}✅ Google OAuth endpoint working (302 redirect)${NC}"
else
    echo -e "${RED}❌ Google OAuth endpoint failed (HTTP $GOOGLE_STATUS)${NC}"
fi

# Test Microsoft OAuth
echo -e "\n${YELLOW}Microsoft OAuth:${NC}"
MICROSOFT_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/auth/signin/azure-ad")
if [ "$MICROSOFT_STATUS" = "302" ]; then
    echo -e "${GREEN}✅ Microsoft OAuth endpoint working (302 redirect)${NC}"
else
    echo -e "${RED}❌ Microsoft OAuth endpoint failed (HTTP $MICROSOFT_STATUS)${NC}"
fi

# Test Facebook OAuth
echo -e "\n${YELLOW}Facebook OAuth:${NC}"
FACEBOOK_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/auth/signin/facebook")
if [ "$FACEBOOK_STATUS" = "302" ]; then
    echo -e "${GREEN}✅ Facebook OAuth endpoint working (302 redirect)${NC}"
else
    echo -e "${RED}❌ Facebook OAuth endpoint failed (HTTP $FACEBOOK_STATUS)${NC}"
fi

echo -e "\n${BLUE}3. Testing OAuth Providers Endpoint${NC}"
echo "--------------------------------------"
curl -s "$BASE_URL/api/auth/providers" | jq . 2>/dev/null || echo "Failed to get providers"

echo -e "\n${BLUE}4. Manual Testing Instructions${NC}"
echo "--------------------------------"
echo -e "${YELLOW}Visit these URLs to test OAuth flows:${NC}"
echo "• OAuth Test Page: $TEST_PAGE"
echo "• Signin Page: $BASE_URL/auth/signin"
echo "• OAuth Status: $OAUTH_STATUS"

echo -e "\n${YELLOW}Expected Behavior:${NC}"
echo "• Click 'Sign in with Google' → Redirects to Google OAuth"
echo "• Click 'Sign in with Microsoft' → Redirects to Microsoft OAuth"
echo "• Click 'Sign in with Facebook' → Redirects to Facebook OAuth"
echo "• After successful auth → Returns with session data"

echo -e "\n${BLUE}5. Environment Variables Check${NC}"
echo "----------------------------------"
echo "Run these commands to check your environment variables:"
echo "vercel env ls | grep -E '(GOOGLE|AZURE|FACEBOOK|NEXTAUTH)'"

echo -e "\n${GREEN}🎉 OAuth testing complete!${NC}"
echo "If any tests failed, check the OAUTH_SETUP_GUIDE.md for configuration steps."
