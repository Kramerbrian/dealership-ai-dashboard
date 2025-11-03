#!/bin/bash

# Get WorkOS Redirect URI helper
# This shows you what your Redirect URI should be

WORKOS_CLIENT_ID="client_01K93QER29GBSGXH7TZR5M9WRG"

echo "🔗 WorkOS Google OAuth Redirect URI"
echo "====================================="
echo ""
echo "Your WorkOS Client ID:"
echo "  $WORKOS_CLIENT_ID"
echo ""
echo "Expected Redirect URI (to add to Google Cloud Console):"
echo "  https://api.workos.com/sso/oauth/callback?client_id=$WORKOS_CLIENT_ID"
echo ""
echo "📋 Steps:"
echo "  1. Copy the Redirect URI above"
echo "  2. Go to: https://console.cloud.google.com/apis/credentials"
echo "  3. Click on your OAuth 2.0 Client ID"
echo "  4. Under 'Authorized redirect URIs', click 'Add URI'"
echo "  5. Paste the Redirect URI"
echo "  6. Click 'Save'"
echo ""
echo "✅ Make sure this EXACT URI is in Google Cloud Console!"
echo ""

