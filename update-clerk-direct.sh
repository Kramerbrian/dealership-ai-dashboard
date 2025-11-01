#!/bin/bash

# Direct Clerk Allowed Origins Update
# Uses the correct API endpoint structure

echo "🔧 Clerk Allowed Origins Update (Direct API)"
echo "============================================="
echo ""

# Load from .env.local
if [ -f .env.local ]; then
    export $(grep -v '^#' .env.local | xargs)
fi

if [ -z "$CLERK_SECRET_KEY" ]; then
    echo "❌ CLERK_SECRET_KEY not found in .env.local"
    exit 1
fi

echo "✅ Using Clerk Secret Key: ${CLERK_SECRET_KEY:0:20}..."
echo ""

# Get current instance
echo "🔍 Fetching current configuration..."
CURRENT=$(curl -s \
    -X GET "https://api.clerk.com/v1/instance" \
    -H "Authorization: Bearer $CLERK_SECRET_KEY" \
    -H "Content-Type: application/json")

echo "Current configuration:"
echo "$CURRENT" | jq '.' 2>/dev/null || echo "$CURRENT"
echo ""

# Try different API structures based on Clerk's actual API
# Option 1: Direct allowed_origins field
echo "🔄 Attempting update method 1: Direct allowed_origins..."
UPDATE1=$(curl -s -w "\n%{http_code}" \
    -X PATCH "https://api.clerk.com/v1/instance" \
    -H "Authorization: Bearer $CLERK_SECRET_KEY" \
    -H "Content-Type: application/json" \
    -d '{
        "allowed_origins": [
            "https://*.vercel.app",
            "https://dealership-ai-dashboard-*.vercel.app"
        ]
    }')

HTTP1=$(echo "$UPDATE1" | tail -n1)
BODY1=$(echo "$UPDATE1" | sed '$d')

if [ "$HTTP1" == "200" ] || [ "$HTTP1" == "204" ]; then
    echo "✅ Method 1: Success (HTTP $HTTP1)"
    echo "$BODY1" | jq '.' 2>/dev/null || echo "$BODY1"
    echo ""
    
    # Verify
    echo "🔍 Verifying update..."
    sleep 2
    VERIFY=$(curl -s \
        -X GET "https://api.clerk.com/v1/instance" \
        -H "Authorization: Bearer $CLERK_SECRET_KEY")
    
    ORIGINS=$(echo "$VERIFY" | jq -r '.allowed_origins[]?' 2>/dev/null)
    if [ -n "$ORIGINS" ]; then
        echo "✅ Updated allowed origins:"
        echo "$ORIGINS" | while read -r origin; do
            echo "   - $origin"
        done
    fi
    exit 0
fi

echo "⚠️  Method 1 failed (HTTP $HTTP1)"
echo ""

# Option 2: frontend_api.allowed_origins
echo "🔄 Attempting update method 2: frontend_api.allowed_origins..."
UPDATE2=$(curl -s -w "\n%{http_code}" \
    -X PATCH "https://api.clerk.com/v1/instance" \
    -H "Authorization: Bearer $CLERK_SECRET_KEY" \
    -H "Content-Type: application/json" \
    -d '{
        "frontend_api": {
            "allowed_origins": [
                "https://*.vercel.app",
                "https://dealership-ai-dashboard-*.vercel.app"
            ]
        }
    }')

HTTP2=$(echo "$UPDATE2" | tail -n1)
BODY2=$(echo "$UPDATE2" | sed '$d')

if [ "$HTTP2" == "200" ] || [ "$HTTP2" == "204" ]; then
    echo "✅ Method 2: Success (HTTP $HTTP2)"
    exit 0
fi

echo "❌ Both API methods failed"
echo ""
echo "💡 Clerk Management API may not support programmatic updates for allowed origins"
echo ""
echo "📋 Please use the Clerk Dashboard instead:"
echo "   1. Go to: https://dashboard.clerk.com"
echo "   2. Select your application"
echo "   3. Configure → Paths → Frontend API"
echo "   4. Add: https://*.vercel.app"
echo "   5. Add: https://dealership-ai-dashboard-*.vercel.app"
echo "   6. Save"

