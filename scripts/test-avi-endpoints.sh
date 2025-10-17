#!/bin/bash

# AVI Endpoints Smoke Tests
# DealershipAI - Test AVI API endpoints

set -e

BASE_URL=${BASE_URL:-"http://localhost:3000"}
TENANT_ID=${TENANT_ID:-"demo-lou-grubbs"}

echo "🧪 Testing AVI endpoints..."
echo "Base URL: $BASE_URL"
echo "Tenant ID: $TENANT_ID"
echo ""

# Test latest AVI endpoint
echo "📊 Testing /api/tenants/$TENANT_ID/avi/latest"
LATEST_RESPONSE=$(curl -sS "$BASE_URL/api/tenants/$TENANT_ID/avi/latest" \
  -H "x-tenant: $TENANT_ID" \
  -H "Content-Type: application/json")

echo "Response:"
echo "$LATEST_RESPONSE" | jq '.'

# Extract key fields
AS_OF=$(echo "$LATEST_RESPONSE" | jq -r '.data.as_of // "null"')
AIV_PCT=$(echo "$LATEST_RESPONSE" | jq -r '.data.aiv_pct // "null"')
ELASTICITY=$(echo "$LATEST_RESPONSE" | jq -r '.data.elasticity_usd_per_point // "null"')
R2=$(echo "$LATEST_RESPONSE" | jq -r '.data.r2 // "null"')

echo ""
echo "Key metrics:"
echo "  As of: $AS_OF"
echo "  AIV%: $AIV_PCT"
echo "  Elasticity: $ELASTICITY"
echo "  R²: $R2"
echo ""

# Test history endpoint
echo "📈 Testing /api/tenants/$TENANT_ID/avi/history?limit=4"
HISTORY_RESPONSE=$(curl -sS "$BASE_URL/api/tenants/$TENANT_ID/avi/history?limit=4" \
  -H "x-tenant: $TENANT_ID" \
  -H "Content-Type: application/json")

echo "Response:"
echo "$HISTORY_RESPONSE" | jq '.'

# Extract history metrics
DATA_LENGTH=$(echo "$HISTORY_RESPONSE" | jq -r '.data | length')
NEXT_CURSOR=$(echo "$HISTORY_RESPONSE" | jq -r '.nextCursor // "null"')

echo ""
echo "History metrics:"
echo "  Records: $DATA_LENGTH"
echo "  Next cursor: $NEXT_CURSOR"
echo ""

# Test cron endpoint (if accessible)
echo "⏰ Testing /api/internal/cron/compute-avi"
CRON_RESPONSE=$(curl -sS "$BASE_URL/api/internal/cron/compute-avi" \
  -H "Authorization: Bearer ${CRON_SECRET:-default-secret}" \
  -H "Content-Type: application/json" || echo '{"error": "Unauthorized or not accessible"}')

echo "Response:"
echo "$CRON_RESPONSE" | jq '.'

echo ""
echo "✅ AVI endpoint tests completed!"