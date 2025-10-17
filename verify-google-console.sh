#!/bin/bash

# DealershipAI - Verify Google Cloud Console Configuration
echo "🔍 Verifying Google Cloud Console Configuration..."

# Configuration
BASE_URL="https://dealershipai-dashboard-bkyuxcvwc-brian-kramers-projects.vercel.app"
REQUIRED_REDIRECT_URI="$BASE_URL/api/auth/callback/google"
REQUIRED_JS_ORIGIN="$BASE_URL"

echo "📋 Current deployment: $BASE_URL"
echo "📋 Required redirect URI: $REQUIRED_REDIRECT_URI"
echo "📋 Required JavaScript origin: $REQUIRED_JS_ORIGIN"

echo ""
echo "🔧 GOOGLE CLOUD CONSOLE CHECKLIST"
echo "=================================="

echo ""
echo "1️⃣ Go to Google Cloud Console:"
echo "   https://console.cloud.google.com/apis/credentials"

echo ""
echo "2️⃣ Click on your OAuth 2.0 Client ID"

echo ""
echo "3️⃣ Check 'Authorized redirect URIs' section:"
echo "   ✅ Should include: $REQUIRED_REDIRECT_URI"
echo "   ❌ If missing, ADD it now"

echo ""
echo "4️⃣ Check 'Authorized JavaScript origins' section:"
echo "   ✅ Should include: $REQUIRED_JS_ORIGIN"
echo "   ❌ If missing, ADD it now"

echo ""
echo "5️⃣ Click 'Save' button"

echo ""
echo "6️⃣ Go to OAuth consent screen:"
echo "   https://console.cloud.google.com/apis/credentials/consent"
echo "   ✅ Should be PUBLISHED (not in testing mode)"

echo ""
echo "⏰ After making changes:"
echo "   - Wait 5-10 minutes for changes to propagate"
echo "   - Run: ./test-oauth-after-fix.sh"

echo ""
echo "🧪 Quick Test Commands:"
echo "   # Test Google OAuth"
echo "   curl -s -w 'Status: %{http_code}\\nRedirect: %{redirect_url}\\n' '$BASE_URL/api/auth/signin/google'"
echo ""
echo "   # Test GitHub OAuth"
echo "   curl -s -w 'Status: %{http_code}\\nRedirect: %{redirect_url}\\n' '$BASE_URL/api/auth/signin/github'"

echo ""
echo "🎯 EXPECTED RESULTS AFTER FIX:"
echo "   Status: 302"
echo "   Redirect: https://accounts.google.com/oauth/authorize?client_id=..."
echo "   NOT: /auth/signin?error=google"

echo ""
echo "🚨 COMMON ISSUES:"
echo "   1. Redirect URI not added to Google Cloud Console"
echo "   2. OAuth consent screen not published"
echo "   3. Changes not propagated (wait 5-10 minutes)"
echo "   4. Wrong client ID/secret in environment variables"

echo ""
echo "📞 If still not working after 10 minutes:"
echo "   1. Double-check Google Cloud Console settings"
echo "   2. Verify OAuth consent screen is published"
echo "   3. Check Vercel environment variables"
echo "   4. Try in incognito browser mode"
