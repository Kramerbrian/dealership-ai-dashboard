#!/bin/bash

# Google OAuth Setup Helper Script for DealershipAI
# This script guides you through the Google OAuth setup process

set -e

echo "🔐 Google OAuth Setup for DealershipAI"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}Step 1: Get Redirect URI from WorkOS Dashboard${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Open: https://dashboard.workos.com/"
echo "2. Navigate to: Authentication → OAuth providers → Google"
echo "3. Click: 'Manage' button"
echo "4. Look for: 'Redirect URI' section"
echo "5. Copy the Redirect URI (it will look like:"
echo "   https://api.workos.com/sso/oauth/callback?client_id=client_...)"
echo ""
read -p "Press Enter when you have copied the Redirect URI..."
echo ""

echo -e "${BLUE}Step 2: Configure Google Cloud Console${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Open: https://console.cloud.google.com/"
echo "2. Select your project (or create new one)"
echo "3. Go to: APIs & Services → Credentials"
echo "4. Click: 'Create Credentials' → 'OAuth 2.0 Client ID'"
echo ""
echo "If you already have credentials:"
echo "  - Click on your existing OAuth client"
echo "  - Scroll to 'Authorized redirect URIs'"
echo "  - Click 'Add URI'"
echo "  - Paste the Redirect URI from WorkOS Dashboard"
echo "  - Click 'Save'"
echo ""
echo "IMPORTANT: Ensure OAuth consent screen is published!"
echo "  - Go to: APIs & Services → OAuth consent screen"
echo "  - If status shows 'Testing', click 'Publish app'"
echo ""
read -p "Press Enter when Google Cloud Console is configured..."
echo ""

echo -e "${BLUE}Step 3: Get Google Credentials${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "From Google Cloud Console → APIs & Services → Credentials:"
read -p "Enter your Google Client ID: " GOOGLE_CLIENT_ID
read -p "Enter your Google Client Secret: " GOOGLE_CLIENT_SECRET
echo ""

if [ -z "$GOOGLE_CLIENT_ID" ] || [ -z "$GOOGLE_CLIENT_SECRET" ]; then
    echo -e "${YELLOW}⚠️  Credentials not provided. You can add them manually later.${NC}"
    echo ""
else
    echo -e "${BLUE}Step 4: Add Credentials to WorkOS Dashboard${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "1. Go to: https://dashboard.workos.com/"
    echo "2. Navigate to: Authentication → OAuth providers → Google"
    echo "3. Click: 'Manage' button"
    echo "4. Select: 'Your app's credentials' (not default)"
    echo "5. Paste Client ID: $GOOGLE_CLIENT_ID"
    echo "6. Paste Client Secret: $GOOGLE_CLIENT_SECRET"
    echo "7. Click: 'Save'"
    echo ""
    read -p "Press Enter when credentials are saved in WorkOS Dashboard..."
    echo ""
fi

echo -e "${BLUE}Step 5: Test the Flow${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Test Google OAuth in several ways:"
echo ""
echo "Option 1: Direct URL test"
echo "  Open in browser:"
echo "  http://localhost:3000/api/auth/sso?provider=GoogleOAuth"
echo ""
echo "Option 2: Test page"
echo "  Open in browser:"
echo "  http://localhost:3000/test/google-oauth"
echo ""
echo "Option 3: Use the React component"
echo "  Import: import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton'"
echo "  Use: <GoogleSignInButton />"
echo ""

echo -e "${GREEN}✅ Setup Instructions Complete!${NC}"
echo ""
echo "Next: Test the Google OAuth flow and verify it works."
echo ""

