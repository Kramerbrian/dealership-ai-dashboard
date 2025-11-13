#!/bin/bash

# Upload Mapbox Style using curl
# Requires a Mapbox secret token with styles:write scope

STYLE_FILE="docs/mapbox-styles/dealershipai-inception-daydream-style.json"
MAPBOX_USERNAME="briankramer"
STYLE_NAME="dealershipai-inception-daydream"

# Check if secret token is provided
if [ -z "$MAPBOX_SECRET_TOKEN" ]; then
  echo "❌ Error: MAPBOX_SECRET_TOKEN environment variable not set"
  echo ""
  echo "To get a secret token:"
  echo "1. Go to https://account.mapbox.com/access-tokens/"
  echo "2. Click 'Create a token'"
  echo "3. Give it a name like 'Style Upload'"
  echo "4. Enable the 'styles:write' scope"
  echo "5. Click 'Create token'"
  echo "6. Run: export MAPBOX_SECRET_TOKEN='your_secret_token_here'"
  echo "7. Then run this script again"
  exit 1
fi

echo "Uploading style to Mapbox..."
echo "Username: $MAPBOX_USERNAME"
echo "Style: $STYLE_NAME"
echo ""

# Read and prepare the style JSON
STYLE_JSON=$(cat "$STYLE_FILE")

# Upload to Mapbox
RESPONSE=$(curl -s -X POST "https://api.mapbox.com/styles/v1/${MAPBOX_USERNAME}?access_token=${MAPBOX_SECRET_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"DealershipAI Inception Daydream\",\"draft\":false,\"version\":8,\"sources\":$(echo "$STYLE_JSON" | jq -c '.sources'),\"layers\":$(echo "$STYLE_JSON" | jq -c '.layers'),\"glyphs\":$(echo "$STYLE_JSON" | jq -c '.glyphs'),\"sprite\":$(echo "$STYLE_JSON" | jq -c '.sprite')}")

# Check for errors
if echo "$RESPONSE" | grep -q "error"; then
  echo "❌ Upload failed:"
  echo "$RESPONSE" | jq '.'
  exit 1
fi

# Extract style ID
STYLE_ID=$(echo "$RESPONSE" | jq -r '.id')

if [ -z "$STYLE_ID" ] || [ "$STYLE_ID" = "null" ]; then
  echo "❌ Failed to get style ID from response:"
  echo "$RESPONSE"
  exit 1
fi

echo "✅ Style uploaded successfully!"
echo ""
echo "Style URL: mapbox://styles/${MAPBOX_USERNAME}/${STYLE_ID}"
echo "Style ID: $STYLE_ID"
echo ""
echo "Update lib/config/mapbox-styles.ts with this URL:"
echo "  light: 'mapbox://styles/${MAPBOX_USERNAME}/${STYLE_ID}',"
