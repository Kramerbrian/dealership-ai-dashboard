#!/bin/bash
# Test Pulse Dashboard endpoints
# Run this after deployment to verify everything works

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

BASE_URL="${1:-http://localhost:3000}"
TENANT="${2:-demo-tenant}"

echo -e "${BLUE}🧪 Testing Pulse Dashboard APIs${NC}\n"
echo -e "${YELLOW}Base URL: $BASE_URL${NC}"
echo -e "${YELLOW}Tenant: $TENANT\n${NC}"

# Test 1: Pulse Snapshot (public endpoint)
echo -e "${YELLOW}Test 1: Pulse Snapshot API${NC}"
SNAPSHOT_RESPONSE=$(curl -s "$BASE_URL/api/pulse/snapshot?tenant=$TENANT" || echo "ERROR")
if echo "$SNAPSHOT_RESPONSE" | jq -e '.tiles' > /dev/null 2>&1; then
  echo -e "${GREEN}✅ Snapshot API working${NC}"
  TILE_COUNT=$(echo "$SNAPSHOT_RESPONSE" | jq '.tiles | length')
  echo -e "   Found $TILE_COUNT tiles"
else
  echo -e "${RED}❌ Snapshot API failed${NC}"
  echo "$SNAPSHOT_RESPONSE" | head -n 5
fi

# Test 2: Pulse Trends
echo -e "\n${YELLOW}Test 2: Pulse Trends API${NC}"
TRENDS_RESPONSE=$(curl -s "$BASE_URL/api/pulse/trends?dealerId=$TENANT&days=7" || echo "ERROR")
if echo "$TRENDS_RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
  echo -e "${GREEN}✅ Trends API working${NC}"
else
  echo -e "${YELLOW}⚠️  Trends API returned error or requires auth${NC}"
fi

# Test 3: Health Check
echo -e "\n${YELLOW}Test 3: Health Check${NC}"
HEALTH_RESPONSE=$(curl -s "$BASE_URL/api/health" || echo "ERROR")
if echo "$HEALTH_RESPONSE" | jq -e '.status' > /dev/null 2>&1 || echo "$HEALTH_RESPONSE" | grep -q "healthy"; then
  echo -e "${GREEN}✅ Health check passed${NC}"
else
  echo -e "${YELLOW}⚠️  Health check returned unexpected response${NC}"
fi

# Test 4: Pulse Page (HTML)
echo -e "\n${YELLOW}Test 4: Pulse Dashboard Page${NC}"
PAGE_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/pulse" || echo "000")
if [ "$PAGE_RESPONSE" = "200" ] || [ "$PAGE_RESPONSE" = "302" ] || [ "$PAGE_RESPONSE" = "307" ]; then
  echo -e "${GREEN}✅ Pulse page accessible (HTTP $PAGE_RESPONSE)${NC}"
  if [ "$PAGE_RESPONSE" = "302" ] || [ "$PAGE_RESPONSE" = "307" ]; then
    echo -e "   ${YELLOW}Note: Redirect detected (likely auth redirect)${NC}"
  fi
else
  echo -e "${RED}❌ Pulse page failed (HTTP $PAGE_RESPONSE)${NC}"
fi

echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Testing Complete${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

echo -e "${YELLOW}To test production:${NC}"
echo -e "  ${GREEN}./scripts/test-pulse-dashboard.sh https://dash.dealershipai.com${NC}\n"

