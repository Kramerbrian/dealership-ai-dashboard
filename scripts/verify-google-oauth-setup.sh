#!/bin/bash

# Verify Google OAuth Setup
# Checks if everything is configured correctly

set -e

echo "🔍 Google OAuth Setup Verification"
echo "==================================="
echo ""

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

WORKOS_CLIENT_ID="client_01K93QEQNK49CEMSNQXAKMYZPZ"
REDIRECT_URI="https://api.workos.com/sso/oauth/callback?client_id=$WORKOS_CLIENT_ID"
GOOGLE_CLIENT_ID="1039185326912-150t42hacgra02kljg4sj59gq8shb42b.apps.googleusercontent.com"

echo -e "${BLUE}📋 Configuration Checklist${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check environment variables
echo -e "${BLUE}1. Environment Variables:${NC}"
if grep -q "WORKOS_CLIENT_ID=$WORKOS_CLIENT_ID" .env.local 2>/dev/null; then
    echo -e "   ${GREEN}✅ WORKOS_CLIENT_ID configured${NC}"
else
    echo -e "   ${YELLOW}⚠️  WORKOS_CLIENT_ID not found in .env.local${NC}"
fi

if grep -q "WORKOS_API_KEY" .env.local 2>/dev/null; then
    echo -e "   ${GREEN}✅ WORKOS_API_KEY configured${NC}"
else
    echo -e "   ${YELLOW}⚠️  WORKOS_API_KEY not found in .env.local${NC}"
fi

if grep -q "GOOGLE.*CLIENT" .env.local 2>/dev/null; then
    echo -e "   ${GREEN}✅ Google OAuth credentials found${NC}"
else
    echo -e "   ${YELLOW}⚠️  Google OAuth credentials not found in .env.local${NC}"
fi

echo ""
echo -e "${BLUE}2. Redirect URI:${NC}"
echo "   $REDIRECT_URI"
echo ""
echo -e "${BLUE}3. Google Cloud Console Checklist:${NC}"
echo -e "   ${YELLOW}☐ Redirect URI added to Google Cloud Console${NC}"
echo -e "      → Should match exactly: $REDIRECT_URI"
echo ""
echo -e "   ${YELLOW}☐ OAuth consent screen published${NC}"
echo -e "      → Status should be 'In production'"
echo ""
echo -e "   ${YELLOW}☐ OAuth client is 'Web application' type${NC}"
echo ""
echo -e "${BLUE}4. WorkOS Dashboard Checklist:${NC}"
echo -e "   ${YELLOW}☐ Google Client ID added: $GOOGLE_CLIENT_ID${NC}"
echo -e "   ${YELLOW}☐ Google Client Secret added${NC}"
echo -e "   ${YELLOW}☐ 'Your app's credentials' selected (not default)${NC}"
echo ""

echo -e "${BLUE}5. Test URLs:${NC}"
echo "   Development: http://localhost:3000/api/auth/sso?provider=GoogleOAuth"
echo "   Test Page:   http://localhost:3000/test/google-oauth"
echo ""

echo -e "${BLUE}6. Quick Links:${NC}"
echo "   WorkOS Dashboard:        https://dashboard.workos.com/"
echo "   Google Cloud Console:     https://console.cloud.google.com/apis/credentials"
echo "   OAuth Consent Screen:    https://console.cloud.google.com/apis/consent"
echo ""

echo -e "${GREEN}✅ Verification Complete!${NC}"
echo ""
echo "Next: Complete the checklist items above, then test the OAuth flow."
echo ""

