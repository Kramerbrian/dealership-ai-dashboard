#!/bin/bash

# DealershipAI - Facebook OAuth Test Script
echo "📘 Testing Facebook OAuth for DealershipAI..."

# Configuration
BASE_URL="https://dealershipai-dashboard-bkyuxcvwc-brian-kramers-projects.vercel.app"

echo "📋 Testing deployment: $BASE_URL"
echo "⏰ Waiting 30 seconds for Facebook changes to propagate..."
sleep 30

# Function to test OAuth with detailed output
test_facebook_oauth() {
    local url=$1
    local description=$2
    
    echo ""
    echo "🔍 Testing: $description"
    echo "   URL: $url"
    
    # Get response with redirect URL
    response=$(curl -s -w "STATUS:%{http_code}|REDIRECT:%{redirect_url}" "$url")
    status_code=$(echo "$response" | grep -o "STATUS:[0-9]*" | cut -d: -f2)
    redirect_url=$(echo "$response" | grep -o "REDIRECT:[^|]*" | cut -d: -f2-)
    
    echo "   📊 Status Code: $status_code"
    echo "   🔗 Redirect URL: $redirect_url"
    
    if [ "$status_code" = "302" ]; then
        if echo "$redirect_url" | grep -q "facebook.com.*dialog/oauth"; then
            echo "   ✅ SUCCESS - Redirecting to Facebook OAuth"
            return 0
        elif echo "$redirect_url" | grep -q "error="; then
            echo "   ❌ FAILED - OAuth configuration error"
            echo "   💡 Check Facebook app configuration"
            return 1
        else
            echo "   ⚠️  UNEXPECTED - Unknown redirect"
            return 1
        fi
    elif [ "$status_code" = "400" ]; then
        echo "   ❌ FAILED - Bad request"
        echo "   💡 Check Facebook app configuration"
        return 1
    else
        echo "   ⚠️  UNEXPECTED STATUS: $status_code"
        return 1
    fi
}

# Test OAuth providers API first
echo ""
echo "🔍 Testing OAuth Providers API..."
providers_response=$(curl -s "$BASE_URL/api/auth/providers")
if echo "$providers_response" | jq . > /dev/null 2>&1; then
    echo "   ✅ OAuth providers API working"
    echo "   📋 Available providers:"
    echo "$providers_response" | jq -r 'keys[]' | sed 's/^/     - /'
    
    # Check if Facebook is configured
    if echo "$providers_response" | jq -r 'keys[]' | grep -q "facebook"; then
        echo "   ✅ Facebook OAuth configured"
    else
        echo "   ❌ Facebook OAuth not configured"
    fi
else
    echo "   ❌ OAuth providers API not working"
fi

# Test Facebook OAuth
test_facebook_oauth "$BASE_URL/api/auth/signin/facebook" "Facebook OAuth"
facebook_result=$?

# Summary
echo ""
echo "📊 FACEBOOK OAUTH TEST RESULTS"
echo "=============================="

if [ $facebook_result -eq 0 ]; then
    echo "✅ Facebook OAuth: WORKING"
else
    echo "❌ Facebook OAuth: NEEDS FIX"
fi

# Next steps
echo ""
if [ $facebook_result -eq 0 ]; then
    echo "🎉 SUCCESS! Facebook OAuth is working!"
    echo "   Next: Test in browser and set up custom domain"
    echo ""
    echo "🔗 Test URLs:"
    echo "   Sign-in: $BASE_URL/auth/signin"
    echo "   Facebook: $BASE_URL/api/auth/signin/facebook"
else
    echo "🚨 ACTION REQUIRED:"
    echo "   1. Set up Facebook app in Facebook Developers"
    echo "   2. Configure Facebook Login product"
    echo "   3. Add redirect URI to Facebook app"
    echo "   4. Update Vercel environment variables"
    echo "   5. Wait 5 minutes for changes to propagate"
    echo "   6. Run this test again"
    echo ""
    echo "📋 Required redirect URI:"
    echo "   $BASE_URL/api/auth/callback/facebook"
fi

echo ""
echo "🧪 Browser Test:"
echo "   1. Go to: $BASE_URL/auth/signin"
echo "   2. Click 'Continue with Facebook'"
echo "   3. Should redirect to Facebook OAuth (not error page)"

echo ""
echo "📘 Facebook App Setup:"
echo "   1. Go to: https://developers.facebook.com/apps/"
echo "   2. Create app or use existing"
echo "   3. Add Facebook Login product"
echo "   4. Configure redirect URI"
echo "   5. Get App ID and Secret"
echo "   6. Update Vercel environment variables"
