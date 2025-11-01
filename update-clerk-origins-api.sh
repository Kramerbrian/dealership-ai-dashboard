#!/bin/bash

# Update Clerk Allowed Origins via Management API
# This script attempts to update Clerk allowed origins programmatically

echo "🔧 Clerk Allowed Origins Update (Management API)"
echo "=================================================="
echo ""

# Load environment variables from .env.local
if [ -f .env.local ]; then
    export $(grep -v '^#' .env.local | xargs)
fi

# Check for CLERK_SECRET_KEY
if [ -z "$CLERK_SECRET_KEY" ]; then
    echo "❌ Error: CLERK_SECRET_KEY not found"
    echo ""
    echo "Please ensure CLERK_SECRET_KEY is set in .env.local"
    exit 1
fi

# Check for publishable key
if [ -z "$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" ]; then
    echo "⚠️  Warning: NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY not found"
    echo "   Will attempt API call without instance ID"
fi

echo "✅ Found CLERK_SECRET_KEY: ${CLERK_SECRET_KEY:0:20}..."
echo ""

# Extract instance ID from publishable key if available
INSTANCE_ID=""
if [ -n "$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" ]; then
    # Format: pk_live_xxx or pk_test_xxx:instance_id
    if [[ "$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" == *":"* ]]; then
        INSTANCE_ID=$(echo "$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" | cut -d: -f2)
        echo "✅ Found instance ID: $INSTANCE_ID"
    else
        echo "⚠️  Could not extract instance ID from publishable key"
        echo "   Will try to get instance from API"
    fi
fi

echo ""
echo "📋 URLs to add:"
echo "   - https://*.vercel.app"
echo "   - https://dealership-ai-dashboard-*.vercel.app"
echo ""

# Attempt to get current instance configuration
echo "🔍 Fetching current instance configuration..."
RESPONSE=$(curl -s -w "\n%{http_code}" \
    -X GET "https://api.clerk.com/v1/instance" \
    -H "Authorization: Bearer $CLERK_SECRET_KEY" \
    -H "Content-Type: application/json" 2>/dev/null)

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

echo "HTTP Status: $HTTP_CODE"
echo ""

if [ "$HTTP_CODE" == "200" ]; then
    echo "✅ Successfully connected to Clerk API"
    echo ""
    echo "📄 Current instance configuration:"
    echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
    echo ""
    
    # Extract current allowed origins
    CURRENT_ORIGINS=$(echo "$BODY" | jq -r '.frontend_api.allowed_origins[]?' 2>/dev/null || echo "")
    
    if [ -n "$CURRENT_ORIGINS" ]; then
        echo "📋 Current allowed origins:"
        echo "$CURRENT_ORIGINS" | while read -r origin; do
            echo "   - $origin"
        done
        echo ""
    fi
    
    # Prepare new origins list
    NEW_ORIGINS=$(echo "$BODY" | jq --argjson new '["https://*.vercel.app", "https://dealership-ai-dashboard-*.vercel.app"]' \
        '.frontend_api.allowed_origins = (.frontend_api.allowed_origins // [] + $new | unique)' 2>/dev/null)
    
    if [ -n "$NEW_ORIGINS" ]; then
        echo "🔄 Attempting to update allowed origins..."
        echo ""
        
        UPDATE_RESPONSE=$(curl -s -w "\n%{http_code}" \
            -X PATCH "https://api.clerk.com/v1/instance" \
            -H "Authorization: Bearer $CLERK_SECRET_KEY" \
            -H "Content-Type: application/json" \
            -d "$NEW_ORIGINS" 2>/dev/null)
        
        UPDATE_HTTP_CODE=$(echo "$UPDATE_RESPONSE" | tail -n1)
        UPDATE_BODY=$(echo "$UPDATE_RESPONSE" | sed '$d')
        
        if [ "$UPDATE_HTTP_CODE" == "200" ] || [ "$UPDATE_HTTP_CODE" == "204" ]; then
            echo "✅ Update request successful (HTTP $UPDATE_HTTP_CODE)!"
            echo ""
            echo "🔍 Verifying update..."
            
            # Fetch updated configuration
            sleep 2
            VERIFY_RESPONSE=$(curl -s \
                -X GET "https://api.clerk.com/v1/instance" \
                -H "Authorization: Bearer $CLERK_SECRET_KEY" \
                -H "Content-Type: application/json" 2>/dev/null)
            
            if [ -n "$VERIFY_RESPONSE" ]; then
                UPDATED_ORIGINS=$(echo "$VERIFY_RESPONSE" | jq -r '.allowed_origins[]?' 2>/dev/null)
                if [ -n "$UPDATED_ORIGINS" ]; then
                    echo "✅ Updated allowed origins:"
                    echo "$UPDATED_ORIGINS" | while read -r origin; do
                        echo "   - $origin"
                    done
                else
                    echo "⚠️  Allowed origins may be stored in frontend_api configuration"
                    echo "   Please verify in Clerk Dashboard"
                fi
            fi
            
            echo ""
            echo "⏳ Please wait 1-2 minutes for changes to propagate"
            echo ""
            echo "🧪 Test your deployment:"
            echo "   https://dealership-ai-dashboard-ircgs9hkt-brian-kramer-dealershipai.vercel.app"
        else
            echo "❌ Failed to update allowed origins"
            echo "HTTP Status: $UPDATE_HTTP_CODE"
            echo "Response: $UPDATE_BODY"
            echo ""
            echo "💡 This API endpoint may not be available."
            echo "   Please use the Clerk Dashboard instead:"
            echo "   https://dashboard.clerk.com"
        fi
    else
        echo "⚠️  Could not prepare update payload"
        echo "   Using manual dashboard method"
    fi
    
elif [ "$HTTP_CODE" == "401" ] || [ "$HTTP_CODE" == "403" ]; then
    echo "❌ Authentication failed"
    echo "   Please check your CLERK_SECRET_KEY"
    echo ""
    echo "💡 Use the Clerk Dashboard instead:"
    echo "   https://dashboard.clerk.com"
elif [ "$HTTP_CODE" == "404" ]; then
    echo "⚠️  API endpoint not found"
    echo "   Clerk Management API may not support this endpoint"
    echo ""
    echo "💡 Please use the Clerk Dashboard:"
    echo "   https://dashboard.clerk.com"
else
    echo "⚠️  Unexpected response (HTTP $HTTP_CODE)"
    echo "Response: $BODY"
    echo ""
    echo "💡 Clerk Management API may not support updating allowed origins programmatically"
    echo "   Please use the Clerk Dashboard:"
    echo "   https://dashboard.clerk.com"
fi

echo ""
echo "📚 Alternative: Use Clerk Dashboard"
echo "===================================="
echo "1. Go to: https://dashboard.clerk.com"
echo "2. Select your application"
echo "3. Go to: Configure → Paths → Frontend API"
echo "4. Add: https://*.vercel.app"
echo "5. Add: https://dealership-ai-dashboard-*.vercel.app"
echo "6. Save"
echo ""

