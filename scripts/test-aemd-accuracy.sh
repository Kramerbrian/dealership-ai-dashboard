#!/bin/bash

# Test AEMD and Accuracy Monitoring System
# Usage: ./scripts/test-aemd-accuracy.sh [base_url]

set -e

BASE_URL=${1:-"http://localhost:3000"}
TENANT_ID="test-tenant-$(date +%s)"
REPORT_DATE=$(date +%Y-%m-%d)

echo "========================================"
echo "AEMD & Accuracy Monitoring Test Suite"
echo "========================================"
echo "Base URL: $BASE_URL"
echo "Tenant ID: $TENANT_ID"
echo "Report Date: $REPORT_DATE"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Function to test endpoint
test_endpoint() {
  local name=$1
  local method=$2
  local url=$3
  local data=$4
  local expected_status=${5:-200}

  echo -n "Testing: $name... "

  if [ "$method" == "GET" ]; then
    response=$(curl -s -w "\n%{http_code}" "$url")
  else
    response=$(curl -s -w "\n%{http_code}" -X "$method" "$url" \
      -H "Content-Type: application/json" \
      -d "$data")
  fi

  # Split response and status code
  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | head -n-1)

  if [ "$http_code" -eq "$expected_status" ]; then
    echo -e "${GREEN}✓ PASS${NC} (HTTP $http_code)"
    TESTS_PASSED=$((TESTS_PASSED + 1))
    return 0
  else
    echo -e "${RED}✗ FAIL${NC} (HTTP $http_code, expected $expected_status)"
    echo "Response: $body"
    TESTS_FAILED=$((TESTS_FAILED + 1))
    return 1
  fi
}

echo "========================================"
echo "1. AEMD Metrics Tests"
echo "========================================"
echo ""

# Test 1: Create AEMD metric
echo "Test 1.1: Create AEMD metric"
test_endpoint \
  "POST /api/aemd-metrics" \
  "POST" \
  "$BASE_URL/api/aemd-metrics" \
  '{
    "tenant_id": "'"$TENANT_ID"'",
    "report_date": "'"$REPORT_DATE"'",
    "ctr_p3": 0.0523,
    "ctr_fs": 0.0412,
    "total_vdp_views": 15000,
    "vdp_views_ai": 8500,
    "total_assisted_conversions": 245,
    "assisted_conversions_paa": 178,
    "omega_def": 1.0
  }'

echo ""

# Test 2: Get AEMD metrics
echo "Test 1.2: Get AEMD metrics"
test_endpoint \
  "GET /api/aemd-metrics" \
  "GET" \
  "$BASE_URL/api/aemd-metrics?tenant_id=$TENANT_ID"

echo ""

# Test 3: Get AEMD metrics with date range
echo "Test 1.3: Get AEMD metrics with date range"
START_DATE=$(date -v-7d +%Y-%m-%d 2>/dev/null || date -d '7 days ago' +%Y-%m-%d)
test_endpoint \
  "GET /api/aemd-metrics (with date range)" \
  "GET" \
  "$BASE_URL/api/aemd-metrics?tenant_id=$TENANT_ID&start_date=$START_DATE&end_date=$REPORT_DATE"

echo ""
echo "========================================"
echo "2. Accuracy Monitoring Tests"
echo "========================================"
echo ""

# Test 4: Create accuracy monitoring (good metrics)
echo "Test 2.1: Create accuracy monitoring (good metrics)"
test_endpoint \
  "POST /api/accuracy-monitoring (good)" \
  "POST" \
  "$BASE_URL/api/accuracy-monitoring" \
  '{
    "tenant_id": "'"$TENANT_ID"'",
    "measurement_date": "'"$(date -u +%Y-%m-%dT%H:%M:%SZ)"'",
    "issue_detection_accuracy": 0.88,
    "ranking_correlation": 0.72,
    "consensus_reliability": 0.92,
    "variance": 4.3,
    "sample_size": 1000,
    "model_version": "v2.3.1",
    "evaluation_method": "cross-validation"
  }'

echo ""

# Test 5: Create accuracy monitoring (below threshold - should trigger alert)
echo "Test 2.2: Create accuracy monitoring (below threshold)"
test_endpoint \
  "POST /api/accuracy-monitoring (warning)" \
  "POST" \
  "$BASE_URL/api/accuracy-monitoring" \
  '{
    "tenant_id": "'"$TENANT_ID"'",
    "measurement_date": "'"$(date -u +%Y-%m-%dT%H:%M:%SZ)"'",
    "issue_detection_accuracy": 0.68,
    "ranking_correlation": 0.65,
    "consensus_reliability": 0.82,
    "variance": 6.5,
    "sample_size": 1000,
    "model_version": "v2.3.1"
  }'

echo ""

# Test 6: Get accuracy monitoring
echo "Test 2.3: Get accuracy monitoring"
test_endpoint \
  "GET /api/accuracy-monitoring" \
  "GET" \
  "$BASE_URL/api/accuracy-monitoring?tenant_id=$TENANT_ID"

echo ""

# Test 7: Get accuracy monitoring with alerts
echo "Test 2.4: Get accuracy monitoring with alerts"
test_endpoint \
  "GET /api/accuracy-monitoring (with alerts)" \
  "GET" \
  "$BASE_URL/api/accuracy-monitoring?tenant_id=$TENANT_ID&include_alerts=true"

echo ""

# Test 8: Get accuracy thresholds
echo "Test 2.5: Get accuracy thresholds"
test_endpoint \
  "GET /api/accuracy-monitoring/thresholds" \
  "PATCH" \
  "$BASE_URL/api/accuracy-monitoring?action=get-thresholds&tenant_id=$TENANT_ID" \
  ""

echo ""
echo "========================================"
echo "3. Integration Tests"
echo "========================================"
echo ""

# Test 9: Get AVI report (should include AEMD and accuracy data)
echo "Test 3.1: Get enhanced AVI report"
test_endpoint \
  "GET /api/avi-report (with AEMD & accuracy)" \
  "GET" \
  "$BASE_URL/api/avi-report?tenantId=$TENANT_ID"

echo ""
echo "========================================"
echo "4. Edge Cases & Validation"
echo "========================================"
echo ""

# Test 10: Invalid AEMD data (negative values)
echo "Test 4.1: Invalid AEMD data (should fail)"
test_endpoint \
  "POST /api/aemd-metrics (invalid)" \
  "POST" \
  "$BASE_URL/api/aemd-metrics" \
  '{
    "tenant_id": "'"$TENANT_ID"'",
    "report_date": "'"$REPORT_DATE"'",
    "ctr_p3": -0.05,
    "ctr_fs": 0.04,
    "total_vdp_views": 15000,
    "vdp_views_ai": 8500,
    "total_assisted_conversions": 245,
    "assisted_conversions_paa": 178
  }' \
  400

echo ""

# Test 11: Invalid accuracy data (out of range)
echo "Test 4.2: Invalid accuracy data (should fail)"
test_endpoint \
  "POST /api/accuracy-monitoring (invalid)" \
  "POST" \
  "$BASE_URL/api/accuracy-monitoring" \
  '{
    "tenant_id": "'"$TENANT_ID"'",
    "issue_detection_accuracy": 1.5,
    "ranking_correlation": 0.72,
    "consensus_reliability": 0.92,
    "variance": 4.3
  }' \
  400

echo ""

# Test 12: Missing required fields
echo "Test 4.3: Missing required fields (should fail)"
test_endpoint \
  "POST /api/aemd-metrics (missing fields)" \
  "POST" \
  "$BASE_URL/api/aemd-metrics" \
  '{
    "tenant_id": "'"$TENANT_ID"'",
    "report_date": "'"$REPORT_DATE"'"
  }' \
  400

echo ""
echo "========================================"
echo "Test Summary"
echo "========================================"
echo ""
echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Failed: $TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
  echo -e "${GREEN}✓ All tests passed!${NC}"
  exit 0
else
  echo -e "${YELLOW}⚠ Some tests failed${NC}"
  exit 1
fi
