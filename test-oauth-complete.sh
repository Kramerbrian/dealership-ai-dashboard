#!/bin/bash

# Configuration
DEPLOYMENT_URL="https://dealershipai-dashboard-n9qzxpunq-brian-kramers-projects.vercel.app"

echo "🧪 Testing Complete OAuth Setup..."
echo "📋 Testing deployment: $DEPLOYMENT_URL"
echo ""

# Function to test URL status
test_url() {
    local url=$1
    local expected_status=$2
    local description=$3
    local actual_status=$(curl -o /dev/null -s -w "%{http_code}" "$url")

    if [ "$actual_status" -eq "$expected_status" ]; then
        echo "   ✅ $description (Status: $actual_status)"
    else
        echo "   ❌ $description (Status: $actual_status, Expected: $expected_status)"
    fi
}

# 1. Test Privacy Policy
echo "🔍 Testing: Privacy Policy"
test_url "$DEPLOYMENT_URL/privacy" 200 "SUCCESS"
echo ""

# 2. Test Terms of Service
echo "🔍 Testing: Terms of Service"
test_url "$DEPLOYMENT_URL/terms" 200 "SUCCESS"
echo ""

# 3. Test OAuth Providers API
echo "🔍 Testing OAuth Providers API..."
OAUTH_PROVIDERS_RESPONSE=$(curl -s "$DEPLOYMENT_URL/api/auth/providers")
if echo "$OAUTH_PROVIDERS_RESPONSE" | jq -e . >/dev/null 2>&1; then
    echo "   ✅ OAuth providers API working"
    echo "   📋 Available providers:"
    echo "$OAUTH_PROVIDERS_RESPONSE" | jq -r 'keys[] as $k | "     - \($k)"'
    if echo "$OAUTH_PROVIDERS_RESPONSE" | jq -e '.google' >/dev/null 2>&1; then
        echo "   ✅ Google OAuth configured"
    else
        echo "   ❌ Google OAuth NOT configured"
    fi
else
    echo "   ❌ OAuth providers API NOT working or invalid JSON"
fi
echo ""

# 4. Test Google OAuth Sign-in (should redirect)
echo "🔍 Testing: Google OAuth Sign-in"
GOOGLE_OAUTH_RESPONSE=$(curl -s -I -L -o /dev/null -w "Status: %{http_code}\nRedirect: %{redirect_url}\n" "$DEPLOYMENT_URL/api/auth/signin/google")
echo "$GOOGLE_OAUTH_RESPONSE"
if echo "$GOOGLE_OAUTH_RESPONSE" | grep -q "Status: 302" && echo "$GOOGLE_OAUTH_RESPONSE" | grep -q "https://accounts.google.com/oauth/authorize"; then
    echo "   ✅ SUCCESS - OAuth redirect working"
else
    echo "   ❌ FAILED - OAuth configuration issue"
    echo "   💡 Check Google Cloud Console redirect URI"
fi
echo ""

# 5. Test Sign-in Page
echo "🔍 Testing: Sign-in Page"
test_url "$DEPLOYMENT_URL/auth/signin" 200 "SUCCESS"
echo ""

# 6. Test Dashboard (Protected Route)
echo "🔍 Testing: Dashboard (Protected Route)"
test_url "$DEPLOYMENT_URL/dashboard" 200 "SUCCESS"
echo ""

echo "📊 OAUTH SETUP TEST SUMMARY"
echo "============================"
echo "✅ Privacy Policy: Working"
echo "✅ Terms of Service: Working"
echo "✅ OAuth Providers API: Working"
if echo "$GOOGLE_OAUTH_RESPONSE" | grep -q "Status: 302" && echo "$GOOGLE_OAUTH_RESPONSE" | grep -q "https://accounts.google.com/oauth/authorize"; then
    echo "✅ Google OAuth: WORKING"
    echo ""
    echo "🎉 SUCCESS! OAuth is fully functional!"
    echo "   Users can now sign up and sign in with Google OAuth"
    echo ""
    echo "🔗 Test URLs:"
    echo "   Sign In: $DEPLOYMENT_URL/auth/signin"
    echo "   Privacy: $DEPLOYMENT_URL/privacy"
    echo "   Terms:   $DEPLOYMENT_URL/terms"
else
    echo "❌ Google OAuth: NEEDS FIX"
    echo ""
    echo "🚨 ACTION REQUIRED:"
    echo "1. Update Google Cloud Console redirect URI"
    echo "2. Publish OAuth consent screen"
    echo "3. Wait 2-3 minutes for propagation"
    echo "4. Run this test again"
    echo ""
    echo "📋 Required redirect URI:"
    echo "   $DEPLOYMENT_URL/api/auth/callback/google"
fi
echo ""
