#!/bin/bash
# Test script for DealershipAI orchestrator and OEM endpoints
# Usage: ./scripts/test-endpoints.sh [base_url]

BASE_URL="${1:-http://localhost:3000}"
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🧪 Testing DealershipAI Endpoints${NC}\n"

# Test 1: Orchestrator Status
echo -e "${YELLOW}1. Testing Orchestrator Status...${NC}"
STATUS_RESPONSE=$(curl -s "${BASE_URL}/api/orchestrator/status")
if [ $? -eq 0 ]; then
  echo "$STATUS_RESPONSE" | jq '.' 2>/dev/null || echo "$STATUS_RESPONSE"
  echo -e "${GREEN}✅ Orchestrator status endpoint is accessible${NC}\n"
else
  echo -e "${RED}❌ Failed to reach orchestrator status endpoint${NC}\n"
fi

# Test 2: OEM Parse (requires OPENAI_API_KEY)
echo -e "${YELLOW}2. Testing OEM Parse...${NC}"
echo "   This requires OPENAI_API_KEY and may take 30-60 seconds..."
PARSE_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/oem/parse" \
  -H "Content-Type: application/json" \
  -d '{
    "oem": "Toyota",
    "url": "https://pressroom.toyota.com/the-2026-toyota-tacoma-adventure-awaits/"
  }' \
  --max-time 120)

if [ $? -eq 0 ]; then
  echo "$PARSE_RESPONSE" | jq '.' 2>/dev/null || echo "$PARSE_RESPONSE"
  if echo "$PARSE_RESPONSE" | grep -q '"ok":true'; then
    echo -e "${GREEN}✅ OEM parse endpoint is working${NC}\n"
  else
    echo -e "${YELLOW}⚠️  OEM parse endpoint responded but may have errors${NC}\n"
  fi
else
  echo -e "${RED}❌ Failed to reach OEM parse endpoint (may need OPENAI_API_KEY)${NC}\n"
fi

# Test 3: Orchestrator Background (may require CRON_SECRET)
echo -e "${YELLOW}3. Testing Orchestrator Background...${NC}"
echo "   This may require CRON_SECRET if configured..."
BACKGROUND_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/orchestrator-background" \
  --max-time 300)

if [ $? -eq 0 ]; then
  echo "$BACKGROUND_RESPONSE" | jq '.' 2>/dev/null || echo "$BACKGROUND_RESPONSE"
  if echo "$BACKGROUND_RESPONSE" | grep -q '"ok":true'; then
    echo -e "${GREEN}✅ Orchestrator background endpoint is working${NC}\n"
  else
    echo -e "${YELLOW}⚠️  Orchestrator background responded but may have errors${NC}\n"
  fi
else
  echo -e "${RED}❌ Failed to reach orchestrator background endpoint${NC}\n"
fi

# Test 4: Health Check
echo -e "${YELLOW}4. Testing Health Endpoint...${NC}"
HEALTH_RESPONSE=$(curl -s "${BASE_URL}/api/health")
if [ $? -eq 0 ]; then
  echo "$HEALTH_RESPONSE" | jq '.' 2>/dev/null || echo "$HEALTH_RESPONSE"
  echo -e "${GREEN}✅ Health endpoint is accessible${NC}\n"
else
  echo -e "${RED}❌ Failed to reach health endpoint${NC}\n"
fi

echo -e "${GREEN}✨ Testing complete!${NC}"
