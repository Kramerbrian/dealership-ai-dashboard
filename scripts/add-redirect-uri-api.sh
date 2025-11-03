#!/bin/bash

# Add Redirect URI using Google Cloud REST API
# This requires proper authentication and project setup

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

REDIRECT_URI="https://api.workos.com/sso/oauth/callback?client_id=client_01K93QER29GBSGXH7TZR5M9WRG"

echo "🔧 Add Redirect URI via Google Cloud REST API"
echo "=============================================="
echo ""

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}❌ gcloud CLI not found${NC}"
    exit 1
fi

# Get project
PROJECT_ID=$(gcloud config get-value project 2>/dev/null || echo "")
if [ -z "$PROJECT_ID" ]; then
    echo -e "${YELLOW}⚠️  No project set${NC}"
    read -p "Enter project ID: " PROJECT_ID
    gcloud config set project "$PROJECT_ID"
fi

echo -e "${BLUE}Project: $PROJECT_ID${NC}"
echo ""

# Get OAuth client ID
echo "To update via API, we need your OAuth Client ID."
echo "Find it at: https://console.cloud.google.com/apis/credentials"
echo ""
read -p "Enter your OAuth Client ID (numbers only, not the full client ID): " CLIENT_ID_NUM

if [ -z "$CLIENT_ID_NUM" ]; then
    echo -e "${RED}❌ Client ID required${NC}"
    exit 1
fi

# Get access token
echo ""
echo -e "${BLUE}Getting access token...${NC}"
ACCESS_TOKEN=$(gcloud auth print-access-token)

# Get current client configuration
echo -e "${BLUE}Fetching current OAuth client configuration...${NC}"
CLIENT_JSON=$(curl -s -X GET \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    "https://iap.googleapis.com/v1/projects/$PROJECT_ID/iap_oauth/clients/$CLIENT_ID_NUM" \
    2>/dev/null || echo "")

if [ -z "$CLIENT_JSON" ] || echo "$CLIENT_JSON" | grep -q "error"; then
    echo -e "${RED}❌ Failed to fetch client configuration${NC}"
    echo ""
    echo "This might be because:"
    echo "  1. Client ID is incorrect"
    echo "  2. API is not enabled"
    echo "  3. Permissions are insufficient"
    echo ""
    echo "Falling back to manual instructions..."
    echo ""
    echo "Please add the Redirect URI manually:"
    echo "  1. Go to: https://console.cloud.google.com/apis/credentials"
    echo "  2. Click on your OAuth 2.0 Client ID"
    echo "  3. Add: $REDIRECT_URI"
    exit 1
fi

echo -e "${GREEN}✅ Client configuration retrieved${NC}"
echo ""

# Extract current redirect URIs
CURRENT_URIS=$(echo "$CLIENT_JSON" | grep -o '"redirectUris":\[[^]]*\]' || echo '[]')

# Check if URI already exists
if echo "$CURRENT_URIS" | grep -q "$REDIRECT_URI"; then
    echo -e "${GREEN}✅ Redirect URI already exists!${NC}"
    exit 0
fi

echo -e "${YELLOW}⚠️  The gcloud CLI doesn't directly support updating OAuth client redirect URIs.${NC}"
echo ""
echo "The best approach is to use Google Cloud Console:"
echo ""
echo "  1. Go to: https://console.cloud.google.com/apis/credentials"
echo "  2. Click on your OAuth 2.0 Client ID"
echo "  3. Under 'Authorized redirect URIs', click '+ ADD URI'"
echo "  4. Paste: $REDIRECT_URI"
echo "  5. Click 'Save'"
echo ""

read -p "Open Google Cloud Console now? (y/n): " OPEN
if [[ "$OPEN" =~ ^[Yy] ]]; then
    open "https://console.cloud.google.com/apis/credentials"
fi

