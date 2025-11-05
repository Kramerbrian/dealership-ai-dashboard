#!/bin/bash

# Test Trial System
# This script tests the trial grant and status endpoints

set -e

BASE_URL="${1:-http://localhost:3000}"
echo "🧪 Testing Trial System at $BASE_URL"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Grant Trial
echo "📤 Test 1: Grant Trial Feature"
echo "POST $BASE_URL/api/trial/grant"
RESPONSE=$(curl -s -X POST "$BASE_URL/api/trial/grant" \
  -H "Content-Type: application/json" \
  -d '{"feature_id": "schema_fix"}' \
  -c /tmp/trial_cookies.txt \
  -w "\nHTTP_STATUS:%{http_code}")

HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS/d')

if [ "$HTTP_STATUS" = "200" ]; then
  echo -e "${GREEN}✅ Success${NC}"
  echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
else
  echo -e "${RED}❌ Failed (HTTP $HTTP_STATUS)${NC}"
  echo "$BODY"
  exit 1
fi

echo ""

# Test 2: Check Trial Status
echo "📊 Test 2: Check Trial Status"
echo "GET $BASE_URL/api/trial/status"
RESPONSE=$(curl -s -X GET "$BASE_URL/api/trial/status" \
  -b /tmp/trial_cookies.txt \
  -w "\nHTTP_STATUS:%{http_code}")

HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS/d')

if [ "$HTTP_STATUS" = "200" ]; then
  echo -e "${GREEN}✅ Success${NC}"
  echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
  
  # Check if schema_fix is in active trials
  if echo "$BODY" | grep -q "schema_fix"; then
    echo -e "${GREEN}✅ Trial 'schema_fix' is active${NC}"
  else
    echo -e "${YELLOW}⚠️  Trial 'schema_fix' not found in active trials${NC}"
  fi
else
  echo -e "${RED}❌ Failed (HTTP $HTTP_STATUS)${NC}"
  echo "$BODY"
  exit 1
fi

echo ""

# Test 3: Verify Cookie
echo "🍪 Test 3: Verify Cookie"
if [ -f /tmp/trial_cookies.txt ]; then
  if grep -q "dai_trial_schema_fix" /tmp/trial_cookies.txt; then
    echo -e "${GREEN}✅ Cookie 'dai_trial_schema_fix' found${NC}"
    COOKIE_VALUE=$(grep "dai_trial_schema_fix" /tmp/trial_cookies.txt | awk '{print $7}')
    echo "Cookie value: ${COOKIE_VALUE:0:50}..."
  else
    echo -e "${RED}❌ Cookie 'dai_trial_schema_fix' not found${NC}"
  fi
else
  echo -e "${YELLOW}⚠️  Cookie file not found${NC}"
fi

echo ""
echo -e "${GREEN}✅ All tests completed!${NC}"
echo ""
echo "📋 Next steps:"
echo "   1. Navigate to http://localhost:3000/pricing"
echo "   2. Click 'Borrow a Pro feature for 24h'"
echo "   3. Navigate to http://localhost:3000/dashboard"
echo "   4. Click 'Schema' tab - should show locked overlay"
echo "   5. Click 'Try for 24 hours' - should unlock"

