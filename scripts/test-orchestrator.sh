#!/bin/bash
# Test Orchestrator Endpoints
# Run this after starting dev server: npm run dev

set -e

BASE_URL="${1:-http://localhost:3000}"

echo "🧪 Testing Orchestrator Endpoints"
echo "=================================="
echo ""

# Test 1: Orchestrator Status
echo "1️⃣ Testing orchestrator status..."
echo "GET $BASE_URL/api/orchestrator/status"
echo ""
STATUS_RESPONSE=$(curl -s "$BASE_URL/api/orchestrator/status" 2>&1)
if echo "$STATUS_RESPONSE" | grep -q "ok"; then
  echo "✅ Status endpoint working"
  echo "$STATUS_RESPONSE" | jq '.' 2>/dev/null || echo "$STATUS_RESPONSE"
else
  echo "❌ Status endpoint failed"
  echo "$STATUS_RESPONSE"
fi
echo ""
echo "---"
echo ""

# Test 2: OEM Parse
echo "2️⃣ Testing OEM parsing..."
echo "POST $BASE_URL/api/oem/parse"
echo ""
OEM_RESPONSE=$(curl -s -X POST "$BASE_URL/api/oem/parse" \
  -H "Content-Type: application/json" \
  -d '{"oem": "Toyota", "url": "https://pressroom.toyota.com/the-2026-toyota-tacoma-adventure-awaits/"}' \
  2>&1)
if echo "$OEM_RESPONSE" | grep -q -E "(ok|update|error)"; then
  echo "✅ OEM parse endpoint responding"
  echo "$OEM_RESPONSE" | jq '.' 2>/dev/null || echo "$OEM_RESPONSE"
else
  echo "❌ OEM parse endpoint failed"
  echo "$OEM_RESPONSE"
fi
echo ""
echo "---"
echo ""

# Test 3: Orchestrator Background (Manual Trigger)
echo "3️⃣ Testing orchestrator background (manual trigger)..."
echo "POST $BASE_URL/api/orchestrator-background"
echo ""
ORCH_RESPONSE=$(curl -s -X POST "$BASE_URL/api/orchestrator-background" \
  -H "Content-Type: application/json" \
  2>&1)
if echo "$ORCH_RESPONSE" | grep -q -E "(ok|result|error)"; then
  echo "✅ Orchestrator background endpoint responding"
  echo "$ORCH_RESPONSE" | jq '.' 2>/dev/null || echo "$ORCH_RESPONSE"
else
  echo "❌ Orchestrator background endpoint failed"
  echo "$ORCH_RESPONSE"
fi
echo ""
echo "=================================="
echo "✅ Testing complete!"

