#!/bin/bash

# Test Redis Pub/Sub Implementation
# This script tests the Redis Pub/Sub system end-to-end

set -e

BASE_URL="${1:-http://localhost:3000}"
echo "Testing Redis Pub/Sub at ${BASE_URL}"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "1. Testing Redis Diagnostics Endpoint..."
echo "   GET ${BASE_URL}/api/diagnostics/redis"
RESPONSE=$(curl -s -w "\n%{http_code}" "${BASE_URL}/api/diagnostics/redis")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✓ Status: $HTTP_CODE${NC}"
    echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
else
    echo -e "${RED}✗ Status: $HTTP_CODE${NC}"
    echo "$BODY"
fi
echo ""

echo "2. Testing Event Publishing (MSRP Sync)..."
echo "   POST ${BASE_URL}/api/test/orchestrator"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${BASE_URL}/api/test/orchestrator" \
  -H "Content-Type: application/json" \
  -d '{"task": "msrp_sync", "dealerId": "TEST"}')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✓ Status: $HTTP_CODE${NC}"
    echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
else
    echo -e "${RED}✗ Status: $HTTP_CODE${NC}"
    echo "$BODY"
fi
echo ""

echo "3. Testing Event Publishing (AI Score Recompute)..."
echo "   POST ${BASE_URL}/api/test/orchestrator"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${BASE_URL}/api/test/orchestrator" \
  -H "Content-Type: application/json" \
  -d '{"task": "ai_score_recompute", "dealerId": "TEST"}')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✓ Status: $HTTP_CODE${NC}"
    echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
else
    echo -e "${RED}✗ Status: $HTTP_CODE${NC}"
    echo "$BODY"
fi
echo ""

echo "4. Testing SSE Stream (5 seconds)..."
echo "   GET ${BASE_URL}/api/realtime/events?dealerId=TEST"
echo -e "${YELLOW}   (This will run for 5 seconds to capture events)${NC}"
timeout 5 curl -N -s "${BASE_URL}/api/realtime/events?dealerId=TEST" 2>&1 | head -20 || echo "SSE stream test completed"
echo ""

echo "5. Testing Combined Event Publishing..."
echo "   POST ${BASE_URL}/api/test/orchestrator"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${BASE_URL}/api/test/orchestrator" \
  -H "Content-Type: application/json" \
  -d '{"task": "all", "dealerId": "TEST"}')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✓ Status: $HTTP_CODE${NC}"
    echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
else
    echo -e "${RED}✗ Status: $HTTP_CODE${NC}"
    echo "$BODY"
fi
echo ""

echo -e "${GREEN}Test suite completed!${NC}"
echo ""
echo "To test the SSE stream interactively, run:"
echo "  curl -N \"${BASE_URL}/api/realtime/events?dealerId=TEST\""
echo ""
echo "To trigger events while watching the stream, run in another terminal:"
echo "  curl -X POST \"${BASE_URL}/api/test/orchestrator\" \\"
echo "    -H \"Content-Type: application/json\" \\"
echo "    -d '{\"task\": \"all\", \"dealerId\": \"TEST\"}'"

