#!/bin/bash

# DealershipAI - OAuth Test After Google Cloud Console Fix
echo "🧪 Testing OAuth after Google Cloud Console fix..."

# Configuration
BASE_URL="https://dealershipai-dashboard-bkyuxcvwc-brian-kramers-projects.vercel.app"

echo "📋 Testing deployment: $BASE_URL"
echo "⏰ Waiting 30 seconds for Google changes to propagate..."
sleep 30

# Function to test OAuth with detailed output
test_oauth_detailed() {
    local url=$1
    local provider=$2
    local description=$3
    
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
        if echo "$redirect_url" | grep -q "accounts.google.com\|github.com"; then
            echo "   ✅ SUCCESS - Redirecting to OAuth provider"
            return 0
        elif echo "$redirect_url" | grep -q "error="; then
            echo "   ❌ FAILED - OAuth configuration error"
            echo "   💡 Check Google Cloud Console redirect URI"
            return 1
        else
            echo "   ⚠️  UNEXPECTED - Unknown redirect"
            return 1
        fi
    elif [ "$status_code" = "400" ]; then
        echo "   ❌ FAILED - Bad request"
        echo "   💡 Check OAuth configuration"
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
else
    echo "   ❌ OAuth providers API not working"
fi

# Test Google OAuth
test_oauth_detailed "$BASE_URL/api/auth/signin/google" "google" "Google OAuth"
google_result=$?

# Test GitHub OAuth
test_oauth_detailed "$BASE_URL/api/auth/signin/github" "github" "GitHub OAuth"
github_result=$?

# Summary
echo ""
echo "📊 OAUTH TEST RESULTS"
echo "===================="

if [ $google_result -eq 0 ]; then
    echo "✅ Google OAuth: WORKING"
else
    echo "❌ Google OAuth: NEEDS FIX"
fi

if [ $github_result -eq 0 ]; then
    echo "✅ GitHub OAuth: WORKING"
else
    echo "❌ GitHub OAuth: NEEDS FIX"
fi

# Next steps
echo ""
if [ $google_result -eq 0 ] && [ $github_result -eq 0 ]; then
    echo "🎉 SUCCESS! OAuth is working!"
    echo "   Next: Test in browser and set up custom domain"
    echo ""
    echo "🔗 Test URLs:"
    echo "   Sign-in: $BASE_URL/auth/signin"
    echo "   Google:  $BASE_URL/api/auth/signin/google"
    echo "   GitHub:  $BASE_URL/api/auth/signin/github"
else
    echo "🚨 ACTION REQUIRED:"
    echo "   1. Update Google Cloud Console redirect URI"
    echo "   2. Wait 5 minutes for changes to propagate"
    echo "   3. Run this test again"
    echo ""
    echo "📋 Required redirect URI:"
    echo "   $BASE_URL/api/auth/callback/google"
fi

echo ""
echo "🧪 Browser Test:"
echo "   1. Go to: $BASE_URL/auth/signin"
echo "   2. Click 'Continue with Google'"
echo "   3. Should redirect to Google OAuth (not error page)"
