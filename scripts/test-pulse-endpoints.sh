#!/bin/bash
# Test script for Pulse Cards API endpoints

DOMAIN="${1:-exampledealer.com}"
BASE_URL="${2:-http://localhost:3000}"

echo "🧪 Testing Pulse Cards API Endpoints"
echo "====================================="
echo ""
echo "Domain: $DOMAIN"
echo "Base URL: $BASE_URL"
echo ""

# Test 1: analyzePulseTelemetry (GET)
echo "1️⃣ Testing GET /api/analyzePulseTelemetry"
echo "----------------------------------------"
RESPONSE=$(curl -s "${BASE_URL}/api/analyzePulseTelemetry?domain=${DOMAIN}")
if echo "$RESPONSE" | grep -q '"success":true'; then
  echo "✅ Success"
  CARD_COUNT=$(echo "$RESPONSE" | jq '.cards | length' 2>/dev/null || echo "N/A")
  echo "   Cards: $CARD_COUNT"
  echo "$RESPONSE" | jq '.summary' 2>/dev/null || echo "   (jq not available for pretty print)"
else
  echo "❌ Failed"
  echo "$RESPONSE" | head -5
fi
echo ""

# Test 2: getPulseMetrics (GET)
echo "2️⃣ Testing GET /api/getPulseMetrics"
echo "-----------------------------------"
RESPONSE=$(curl -s "${BASE_URL}/api/getPulseMetrics?domain=${DOMAIN}")
if echo "$RESPONSE" | grep -q '"success":true'; then
  echo "✅ Success"
  AVI=$(echo "$RESPONSE" | jq '.metrics.scores.avi' 2>/dev/null || echo "N/A")
  HEALTH=$(echo "$RESPONSE" | jq -r '.metrics.health.overall' 2>/dev/null || echo "N/A")
  echo "   AVI: $AVI"
  echo "   Health: $HEALTH"
  echo "$RESPONSE" | jq '.metrics.pulse' 2>/dev/null || echo "   (jq not available for pretty print)"
else
  echo "❌ Failed"
  echo "$RESPONSE" | head -5
fi
echo ""

# Test 3: analyzePulseTelemetry (POST)
echo "3️⃣ Testing POST /api/analyzePulseTelemetry"
echo "------------------------------------------"
# First get clarity data
CLARITY_DATA=$(curl -s "${BASE_URL}/api/clarity/stack?domain=${DOMAIN}")
if echo "$CLARITY_DATA" | grep -q '"domain"'; then
  POST_BODY=$(echo "$CLARITY_DATA" | jq '{clarityData: .}' 2>/dev/null || echo "{\"clarityData\": $CLARITY_DATA}")
  RESPONSE=$(curl -s -X POST "${BASE_URL}/api/analyzePulseTelemetry" \
    -H "Content-Type: application/json" \
    -d "$POST_BODY")
  if echo "$RESPONSE" | grep -q '"success":true'; then
    echo "✅ Success"
    CARD_COUNT=$(echo "$RESPONSE" | jq '.cards | length' 2>/dev/null || echo "N/A")
    echo "   Cards: $CARD_COUNT"
  else
    echo "❌ Failed"
    echo "$RESPONSE" | head -5
  fi
else
  echo "⚠️  Skipped (could not fetch clarity data)"
fi
echo ""

echo "✅ Test complete!"
echo ""
echo "Next steps:"
echo "  • Visit ${BASE_URL}/test/pulse-cards for interactive testing"
echo "  • Review docs/PULSE_CARDS_API.md for full documentation"

