#!/bin/bash

# Open all Google OAuth setup pages in your browser

echo "🌐 Opening Google OAuth Setup Pages..."
echo ""

# Detect OS and open URLs appropriately
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    OPEN_CMD="open"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    OPEN_CMD="xdg-open"
else
    # Windows (Git Bash)
    OPEN_CMD="start"
fi

echo "📋 Opening setup pages..."
echo ""

echo "1. Google Cloud Console - Credentials"
$OPEN_CMD "https://console.cloud.google.com/apis/credentials" 2>/dev/null &
sleep 1

echo "2. Google Cloud Console - OAuth Consent Screen"
$OPEN_CMD "https://console.cloud.google.com/apis/consent" 2>/dev/null &
sleep 1

echo "3. WorkOS Dashboard - OAuth Providers"
$OPEN_CMD "https://dashboard.workos.com/" 2>/dev/null &
sleep 1

echo ""
echo "✅ All pages opened!"
echo ""
echo "📝 Your Redirect URI (copy this):"
echo "https://api.workos.com/sso/oauth/callback?client_id=client_01K93QEQNK49CEMSNQXAKMYZPZ"
echo ""
echo "📝 Your Google Client ID:"
echo "1039185326912-150t42hacgra02kljg4sj59gq8shb42b.apps.googleusercontent.com"
echo ""
echo "Follow the steps in: COMPLETE_GOOGLE_OAUTH_STEPS_1-3.md"
echo ""

