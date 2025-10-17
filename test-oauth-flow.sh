#!/bin/bash

# DealershipAI - OAuth Flow Test Script
echo "🧪 Testing OAuth Flow for DealershipAI..."

# Configuration
BASE_URL="https://dealershipai-dashboard-bkyuxcvwc-brian-kramers-projects.vercel.app"
CUSTOM_DOMAIN="https://dealershipai.com"

echo "📋 Testing deployment: $BASE_URL"
echo "📋 Custom domain: $CUSTOM_DOMAIN"

# Function to test OAuth endpoint
test_oauth() {
    local url=$1
    local provider=$2
    local description=$3
    
    echo ""
    echo "🔍 Testing: $description"
    echo "   URL: $url"
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    echo "   Status: $response"
    
    if [ "$response" = "302" ]; then
        echo "   ✅ SUCCESS - OAuth redirect working"
        return 0
    elif [ "$response" = "400" ]; then
        echo "   ❌ FAILED - OAuth configuration issue"
        echo "   💡 Check Google Cloud Console redirect URI"
        return 1
    elif [ "$response" = "200" ]; then
        echo "   ⚠️  UNEXPECTED - Should redirect, not return 200"
        return 1
    else
        echo "   ⚠️  UNEXPECTED STATUS: $response"
        return 1
    fi
}

# Test current deployment
echo "🚀 Testing Current Deployment..."
test_oauth "$BASE_URL/api/auth/signin/google" "google" "Google OAuth (Current Deployment)"
google_result=$?

test_oauth "$BASE_URL/api/auth/signin/github" "github" "GitHub OAuth (Current Deployment)"
github_result=$?

# Test custom domain (if it exists)
echo ""
echo "🌐 Testing Custom Domain..."
custom_google_result=1
custom_github_result=1

# Check if custom domain is accessible
if curl -s -o /dev/null -w "%{http_code}" "$CUSTOM_DOMAIN" | grep -q "200"; then
    echo "   ✅ Custom domain is accessible"
    test_oauth "$CUSTOM_DOMAIN/api/auth/signin/google" "google" "Google OAuth (Custom Domain)"
    custom_google_result=$?
    
    test_oauth "$CUSTOM_DOMAIN/api/auth/signin/github" "github" "GitHub OAuth (Custom Domain)"
    custom_github_result=$?
else
    echo "   ⚠️  Custom domain not yet accessible (DNS propagation in progress)"
fi

# Summary
echo ""
echo "📊 OAUTH TEST SUMMARY"
echo "===================="

if [ $google_result -eq 0 ]; then
    echo "✅ Google OAuth (Current): WORKING"
else
    echo "❌ Google OAuth (Current): NEEDS FIX"
fi

if [ $github_result -eq 0 ]; then
    echo "✅ GitHub OAuth (Current): WORKING"
else
    echo "❌ GitHub OAuth (Current): NEEDS FIX"
fi

if [ $custom_google_result -eq 0 ]; then
    echo "✅ Google OAuth (Custom Domain): WORKING"
elif [ $custom_google_result -eq 1 ] && curl -s -o /dev/null -w "%{http_code}" "$CUSTOM_DOMAIN" | grep -q "200"; then
    echo "❌ Google OAuth (Custom Domain): NEEDS FIX"
else
    echo "⏳ Google OAuth (Custom Domain): WAITING FOR DNS"
fi

if [ $custom_github_result -eq 0 ]; then
    echo "✅ GitHub OAuth (Custom Domain): WORKING"
elif [ $custom_github_result -eq 1 ] && curl -s -o /dev/null -w "%{http_code}" "$CUSTOM_DOMAIN" | grep -q "200"; then
    echo "❌ GitHub OAuth (Custom Domain): NEEDS FIX"
else
    echo "⏳ GitHub OAuth (Custom Domain): WAITING FOR DNS"
fi

# Next steps
echo ""
if [ $google_result -eq 0 ] && [ $github_result -eq 0 ]; then
    echo "🎉 SUCCESS! OAuth is working on current deployment!"
    echo "   Next: Set up custom domain and update OAuth settings"
else
    echo "🚨 ACTION REQUIRED:"
    echo "   1. Update Google Cloud Console redirect URI"
    echo "   2. Wait 5 minutes for changes to propagate"
    echo "   3. Run this test again"
fi

echo ""
echo "🔗 Test URLs:"
echo "   Current: $BASE_URL/auth/signin"
echo "   Custom:  $CUSTOM_DOMAIN/auth/signin"
