#!/bin/bash

# Add Redirect URI to Google OAuth Client using gcloud CLI
# This automates adding the Redirect URI to Google Cloud Console

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

REDIRECT_URI="https://api.workos.com/sso/oauth/callback?client_id=client_01K93QER29GBSGXH7TZR5M9WRG"

echo "🔧 Google Cloud CLI - Add Redirect URI"
echo "======================================"
echo ""

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}❌ gcloud CLI not found${NC}"
    echo ""
    echo "Install it with:"
    echo "  brew install --cask google-cloud-sdk"
    echo ""
    echo "OR visit: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

echo -e "${GREEN}✅ gcloud CLI found${NC}"
echo ""

# Check if authenticated
echo -e "${BLUE}Checking authentication...${NC}"
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" 2>/dev/null | grep -q .; then
    echo -e "${YELLOW}⚠️  Not authenticated${NC}"
    echo "Running: gcloud auth login"
    gcloud auth login
else
    ACTIVE_ACCOUNT=$(gcloud auth list --filter=status:ACTIVE --format="value(account)" | head -1)
    echo -e "${GREEN}✅ Authenticated as: $ACTIVE_ACCOUNT${NC}"
fi
echo ""

# Get current project
echo -e "${BLUE}Getting current project...${NC}"
CURRENT_PROJECT=$(gcloud config get-value project 2>/dev/null || echo "")

if [ -z "$CURRENT_PROJECT" ]; then
    echo -e "${YELLOW}⚠️  No project set${NC}"
    echo "Available projects:"
    gcloud projects list --format="table(projectId,name)" || true
    echo ""
    read -p "Enter project ID: " CURRENT_PROJECT
    gcloud config set project "$CURRENT_PROJECT"
else
    echo -e "${GREEN}✅ Current project: $CURRENT_PROJECT${NC}"
fi
echo ""

# List OAuth clients
echo -e "${BLUE}Finding OAuth 2.0 Clients...${NC}"
echo ""

# Get OAuth clients
OAUTH_CLIENTS=$(gcloud alpha iap oauth-clients list --format="value(name)" 2>/dev/null || \
    echo "")

# Try alternative method to get OAuth clients
if [ -z "$OAUTH_CLIENTS" ]; then
    echo -e "${YELLOW}Using alternative method to find OAuth clients...${NC}"
    echo ""
    echo "Please select your OAuth Client ID from Google Cloud Console:"
    echo "https://console.cloud.google.com/apis/credentials"
    echo ""
    read -p "Enter your OAuth Client ID (full ID): " CLIENT_ID
else
    echo "OAuth clients found:"
    echo "$OAUTH_CLIENTS" | nl
    echo ""
    read -p "Select client number (or enter full Client ID): " SELECTION
    
    if [[ "$SELECTION" =~ ^[0-9]+$ ]]; then
        CLIENT_ID=$(echo "$OAUTH_CLIENTS" | sed -n "${SELECTION}p")
    else
        CLIENT_ID="$SELECTION"
    fi
fi

if [ -z "$CLIENT_ID" ]; then
    echo -e "${RED}❌ Client ID required${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}Adding Redirect URI...${NC}"
echo "Redirect URI: $REDIRECT_URI"
echo "Client ID: $CLIENT_ID"
echo ""

# Note: gcloud doesn't have a direct command to update OAuth client redirect URIs
# We'll need to use the REST API or provide instructions
echo -e "${YELLOW}Note: gcloud CLI has limited support for updating OAuth client redirect URIs.${NC}"
echo ""
echo "You have two options:"
echo ""
echo "Option 1: Use Google Cloud Console (Recommended)"
echo "  1. Go to: https://console.cloud.google.com/apis/credentials"
echo "  2. Click on Client ID: $CLIENT_ID"
echo "  3. Under 'Authorized redirect URIs', click '+ ADD URI'"
echo "  4. Paste: $REDIRECT_URI"
echo "  5. Click 'Save'"
echo ""
echo "Option 2: Use REST API (Advanced)"
echo "  We can create a script to use the REST API if needed."
echo ""

read -p "Would you like to open Google Cloud Console? (y/n): " OPEN_CONSOLE
if [[ "$OPEN_CONSOLE" =~ ^[Yy] ]]; then
    open "https://console.cloud.google.com/apis/credentials"
fi

echo ""
echo -e "${GREEN}✅ Setup script complete${NC}"
echo ""
echo "After adding the Redirect URI, test with:"
echo "  ./scripts/test-google-oauth.sh"

