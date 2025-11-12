#!/bin/bash

# Test script for onboarding flow end-to-end
# Tests telemetry, Clerk SSO, and onboarding steps

BASE_URL="${NEXT_PUBLIC_BASE_URL:-http://localhost:3000}"

echo "🧪 Testing Onboarding Flow End-to-End"
echo "======================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Telemetry endpoint
echo "1️⃣  Testing /api/telemetry (POST)..."
RESPONSE=$(curl -s -X POST "$BASE_URL/api/telemetry" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "onboarding_viewed",
    "payload": {"step": 1, "test": true},
    "ts": '$(date +%s)'
  }')

if echo "$RESPONSE" | grep -q '"ok":true'; then
  echo -e "${GREEN}✅ Telemetry POST successful${NC}"
else
  echo -e "${YELLOW}⚠️  Telemetry POST response: $RESPONSE${NC}"
fi
echo ""

# Test 2: Telemetry GET
echo "2️⃣  Testing /api/telemetry (GET)..."
RESPONSE=$(curl -s "$BASE_URL/api/telemetry")
if echo "$RESPONSE" | grep -q '"events"'; then
  echo -e "${GREEN}✅ Telemetry GET successful${NC}"
  EVENT_COUNT=$(echo "$RESPONSE" | jq '.events | length' 2>/dev/null || echo "unknown")
  echo "   Found $EVENT_COUNT events"
else
  echo -e "${YELLOW}⚠️  Telemetry GET returned: $RESPONSE${NC}"
fi
echo ""

# Test 3: Onboarding page accessibility
echo "3️⃣  Testing /onboarding page..."
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/onboarding")
if [ "$RESPONSE" = "200" ]; then
  echo -e "${GREEN}✅ Onboarding page accessible (HTTP $RESPONSE)${NC}"
else
  echo -e "${RED}❌ Onboarding page failed (HTTP $RESPONSE)${NC}"
fi
echo ""

# Test 4: Clerk configuration (if available)
echo "4️⃣  Testing Clerk configuration..."
if [ -n "$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" ]; then
  echo -e "${GREEN}✅ Clerk publishable key configured${NC}"
else
  echo -e "${YELLOW}⚠️  Clerk publishable key not found (optional)${NC}"
fi
echo ""

# Test 5: Supabase configuration (if available)
echo "5️⃣  Testing Supabase configuration..."
if [ -n "$SUPABASE_URL" ] || [ -n "$NEXT_PUBLIC_SUPABASE_URL" ]; then
  echo -e "${GREEN}✅ Supabase URL configured${NC}"
  if [ -n "$SUPABASE_SERVICE_ROLE_KEY" ] || [ -n "$SUPABASE_SERVICE_KEY" ]; then
    echo -e "${GREEN}✅ Supabase service key configured${NC}"
  else
    echo -e "${YELLOW}⚠️  Supabase service key not found${NC}"
  fi
else
  echo -e "${YELLOW}⚠️  Supabase URL not found (telemetry will work in dev mode)${NC}"
fi
echo ""

# Test 6: Share unlock modal component
echo "6️⃣  Testing ShareUnlockModal component..."
if [ -f "components/share/ShareUnlockModal.tsx" ]; then
  echo -e "${GREEN}✅ ShareUnlockModal component exists${NC}"
else
  echo -e "${RED}❌ ShareUnlockModal component not found${NC}"
fi
echo ""

echo "======================================"
echo "✅ Onboarding flow test complete!"
echo ""
echo "Next steps:"
echo "1. Visit $BASE_URL/onboarding in your browser"
echo "2. Complete the onboarding steps"
echo "3. Check telemetry events in Supabase dashboard"
echo "4. Verify Clerk SSO integration (if configured)"

