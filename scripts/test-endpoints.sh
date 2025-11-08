#!/bin/bash

# Test script for DealershipAI API endpoints
# Run this after setting up your environment variables

BASE_URL="${NEXT_PUBLIC_BASE_URL:-http://localhost:3000}"

echo "🧪 Testing DealershipAI API Endpoints"
echo "======================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Telemetry POST
echo "1️⃣  Testing /api/telemetry (POST)..."
RESPONSE=$(curl -s -X POST "$BASE_URL/api/telemetry" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "test_event",
    "payload": {"test": true, "timestamp": "'$(date +%s)'"},
    "ts": '$(date +%s)'
  }')

if echo "$RESPONSE" | grep -q '"ok":true'; then
  echo -e "${GREEN}✅ Telemetry POST successful${NC}"
else
  echo -e "${RED}❌ Telemetry POST failed${NC}"
  echo "Response: $RESPONSE"
fi
echo ""

# Test 2: Telemetry GET
echo "2️⃣  Testing /api/telemetry (GET)..."
RESPONSE=$(curl -s "$BASE_URL/api/telemetry")
if echo "$RESPONSE" | grep -q '"events"'; then
  echo -e "${GREEN}✅ Telemetry GET successful${NC}"
  EVENT_COUNT=$(echo "$RESPONSE" | grep -o '"events":\[.*\]' | grep -o ',' | wc -l | xargs)
  echo "   Found events in response"
else
  echo -e "${YELLOW}⚠️  Telemetry GET returned: $RESPONSE${NC}"
fi
echo ""

# Test 3: Pulse Impacts
echo "3️⃣  Testing /api/pulse/impacts (POST)..."
RESPONSE=$(curl -s -X POST "$BASE_URL/api/pulse/impacts" \
  -H "Content-Type: application/json" \
  -d '{
    "marketId": "us_default",
    "oem": "Tesla",
    "model": "Model3",
    "dealers": ["dealer1", "dealer2"]
  }')

if echo "$RESPONSE" | grep -q '"ok":true'; then
  echo -e "${GREEN}✅ Pulse Impacts successful${NC}"
else
  echo -e "${RED}❌ Pulse Impacts failed${NC}"
  echo "Response: $RESPONSE"
fi
echo ""

# Test 4: Pulse Radar
echo "4️⃣  Testing /api/pulse/radar (GET)..."
RESPONSE=$(curl -s "$BASE_URL/api/pulse/radar?marketId=us_default&window=7d")
if echo "$RESPONSE" | grep -q '"ok":true'; then
  echo -e "${GREEN}✅ Pulse Radar successful${NC}"
else
  echo -e "${RED}❌ Pulse Radar failed${NC}"
  echo "Response: $RESPONSE"
fi
echo ""

# Test 5: Schema Validate
echo "5️⃣  Testing /api/schema/validate (GET)..."
RESPONSE=$(curl -s "$BASE_URL/api/schema/validate?url=https://example.com")
if echo "$RESPONSE" | grep -q '"coverage"'; then
  echo -e "${GREEN}✅ Schema Validate successful${NC}"
else
  echo -e "${YELLOW}⚠️  Schema Validate returned: $RESPONSE${NC}"
  echo "   (This may be expected if SCHEMA_ENGINE_URL is not set)"
fi
echo ""

# Test 6: Admin Setup Check
echo "6️⃣  Testing /api/admin/setup (GET)..."
RESPONSE=$(curl -s "$BASE_URL/api/admin/setup")
if echo "$RESPONSE" | grep -q '"tableExists"'; then
  echo -e "${GREEN}✅ Admin Setup check successful${NC}"
  if echo "$RESPONSE" | grep -q '"tableExists":true'; then
    echo -e "${GREEN}   ✅ telemetry_events table exists${NC}"
  else
    echo -e "${YELLOW}   ⚠️  telemetry_events table does not exist${NC}"
    echo "   Run the SQL migration in Supabase"
  fi
else
  echo -e "${RED}❌ Admin Setup check failed${NC}"
fi
echo ""

echo "======================================"
echo "✅ Testing complete!"
echo ""
echo "Next steps:"
echo "1. Check Supabase dashboard to verify telemetry_events table exists"
echo "2. Visit $BASE_URL/admin to see analytics dashboard"
echo "3. Visit $BASE_URL/onboarding to test onboarding flow"

