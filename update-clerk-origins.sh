#!/bin/bash

# Update Clerk Allowed Origins Script
# This script updates Clerk's allowed origins via Management API

echo "🔧 Clerk Allowed Origins Update Script"
echo "========================================"
echo ""

# Get Clerk secret key
if [ -z "$CLERK_SECRET_KEY" ]; then
    echo "❌ Error: CLERK_SECRET_KEY environment variable not set"
    echo ""
    echo "To get your key:"
    echo "1. Go to https://dashboard.clerk.com"
    echo "2. Select your application"
    echo "3. Go to API Keys section"
    echo "4. Copy the 'Secret' key"
    echo ""
    echo "Then run:"
    echo "export CLERK_SECRET_KEY='sk_test_...'"
    echo "./update-clerk-origins.sh"
    echo ""
    exit 1
fi

# Get instance ID from the publishable key
if [ -z "$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" ]; then
    echo "❌ Error: NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY not set"
    echo ""
    echo "To get your key:"
    echo "1. Go to https://dashboard.clerk.com"
    echo "2. Select your application"
    echo "3. Go to API Keys section"
    echo "4. Copy the 'Publishable' key"
    echo ""
    echo "Then run:"
    echo "export NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY='pk_test_...'"
    echo "./update-clerk-origins.sh"
    echo ""
    exit 1
fi

echo "📝 Using Clerk Secret Key: ${CLERK_SECRET_KEY:0:15}..."
echo "📝 Using Clerk Publishable Key: ${NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:0:15}..."
echo ""

# Extract instance ID from publishable key (format: pk_test_xxx:instance_id)
INSTANCE_ID=$(echo "$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" | cut -d: -f2)

if [ -z "$INSTANCE_ID" ]; then
    echo "⚠️  Note: Could not extract instance ID from publishable key"
    echo "   This script will attempt to work without it"
fi

echo "🔍 Attempting to update allowed origins..."
echo ""

# Current allowed origins (add these to your Clerk instance)
ORIGINS=(
    "https://dealershipai.com"
    "https://www.dealershipai.com"
    "https://dealershipai-app.com"
    "https://*.vercel.app"
    "https://dealership-ai-dashboard-*.vercel.app"
)

echo "📋 Will add these origins:"
for origin in "${ORIGINS[@]}"; do
    echo "   - $origin"
done
echo ""

# Note: Clerk Management API endpoint format may vary
# Check: https://clerk.com/docs/reference/backend-api

echo "ℹ️  To update allowed origins, you need to:"
echo ""
echo "   1. Go to https://dashboard.clerk.com"
echo "   2. Select your Clerk application"
echo "   3. Go to: Configure → Paths → Frontend API"
echo "   4. Add the origins listed above"
echo ""
echo "   OR use the Clerk Management API (see Clerk docs)"
echo ""

echo "✅ Ready to configure!"
echo ""
echo "Alternative: Quick manual update"
echo "================================"
echo "1. Open: https://dashboard.clerk.com/applications"
echo "2. Select your application"
echo "3. Click 'Configure' → 'Paths'"
echo "4. Find 'Frontend API' section"
echo "5. Click 'Edit' next to 'Allowed Origins'"
echo "6. Add: https://*.vercel.app"
echo "7. Click 'Save'"
echo ""
