#!/bin/bash

# Quick script to open Google Cloud Console for OAuth setup

export PATH="/opt/homebrew/share/google-cloud-sdk/bin:$PATH"
export CLOUDSDK_PYTHON=$(which python3)

PROJECT=$(gcloud config get-value project 2>/dev/null || echo "dealershipai-473217")
REDIRECT_URI=$(cat "$(dirname "$0")/../GOOGLE_OAUTH_REDIRECT_URI_COPY.txt" 2>/dev/null || echo "https://api.workos.com/sso/oauth/callback?client_id=client_01K93QER29GBSGXH7TZR5M9WRG")

echo "🔗 Opening Google Cloud Console..."
echo ""
echo "📋 Redirect URI to add:"
echo "$REDIRECT_URI"
echo ""
echo "Steps after console opens:"
echo "  1. Click your OAuth 2.0 Client ID"
echo "  2. Under 'Authorized redirect URIs', click '+ ADD URI'"
echo "  3. Paste the URI above"
echo "  4. Click 'Save'"
echo ""

open "https://console.cloud.google.com/apis/credentials?project=$PROJECT"

echo "✅ Console opened!"
echo ""
echo "💡 Tip: The Redirect URI is saved in: GOOGLE_OAUTH_REDIRECT_URI_COPY.txt"

