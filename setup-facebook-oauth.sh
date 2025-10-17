#!/bin/bash

# DealershipAI - Facebook OAuth Setup Script
echo "📘 Setting up Facebook OAuth for DealershipAI..."

# Configuration
BASE_URL="https://dealershipai-dashboard-bkyuxcvwc-brian-kramers-projects.vercel.app"
FACEBOOK_REDIRECT_URI="$BASE_URL/api/auth/callback/facebook"

echo "📋 Current deployment: $BASE_URL"
echo "📋 Facebook redirect URI: $FACEBOOK_REDIRECT_URI"

echo ""
echo "🔧 FACEBOOK DEVELOPER CONSOLE SETUP"
echo "==================================="

echo ""
echo "1️⃣ Go to Facebook Developers:"
echo "   https://developers.facebook.com/apps/"

echo ""
echo "2️⃣ Create New App (if not exists):"
echo "   - Click 'Create App'"
echo "   - Choose 'Consumer' or 'Business'"
echo "   - App Name: DealershipAI"
echo "   - App Contact Email: your-email@example.com"

echo ""
echo "3️⃣ Add Facebook Login Product:"
echo "   - Go to 'Add a Product'"
echo "   - Find 'Facebook Login' and click 'Set Up'"

echo ""
echo "4️⃣ Configure Facebook Login:"
echo "   - Go to 'Facebook Login' → 'Settings'"
echo "   - Valid OAuth Redirect URIs:"
echo "     ✅ Add: $FACEBOOK_REDIRECT_URI"

echo ""
echo "5️⃣ Get App Credentials:"
echo "   - Go to 'Settings' → 'Basic'"
echo "   - Copy 'App ID' (this is your FACEBOOK_CLIENT_ID)"
echo "   - Copy 'App Secret' (this is your FACEBOOK_CLIENT_SECRET)"

echo ""
echo "6️⃣ Update Vercel Environment Variables:"
echo "   Run these commands:"
echo "   vercel env add FACEBOOK_CLIENT_ID production"
echo "   vercel env add FACEBOOK_CLIENT_SECRET production"

echo ""
echo "7️⃣ Configure App Settings:"
echo "   - App Domains: dealershipai-dashboard-bkyuxcvwc-brian-kramers-projects.vercel.app"
echo "   - Privacy Policy URL: https://dealershipai.com/privacy"
echo "   - Terms of Service URL: https://dealershipai.com/terms"

echo ""
echo "8️⃣ App Review (Optional):"
echo "   - For production use, submit for App Review"
echo "   - For testing, add test users in 'Roles' → 'Test Users'"

echo ""
echo "⏰ After setup:"
echo "   - Wait 5 minutes for changes to propagate"
echo "   - Run: ./test-facebook-oauth.sh"

echo ""
echo "🧪 Test Commands:"
echo "   # Test Facebook OAuth"
echo "   curl -s -w 'Status: %{http_code}\\nRedirect: %{redirect_url}\\n' '$BASE_URL/api/auth/signin/facebook'"

echo ""
echo "🎯 EXPECTED RESULTS:"
echo "   Status: 302"
echo "   Redirect: https://www.facebook.com/v18.0/dialog/oauth?client_id=..."
echo "   NOT: /auth/signin?error=facebook"

echo ""
echo "📋 FACEBOOK OAUTH REQUIREMENTS:"
echo "   ✅ App created in Facebook Developers"
echo "   ✅ Facebook Login product added"
echo "   ✅ Valid OAuth Redirect URI configured"
echo "   ✅ App ID and Secret obtained"
echo "   ✅ Vercel environment variables set"
echo "   ✅ App domains configured"

echo ""
echo "🚨 COMMON ISSUES:"
echo "   1. Redirect URI not added to Facebook app"
echo "   2. App not configured for Facebook Login"
echo "   3. Environment variables not set in Vercel"
echo "   4. App domains not configured"
echo "   5. App in development mode (needs test users)"

echo ""
echo "📞 If Facebook OAuth not working:"
echo "   1. Check Facebook app configuration"
echo "   2. Verify redirect URI is exact match"
echo "   3. Check Vercel environment variables"
echo "   4. Add test users if app in development mode"
echo "   5. Wait for changes to propagate"
