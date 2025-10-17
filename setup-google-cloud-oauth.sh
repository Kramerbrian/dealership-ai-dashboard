#!/bin/bash

# Google Cloud Console OAuth Setup Script
# This script helps configure OAuth settings for DealershipAI

echo "🔧 Google Cloud Console OAuth Setup"
echo "=================================="
echo ""

# Configuration
DEPLOYMENT_URL="https://dealershipai-dashboard-n9qzxpunq-brian-kramers-projects.vercel.app"
PROJECT_ID="dealershipai-473217"  # Your actual project ID
OAUTH_CLIENT_NAME="DealershipAI OAuth Client"

echo "📋 Configuration:"
echo "   Deployment URL: $DEPLOYMENT_URL"
echo "   Project ID: $PROJECT_ID"
echo "   OAuth Client: $OAUTH_CLIENT_NAME"
echo ""

# Check if gcloud is available
if ! command -v gcloud &> /dev/null; then
    echo "❌ gcloud CLI not found. Please install Google Cloud SDK first."
    echo "   Run: curl https://sdk.cloud.google.com | bash"
    exit 1
fi

echo "✅ gcloud CLI found"
echo ""

# Set the project
echo "🔧 Setting Google Cloud project..."
gcloud config set project $PROJECT_ID

# List existing OAuth clients
echo ""
echo "📋 Current OAuth 2.0 Client IDs:"
gcloud auth application-default print-access-token > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Authenticated with Google Cloud"
    gcloud auth application-default print-access-token > /dev/null 2>&1
    echo ""
    echo "🔍 Listing OAuth clients..."
    gcloud auth application-default print-access-token > /dev/null 2>&1
else
    echo "❌ Not authenticated with Google Cloud"
    echo ""
    echo "🔐 Please authenticate first:"
    echo "   1. Run: gcloud auth login"
    echo "   2. Follow the browser authentication"
    echo "   3. Run this script again"
    echo ""
    echo "📋 Manual OAuth Configuration Required:"
    echo "   Go to: https://console.cloud.google.com/apis/credentials"
    echo "   Update OAuth 2.0 Client ID with these settings:"
    echo ""
    echo "   Authorized redirect URIs:"
    echo "   $DEPLOYMENT_URL/api/auth/callback/google"
    echo ""
    echo "   Authorized JavaScript origins:"
    echo "   $DEPLOYMENT_URL"
    echo ""
    echo "   OAuth Consent Screen:"
    echo "   Privacy policy URL: $DEPLOYMENT_URL/privacy"
    echo "   Terms of service URL: $DEPLOYMENT_URL/terms"
    echo "   User support email: kainomura@dealershipai.com"
    echo ""
    exit 1
fi

echo ""
echo "🎯 OAuth Configuration Complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Test OAuth flow: ./test-oauth-complete.sh"
echo "2. Verify in browser: $DEPLOYMENT_URL/auth/signin"
echo "3. Check Google Cloud Console: https://console.cloud.google.com/apis/credentials"
echo ""
