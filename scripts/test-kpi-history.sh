#!/bin/bash
# Test script for KPI history cron endpoint

set -euo pipefail

# Configuration
BASE_URL="${BASE_URL:-http://localhost:3000}"
CRON_SECRET="${CRON_SECRET:-test-secret}"
TENANT_ID="${TENANT_ID:-00000000-0000-0000-0000-000000000000}"

echo "🧪 Testing KPI History Cron Endpoint"
echo "Base URL: $BASE_URL"
echo "Tenant ID: $TENANT_ID"
echo ""

# Test 1: Health check
echo "1️⃣ Testing health check..."
curl -s "$BASE_URL/api/internal/cron/kpi-history" | jq '.'
echo ""

# Test 2: Single tenant processing
echo "2️⃣ Testing single tenant KPI history fill..."
curl -X POST "$BASE_URL/api/internal/cron/kpi-history" \
  -H "x-cron-secret: $CRON_SECRET" \
  -H "content-type: application/json" \
  -d "{\"tenantId\":\"$TENANT_ID\"}" | jq '.'
echo ""

# Test 3: All tenants processing
echo "3️⃣ Testing all tenants KPI history fill..."
curl -X POST "$BASE_URL/api/internal/cron/kpi-history" \
  -H "x-cron-secret: $CRON_SECRET" \
  -H "content-type: application/json" \
  -d "{}" | jq '.'
echo ""

# Test 4: Invalid secret (should fail)
echo "4️⃣ Testing invalid secret (should fail)..."
curl -X POST "$BASE_URL/api/internal/cron/kpi-history" \
  -H "x-cron-secret: invalid-secret" \
  -H "content-type: application/json" \
  -d "{}" | jq '.'
echo ""

echo "✅ KPI History tests completed!"
