#!/bin/bash

# Verification script for Clerk allowed origins fix
# Run this after updating Clerk dashboard

echo "🔍 Verifying Clerk Fix"
echo "======================"
echo ""

DEPLOYMENT_URL="https://dealership-ai-dashboard-ircgs9hkt-brian-kramer-dealershipai.vercel.app"

echo "Testing deployment: $DEPLOYMENT_URL"
echo ""

# Check HTTP status
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$DEPLOYMENT_URL")

echo "HTTP Status Code: $HTTP_CODE"
echo ""

if [ "$HTTP_CODE" == "200" ]; then
    echo "✅ SUCCESS! Site is accessible"
    echo "   Clerk allowed origins are working correctly."
elif [ "$HTTP_CODE" == "401" ]; then
    echo "⚠️  Still getting 401 (Unauthorized)"
    echo "   This might be expected if:"
    echo "   - Clerk is still propagating changes (wait 1-2 more minutes)"
    echo "   - The landing page requires authentication (check middleware.ts)"
    echo "   - Allowed origins weren't saved correctly"
    echo ""
    echo "   Check:"
    echo "   1. Did you save changes in Clerk dashboard?"
    echo "   2. Did you wait 2 minutes?"
    echo "   3. Try visiting the URL in your browser to see the actual error"
elif [ "$HTTP_CODE" == "404" ]; then
    echo "❌ 404 Not Found"
    echo "   The deployment might not be active or URL is incorrect"
else
    echo "⚠️  Got HTTP $HTTP_CODE"
    echo "   Check the actual page in your browser to see what's happening"
fi

echo ""
echo "🔍 Checking for 'Invalid host' error..."
echo ""

# Check HTML content for error messages
HTML=$(curl -s "$DEPLOYMENT_URL" 2>/dev/null)

if echo "$HTML" | grep -q "Invalid host"; then
    echo "❌ Found 'Invalid host' error in page"
    echo "   Clerk allowed origins need to be updated"
elif echo "$HTML" | grep -q "host_invalid"; then
    echo "❌ Found 'host_invalid' error"
    echo "   Clerk allowed origins need to be updated"
else
    echo "✅ No 'Invalid host' errors found in page content"
fi

echo ""
echo "📋 Next Steps:"
echo "   1. Visit the URL in your browser:"
echo "      $DEPLOYMENT_URL"
echo ""
echo "   2. Check browser console (F12) for any Clerk errors"
echo ""
echo "   3. If you see 'Invalid host' error:"
echo "      - Double-check Clerk dashboard saved correctly"
echo "      - Wait 2-3 more minutes"
echo "      - Try incognito mode"
echo ""
