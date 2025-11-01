#!/bin/bash

# Update Clerk Allowed Origins to include dash.dealershipai.com
# Requires CLERK_SECRET_KEY in environment

set -e

if [ -z "$CLERK_SECRET_KEY" ]; then
  echo "❌ Error: CLERK_SECRET_KEY not found in environment"
  echo "   Please set it: export CLERK_SECRET_KEY=sk_live_..."
  exit 1
fi

CLERK_API_URL="https://api.clerk.com/v1"

# Get current instance configuration
echo "🔍 Fetching current Clerk configuration..."

INSTANCE_RESPONSE=$(curl -s -X GET \
  "$CLERK_API_URL/instances" \
  -H "Authorization: Bearer $CLERK_SECRET_KEY" \
  -H "Content-Type: application/json")

INSTANCE_ID=$(echo "$INSTANCE_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$INSTANCE_ID" ]; then
  echo "❌ Error: Could not find Clerk instance ID"
  echo "   Response: $INSTANCE_RESPONSE"
  exit 1
fi

echo "✅ Found instance: $INSTANCE_ID"

# Get current allowed origins
echo "🔍 Fetching current allowed origins..."

CONFIG_RESPONSE=$(curl -s -X GET \
  "$CLERK_API_URL/instances/$INSTANCE_ID" \
  -H "Authorization: Bearer $CLERK_SECRET_KEY" \
  -H "Content-Type: application/json")

CURRENT_ORIGINS=$(echo "$CONFIG_RESPONSE" | grep -o '"allowed_origins":\[[^]]*\]' | sed 's/"allowed_origins":\[\(.*\)\]/\1/' | tr -d '"' | tr ',' '\n')

echo "📋 Current allowed origins:"
echo "$CURRENT_ORIGINS" | while read origin; do
  [ -n "$origin" ] && echo "   - $origin"
done

# Check if dash.dealershipai.com is already in the list
if echo "$CURRENT_ORIGINS" | grep -q "dash.dealershipai.com"; then
  echo "✅ dash.dealershipai.com is already in allowed origins"
  exit 0
fi

# Prepare new origins list
NEW_ORIGINS="$CURRENT_ORIGINS"
if [ -n "$NEW_ORIGINS" ]; then
  NEW_ORIGINS="$NEW_ORIGINS,https://dash.dealershipai.com"
else
  NEW_ORIGINS="https://dash.dealershipai.com"
fi

# Convert to array format for JSON
ORIGINS_ARRAY=$(echo "$NEW_ORIGINS" | tr ',' '\n' | sed 's/^/"/' | sed 's/$/"/' | tr '\n' ',' | sed 's/,$//')
ORIGINS_JSON="[$ORIGINS_ARRAY]"

echo "🔄 Updating allowed origins..."
echo "   Adding: https://dash.dealershipai.com"

# Update instance configuration
UPDATE_RESPONSE=$(curl -s -w "\n%{http_code}" -X PATCH \
  "$CLERK_API_URL/instances/$INSTANCE_ID" \
  -H "Authorization: Bearer $CLERK_SECRET_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"allowed_origins\": $ORIGINS_JSON}")

HTTP_CODE=$(echo "$UPDATE_RESPONSE" | tail -1)
RESPONSE_BODY=$(echo "$UPDATE_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "204" ]; then
  echo "✅ Successfully updated Clerk allowed origins!"
  echo "   HTTP Status: $HTTP_CODE"
  echo ""
  echo "📋 New allowed origins:"
  echo "$NEW_ORIGINS" | tr ',' '\n' | while read origin; do
    [ -n "$origin" ] && echo "   - $origin"
  done
  echo ""
  echo "⏳ Changes may take 1-2 minutes to propagate"
else
  echo "❌ Error updating allowed origins"
  echo "   HTTP Status: $HTTP_CODE"
  echo "   Response: $RESPONSE_BODY"
  exit 1
fi

