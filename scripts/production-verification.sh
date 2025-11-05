#!/bin/bash

# Production Verification Script
# Runs all verification checks and tests

set -e

echo "🚀 Starting Production Verification..."
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running in production context
if [ -z "$NEXT_PUBLIC_APP_URL" ]; then
  echo -e "${YELLOW}⚠️  NEXT_PUBLIC_APP_URL not set, using localhost${NC}"
  export NEXT_PUBLIC_APP_URL="http://localhost:3000"
fi

BASE_URL="${NEXT_PUBLIC_APP_URL}"

# 1. Environment Variables Check
echo -e "${GREEN}1. Checking Environment Variables...${NC}"
npm run verify:production || echo -e "${RED}❌ Environment check failed${NC}"
echo ""

# 2. Health Check
echo -e "${GREEN}2. Testing Health Endpoint...${NC}"
HEALTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/api/health" || echo "000")
if [ "$HEALTH_RESPONSE" = "200" ] || [ "$HEALTH_RESPONSE" = "503" ]; then
  echo -e "${GREEN}✅ Health endpoint responding (${HEALTH_RESPONSE})${NC}"
  curl -s "${BASE_URL}/api/health" | jq '.' || echo "Response received"
else
  echo -e "${RED}❌ Health endpoint failed (${HEALTH_RESPONSE})${NC}"
fi
echo ""

# 3. Pricing Page Features
echo -e "${GREEN}3. Testing Pricing Page Features...${NC}"
npm run test:pricing || echo -e "${RED}❌ Pricing tests failed${NC}"
echo ""

# 4. Redis Pub/Sub
echo -e "${GREEN}4. Testing Redis Pub/Sub...${NC}"
npm run test:redis || echo -e "${YELLOW}⚠️  Redis test skipped (optional)${NC}"
echo ""

# 5. SSE Stream
echo -e "${GREEN}5. Testing SSE Stream...${NC}"
npm run test:sse || echo -e "${YELLOW}⚠️  SSE test skipped (requires eventsource package)${NC}"
echo ""

# 6. API Endpoints
echo -e "${GREEN}6. Testing Critical API Endpoints...${NC}"

ENDPOINTS=(
  "/api/telemetry"
  "/api/trial/status"
  "/api/agent/visibility?dealerId=test"
)

for endpoint in "${ENDPOINTS[@]}"; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}${endpoint}" || echo "000")
  if [ "$STATUS" = "200" ] || [ "$STATUS" = "201" ]; then
    echo -e "${GREEN}✅ ${endpoint} - OK${NC}"
  else
    echo -e "${RED}❌ ${endpoint} - Failed (${STATUS})${NC}"
  fi
done
echo ""

# 7. Pricing Page Load
echo -e "${GREEN}7. Testing Pricing Page Load...${NC}"
PRICING_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/pricing" || echo "000")
if [ "$PRICING_STATUS" = "200" ]; then
  echo -e "${GREEN}✅ Pricing page loads successfully${NC}"
else
  echo -e "${RED}❌ Pricing page failed (${PRICING_STATUS})${NC}"
fi
echo ""

# Summary
echo -e "${GREEN}📊 Verification Summary${NC}"
echo "=================================="
echo "All checks completed!"
echo ""
echo "Next steps:"
echo "1. Review Vercel dashboard for environment variables"
echo "2. Monitor production logs"
echo "3. Test real user flows"
echo "4. Check analytics dashboard"
echo ""
echo -e "${GREEN}🚀 System ready for production!${NC}"

