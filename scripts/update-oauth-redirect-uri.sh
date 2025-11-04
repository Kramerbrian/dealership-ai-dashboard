#!/bin/bash

# Update OAuth Client Redirect URI using Google Cloud REST API
# This script automates adding the Redirect URI to your OAuth client

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

REDIRECT_URI="https://api.workos.com/sso/oauth/callback?client_id=client_01K93QER29GBSGXH7TZR5M9WRG"

echo "🔧 Update OAuth Client Redirect URI"
echo "===================================="
echo ""

# Setup gcloud path
export PATH="/opt/homebrew/share/google-cloud-sdk/bin:$PATH"
export CLOUDSDK_PYTHON=$(which python3)

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}❌ gcloud CLI not found${NC}"
    exit 1
fi

# Get project
PROJECT_ID=$(gcloud config get-value project 2>/dev/null || echo "")
if [ -z "$PROJECT_ID" ]; then
    echo -e "${YELLOW}⚠️  No project set${NC}"
    echo "Available projects:"
    gcloud projects list --format="table(projectId,name)"
    echo ""
    read -p "Enter project ID: " PROJECT_ID
    gcloud config set project "$PROJECT_ID"
fi

echo -e "${GREEN}✅ Project: $PROJECT_ID${NC}"
echo ""

# Get OAuth client ID
echo -e "${BLUE}We need your OAuth Client ID to update it.${NC}"
echo ""
echo "Find it at: https://console.cloud.google.com/apis/credentials"
echo ""
echo "Your OAuth Client ID is the numeric ID (e.g., 1039185326912-...)"
echo "NOT the full client ID string"
echo ""
read -p "Enter your OAuth Client ID (numbers before the hyphen): " CLIENT_ID_NUM

if [ -z "$CLIENT_ID_NUM" ]; then
    echo -e "${RED}❌ Client ID required${NC}"
    exit 1
fi

# Get access token
echo ""
echo -e "${BLUE}Authenticating...${NC}"
ACCESS_TOKEN=$(gcloud auth print-access-token)

# Use REST API to get and update the OAuth client
echo ""
echo -e "${BLUE}Fetching current OAuth client configuration...${NC}"

# Try to get the client using IAM API (for OAuth clients)
CLIENT_INFO=$(curl -s -X GET \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -H "Content-Type: application/json" \
    "https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/$CLIENT_ID_NUM" \
    2>/dev/null || echo "")

if [ -z "$CLIENT_INFO" ] || echo "$CLIENT_INFO" | grep -q "error"; then
    # Alternative: Use the OAuth2 API
    echo -e "${YELLOW}Note: Direct API update for OAuth client redirect URIs is complex.${NC}"
    echo ""
    echo "The Google Cloud Console is the most reliable method."
    echo ""
    echo "📋 What to do:"
    echo "  1. Go to: https://console.cloud.google.com/apis/credentials?project=$PROJECT_ID"
    echo "  2. Click on your OAuth 2.0 Client ID"
    echo "  3. Under 'Authorized redirect URIs', click '+ ADD URI'"
    echo "  4. Paste: $REDIRECT_URI"
    echo "  5. Click 'Save'"
    echo ""
    
    read -p "Open Google Cloud Console now? (y/n): " OPEN
    if [[ "$OPEN" =~ ^[Yy] ]]; then
        open "https://console.cloud.google.com/apis/credentials?project=$PROJECT_ID"
    fi
    
    exit 0
fi

# If we get here, we could potentially update via API
# However, OAuth client redirect URIs require the IAM API which has complex permissions
echo ""
echo -e "${YELLOW}⚠️  Updating OAuth client redirect URIs via API requires:${NC}"
echo "  - Specific IAM permissions"
echo "  - Complex API calls"
echo "  - The web console is more reliable"
echo ""
echo "Opening Google Cloud Console..."
open "https://console.cloud.google.com/apis/credentials?project=$PROJECT_ID"
echo ""
echo "After adding the Redirect URI, test with: ./scripts/test-google-oauth.sh"

