#!/bin/bash

# Test Google OAuth Integration
# This script tests the Google OAuth setup and provides feedback

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "🧪 Testing Google OAuth Integration"
echo "===================================="
echo ""

# Check if server is running
echo -e "${BLUE}1. Checking Dev Server Status...${NC}"
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null | grep -q "200\|301\|302"; then
    echo -e "   ${GREEN}✅ Dev server is running on http://localhost:3000${NC}"
    SERVER_RUNNING=true
else
    echo -e "   ${RED}❌ Dev server is not running${NC}"
    echo "   Start it with: npm run dev"
    SERVER_RUNNING=false
fi
echo ""

if [ "$SERVER_RUNNING" = false ]; then
    echo "Please start the dev server first: npm run dev"
    exit 1
fi

# Test SSO endpoint
echo -e "${BLUE}2. Testing SSO Endpoint...${NC}"
SSO_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -L "http://localhost:3000/api/auth/sso?provider=GoogleOAuth" 2>/dev/null || echo "000")

if [ "$SSO_RESPONSE" = "307" ] || [ "$SSO_RESPONSE" = "302" ]; then
    echo -e "   ${GREEN}✅ SSO endpoint is redirecting (expected for OAuth flow)${NC}"
    echo -e "   ${BLUE}   Status code: $SSO_RESPONSE (redirect)${NC}"
elif [ "$SSO_RESPONSE" = "500" ]; then
    echo -e "   ${RED}❌ SSO endpoint returned error (500)${NC}"
    echo "   Check: WORKOS_API_KEY and WORKOS_CLIENT_ID are configured"
elif [ "$SSO_RESPONSE" = "000" ]; then
    echo -e "   ${YELLOW}⚠️  Could not connect to SSO endpoint${NC}"
else
    echo -e "   ${YELLOW}⚠️  Unexpected response: $SSO_RESPONSE${NC}"
fi
echo ""

# Test test page
echo -e "${BLUE}3. Testing Test Page...${NC}"
TEST_PAGE_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000/test/google-oauth" 2>/dev/null || echo "000")

if [ "$TEST_PAGE_RESPONSE" = "200" ]; then
    echo -e "   ${GREEN}✅ Test page is accessible${NC}"
    echo -e "   ${BLUE}   Visit: http://localhost:3000/test/google-oauth${NC}"
elif [ "$TEST_PAGE_RESPONSE" = "404" ]; then
    echo -e "   ${YELLOW}⚠️  Test page not found (404)${NC}"
    echo "   The page should be at: app/test/google-oauth/page.tsx"
else
    echo -e "   ${YELLOW}⚠️  Response code: $TEST_PAGE_RESPONSE${NC}"
fi
echo ""

# Summary
echo -e "${BLUE}📋 Test Summary${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ "$SERVER_RUNNING" = true ]; then
    echo -e "${GREEN}✅ Ready to test Google OAuth!${NC}"
    echo ""
    echo "🌐 Test URLs:"
    echo "   1. Test Page:   http://localhost:3000/test/google-oauth"
    echo "   2. Direct SSO:  http://localhost:3000/api/auth/sso?provider=GoogleOAuth"
    echo ""
    echo "📝 Before testing, ensure:"
    echo "   ☐ Redirect URI added to Google Cloud Console"
    echo "   ☐ OAuth consent screen published"
    echo "   ☐ Credentials added to WorkOS Dashboard"
    echo ""
    echo "🔍 If you see errors:"
    echo "   - 'Redirect URI mismatch' → Add URI to Google Cloud Console"
    echo "   - 'Access Blocked' → Publish OAuth app in Google"
    echo "   - 'Invalid Client' → Check credentials in WorkOS Dashboard"
    echo ""
else
    echo -e "${RED}❌ Server not running. Start with: npm run dev${NC}"
fi

echo ""

