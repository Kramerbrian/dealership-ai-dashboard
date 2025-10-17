#!/bin/bash

# DealershipAI - Facebook OAuth Quick Setup
echo "📘 Facebook OAuth Quick Setup for DealershipAI..."

# Configuration
BASE_URL="https://dealershipai-dashboard-bkyuxcvwc-brian-kramers-projects.vercel.app"
FACEBOOK_REDIRECT_URI="$BASE_URL/api/auth/callback/facebook"

echo "📋 Current deployment: $BASE_URL"
echo "📋 Facebook redirect URI: $FACEBOOK_REDIRECT_URI"

echo ""
echo "🚀 QUICK SETUP STEPS (10 minutes)"
echo "================================="

echo ""
echo "1️⃣ Create Facebook App (5 minutes):"
echo "   Go to: https://developers.facebook.com/apps/"
echo "   Click 'Create App' → 'Consumer'"
echo "   App Name: DealershipAI"
echo "   Contact Email: your-email@example.com"

echo ""
echo "2️⃣ Add Facebook Login (2 minutes):"
echo "   Go to 'Add a Product'"
echo "   Find 'Facebook Login' → 'Set Up'"
echo "   Go to 'Facebook Login' → 'Settings'"
echo "   Add Valid OAuth Redirect URI:"
echo "   $FACEBOOK_REDIRECT_URI"

echo ""
echo "3️⃣ Get Credentials (1 minute):"
echo "   Go to 'Settings' → 'Basic'"
echo "   Copy 'App ID' and 'App Secret'"

echo ""
echo "4️⃣ Update Vercel Environment Variables (2 minutes):"
echo "   Run these commands with your actual credentials:"
echo ""
echo "   # Add Facebook Client ID"
echo "   echo 'YOUR_FACEBOOK_APP_ID' | vercel env add FACEBOOK_CLIENT_ID production"
echo ""
echo "   # Add Facebook Client Secret"
echo "   echo 'YOUR_FACEBOOK_APP_SECRET' | vercel env add FACEBOOK_CLIENT_SECRET production"

echo ""
echo "5️⃣ Configure App Settings:"
echo "   App Domains: dealershipai-dashboard-bkyuxcvwc-brian-kramers-projects.vercel.app"
echo "   Privacy Policy: https://dealershipai.com/privacy"
echo "   Terms of Service: https://dealershipai.com/terms"

echo ""
echo "6️⃣ Test Facebook OAuth:"
echo "   Wait 5 minutes for changes to propagate"
echo "   Run: ./test-facebook-oauth.sh"

echo ""
echo "🧪 Current Facebook OAuth Status:"
echo "   curl -s -w 'Status: %{http_code}\\nRedirect: %{redirect_url}\\n' '$BASE_URL/api/auth/signin/facebook'"

echo ""
echo "🎯 EXPECTED RESULTS AFTER SETUP:"
echo "   Status: 302"
echo "   Redirect: https://www.facebook.com/v18.0/dialog/oauth?client_id=..."
echo "   NOT: /auth/signin?error=facebook"

echo ""
echo "📋 FACEBOOK APP CONFIGURATION CHECKLIST:"
echo "   [ ] App created in Facebook Developers"
echo "   [ ] Facebook Login product added"
echo "   [ ] Valid OAuth Redirect URI configured"
echo "   [ ] App ID and Secret obtained"
echo "   [ ] Vercel environment variables set"
echo "   [ ] App domains configured"

echo ""
echo "🚨 TROUBLESHOOTING:"
echo "   If Facebook OAuth still shows error=facebook:"
echo "   1. Check redirect URI is exact match"
echo "   2. Verify environment variables are set"
echo "   3. Wait 5-10 minutes for propagation"
echo "   4. Check app is not in restricted mode"

echo ""
echo "📞 SUPPORT:"
echo "   Facebook Developers: https://developers.facebook.com/docs/facebook-login"
echo "   Vercel Environment Variables: https://vercel.com/docs/environment-variables"

echo ""
echo "⏰ ETA: 10 minutes to working Facebook OAuth"
echo "🎯 Priority: HIGH - Required for OAuth functionality"
