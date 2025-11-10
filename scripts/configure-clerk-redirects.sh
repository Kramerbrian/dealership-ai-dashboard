#!/bin/bash

# Clerk Redirects Configuration Helper
# This script helps you configure Clerk redirects via the dashboard

echo "🔐 Clerk Redirects Configuration Helper"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "📋 To configure Clerk redirects:"
echo ""
echo "1. Go to Clerk Dashboard:"
echo "   https://dashboard.clerk.com/"
echo ""
echo "2. Select your application"
echo ""
echo "3. Navigate to:"
echo "   Configure → Paths"
echo "   OR"
echo "   Settings → Paths"
echo ""
echo "4. Set these redirect URLs:"
echo ""
echo "   ✅ After Sign In:"
echo "      /onboarding"
echo ""
echo "   ✅ After Sign Up:"
echo "      /onboarding"
echo ""
echo "   ✅ Sign In URL:"
echo "      /sign-in"
echo ""
echo "   ✅ Sign Up URL:"
echo "      /sign-up"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "💡 Alternative: Use Clerk API"
echo ""
echo "If you have Clerk API access, you can configure via API:"
echo ""
echo "curl -X PATCH https://api.clerk.com/v1/applications/{app_id} \\"
echo "  -H 'Authorization: Bearer {api_key}' \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{"
echo "    \"paths\": {"
echo "      \"after_sign_in_url\": \"/onboarding\","
echo "      \"after_sign_up_url\": \"/onboarding\""
echo "    }"
echo "  }'"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
read -p "Press Enter to open Clerk Dashboard in browser..." -n 1 -r
echo ""

# Try to open browser (macOS)
if command -v open &> /dev/null; then
    open "https://dashboard.clerk.com/"
    echo "✅ Opened Clerk Dashboard in browser"
elif command -v xdg-open &> /dev/null; then
    xdg-open "https://dashboard.clerk.com/"
    echo "✅ Opened Clerk Dashboard in browser"
else
    echo "⚠️  Please manually open: https://dashboard.clerk.com/"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Configuration helper complete!"
echo ""
echo "After configuring redirects:"
echo "1. Test sign up flow"
echo "2. Verify redirect to /onboarding"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

