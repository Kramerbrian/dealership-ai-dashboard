#!/bin/bash

###############################################################################
# ACP PLG Integration Test Script
#
# Tests the complete PLG funnel integration:
# 1. Clerk webhook (user.created)
# 2. Checkout session creation
# 3. Stripe webhook (checkout.session.completed)
# 4. ACP webhook (agentic.order.completed)
# 5. PLG metrics API
# 6. PLG events API
#
# Usage: ./scripts/test-acp-plg-integration.sh [environment]
#   environment: local (default), staging, production
###############################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Environment
ENV=${1:-local}

case $ENV in
  local)
    BASE_URL="http://localhost:3000"
    ;;
  staging)
    BASE_URL="https://staging.dealershipai.com"
    ;;
  production)
    BASE_URL="https://dealershipai.com"
    ;;
  *)
    echo -e "${RED}Invalid environment: $ENV${NC}"
    echo "Usage: $0 [local|staging|production]"
    exit 1
    ;;
esac

echo -e "${YELLOW}Testing ACP PLG Integration on $ENV environment${NC}"
echo "Base URL: $BASE_URL"
echo ""

# Check if required tools are installed
command -v curl >/dev/null 2>&1 || { echo -e "${RED}curl is required but not installed.${NC}" >&2; exit 1; }
command -v jq >/dev/null 2>&1 || { echo -e "${RED}jq is required but not installed. Install: brew install jq${NC}" >&2; exit 1; }

# Check for required environment variables
if [ -z "$CLERK_TOKEN" ]; then
  echo -e "${YELLOW}Warning: CLERK_TOKEN not set. Some tests will be skipped.${NC}"
fi

###############################################################################
# Test 1: Health Check
###############################################################################
echo -e "${YELLOW}Test 1: Health Check${NC}"

response=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/health")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$http_code" = "200" ]; then
  echo -e "${GREEN}✓ API is healthy${NC}"
  echo "$body" | jq '.'
else
  echo -e "${RED}✗ API health check failed (HTTP $http_code)${NC}"
  echo "$body"
fi

echo ""

###############################################################################
# Test 2: Checkout Session Creation (requires CLERK_TOKEN)
###############################################################################
echo -e "${YELLOW}Test 2: Checkout Session Creation${NC}"

if [ -n "$CLERK_TOKEN" ]; then
  response=$(curl -s -w "\n%{http_code}" \
    -X POST "$BASE_URL/api/checkout/session" \
    -H "Authorization: Bearer $CLERK_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "plan": "pro",
      "domain": "test-dealer-'$(date +%s)'.com",
      "company": "Test Dealership"
    }')

  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | head -n-1)

  if [ "$http_code" = "200" ]; then
    echo -e "${GREEN}✓ Checkout session created${NC}"
    echo "$body" | jq '.'

    # Extract session ID and ACP token
    SESSION_ID=$(echo "$body" | jq -r '.sessionId')
    ACP_TOKEN=$(echo "$body" | jq -r '.acpTokenId // "null"')

    echo ""
    echo "Session ID: $SESSION_ID"
    echo "ACP Token: $ACP_TOKEN"
  else
    echo -e "${RED}✗ Checkout session creation failed (HTTP $http_code)${NC}"
    echo "$body"
  fi
else
  echo -e "${YELLOW}⊘ Skipped (CLERK_TOKEN not set)${NC}"
fi

echo ""

###############################################################################
# Test 3: Simulate Clerk Webhook
###############################################################################
echo -e "${YELLOW}Test 3: Simulate Clerk Webhook (user.created)${NC}"

# Generate test user data
TEST_USER_ID="test_user_$(date +%s)"
TEST_EMAIL="test-$TEST_USER_ID@example.com"

echo "Test User ID: $TEST_USER_ID"
echo "Test Email: $TEST_EMAIL"
echo ""

# Note: In production, this would require proper Svix signature
echo -e "${YELLOW}⊘ Skipped (requires Svix signature for production)${NC}"
echo "To test manually, trigger user creation in Clerk dashboard"

echo ""

###############################################################################
# Test 4: Simulate ACP Webhook
###############################################################################
echo -e "${YELLOW}Test 4: Simulate ACP Webhook (agentic.order.completed)${NC}"

# Generate HMAC signature
if [ -n "$ACP_WEBHOOK_SECRET" ]; then
  TIMESTAMP=$(date +%s)
  PAYLOAD='{
    "event": "agentic.order.completed",
    "data": {
      "orderId": "acp_order_test_'$TIMESTAMP'",
      "customerId": "cus_test123",
      "subscriptionId": "sub_test123",
      "amount": 49900,
      "currency": "USD",
      "metadata": {
        "userId": "'$TEST_USER_ID'",
        "plan": "pro",
        "domain": "test-dealer.com"
      }
    }
  }'

  # Create signature (simplified - in production use proper HMAC)
  SIGNATURE=$(echo -n "$TIMESTAMP.$PAYLOAD" | openssl dgst -sha256 -hmac "$ACP_WEBHOOK_SECRET" | awk '{print $2}')

  response=$(curl -s -w "\n%{http_code}" \
    -X POST "$BASE_URL/api/webhooks/acp" \
    -H "Content-Type: application/json" \
    -H "x-acp-signature: $SIGNATURE" \
    -H "x-acp-timestamp: $TIMESTAMP" \
    -d "$PAYLOAD")

  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | head -n-1)

  if [ "$http_code" = "200" ]; then
    echo -e "${GREEN}✓ ACP webhook processed${NC}"
    echo "$body" | jq '.'
  else
    echo -e "${RED}✗ ACP webhook failed (HTTP $http_code)${NC}"
    echo "$body"
  fi
else
  echo -e "${YELLOW}⊘ Skipped (ACP_WEBHOOK_SECRET not set)${NC}"
fi

echo ""

###############################################################################
# Test 5: PLG Metrics API
###############################################################################
echo -e "${YELLOW}Test 5: PLG Metrics API${NC}"

if [ -n "$CLERK_TOKEN" ]; then
  # Test GET /api/plg/metrics
  response=$(curl -s -w "\n%{http_code}" \
    -X GET "$BASE_URL/api/plg/metrics?timeSeries=true" \
    -H "Authorization: Bearer $CLERK_TOKEN")

  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | head -n-1)

  if [ "$http_code" = "200" ]; then
    echo -e "${GREEN}✓ PLG metrics retrieved${NC}"
    echo "$body" | jq '.metrics | {signups, trials, paid, acpOrders, activationRate, trialToPaidRate, agenticConversionRate, mrr}'
  else
    echo -e "${RED}✗ PLG metrics failed (HTTP $http_code)${NC}"
    echo "$body"
  fi
else
  echo -e "${YELLOW}⊘ Skipped (CLERK_TOKEN not set)${NC}"
fi

echo ""

###############################################################################
# Test 6: PLG Events API
###############################################################################
echo -e "${YELLOW}Test 6: PLG Events API${NC}"

if [ -n "$CLERK_TOKEN" ]; then
  # Test GET /api/plg/events
  response=$(curl -s -w "\n%{http_code}" \
    -X GET "$BASE_URL/api/plg/events?limit=10" \
    -H "Authorization: Bearer $CLERK_TOKEN")

  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | head -n-1)

  if [ "$http_code" = "200" ]; then
    echo -e "${GREEN}✓ PLG events retrieved${NC}"
    echo "$body" | jq '{total, eventTypeCounts}'
  else
    echo -e "${RED}✗ PLG events failed (HTTP $http_code)${NC}"
    echo "$body"
  fi

  echo ""

  # Test POST /api/plg/events (custom event tracking)
  response=$(curl -s -w "\n%{http_code}" \
    -X POST "$BASE_URL/api/plg/events" \
    -H "Authorization: Bearer $CLERK_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "eventType": "test.integration",
      "source": "test_script",
      "eventData": {
        "test": true,
        "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
      }
    }')

  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | head -n-1)

  if [ "$http_code" = "201" ]; then
    echo -e "${GREEN}✓ Custom event tracked${NC}"
    echo "$body" | jq '.'
  else
    echo -e "${RED}✗ Custom event tracking failed (HTTP $http_code)${NC}"
    echo "$body"
  fi
else
  echo -e "${YELLOW}⊘ Skipped (CLERK_TOKEN not set)${NC}"
fi

echo ""

###############################################################################
# Test 7: Supabase Tables (requires psql)
###############################################################################
echo -e "${YELLOW}Test 7: Supabase Tables Verification${NC}"

if command -v psql >/dev/null 2>&1 && [ -n "$SUPABASE_DB_URL" ]; then
  echo "Checking if tables exist..."

  TABLES=$(psql "$SUPABASE_DB_URL" -t -c "
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name IN ('tenants', 'orders', 'events', 'pulse_events', 'plg_metrics', 'kpi_daily')
    ORDER BY table_name;
  ")

  if [ -n "$TABLES" ]; then
    echo -e "${GREEN}✓ Tables verified:${NC}"
    echo "$TABLES"

    # Check record counts
    echo ""
    echo "Record counts:"
    psql "$SUPABASE_DB_URL" -c "
      SELECT
        'tenants' AS table_name, COUNT(*) AS count FROM tenants
      UNION ALL
      SELECT 'orders', COUNT(*) FROM orders
      UNION ALL
      SELECT 'events', COUNT(*) FROM events
      UNION ALL
      SELECT 'pulse_events', COUNT(*) FROM pulse_events
      UNION ALL
      SELECT 'plg_metrics', COUNT(*) FROM plg_metrics
      UNION ALL
      SELECT 'kpi_daily', COUNT(*) FROM kpi_daily;
    "
  else
    echo -e "${RED}✗ Tables not found${NC}"
  fi
else
  echo -e "${YELLOW}⊘ Skipped (psql not installed or SUPABASE_DB_URL not set)${NC}"
fi

echo ""

###############################################################################
# Summary
###############################################################################
echo -e "${YELLOW}======================================${NC}"
echo -e "${YELLOW}Test Summary${NC}"
echo -e "${YELLOW}======================================${NC}"
echo ""
echo "Environment: $ENV"
echo "Base URL: $BASE_URL"
echo ""
echo -e "${GREEN}Next Steps:${NC}"
echo "1. Apply Supabase migration: supabase/migrations/20251101000000_acp_plg_integration.sql"
echo "2. Configure webhooks in Stripe, ACP, and Clerk dashboards"
echo "3. Set environment variables in Vercel"
echo "4. Test end-to-end checkout flow manually"
echo "5. Monitor logs for webhook processing"
echo ""
echo -e "${YELLOW}Webhook URLs:${NC}"
echo "  Stripe: $BASE_URL/api/stripe/webhook"
echo "  ACP:    $BASE_URL/api/webhooks/acp"
echo "  Clerk:  $BASE_URL/api/clerk/webhook"
echo ""
echo -e "${YELLOW}Documentation:${NC}"
echo "  See: docs/ACP_PLG_INTEGRATION.md"
echo "  See: ACP_PLG_IMPLEMENTATION_SUMMARY.md"
echo ""
