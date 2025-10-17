#!/bin/bash

# Test script for AVI API endpoints
BASE_URL="http://localhost:3000"
TENANT_ID="demo-lou-grubbs"

echo "🧪 Testing AVI API Endpoints"
echo "================================"

echo "1. Testing AVI Latest endpoint..."
curl -sS "$BASE_URL/api/tenants/$TENANT_ID/avi/latest" | jq '.data.as_of,.data.aiv_pct,.data.elasticity_usd_per_point,.data.r2'

echo -e "\n2. Testing AVI History endpoint..."
curl -sS "$BASE_URL/api/tenants/$TENANT_ID/avi/history?limit=4" | jq '.data|length,.nextCursor'

echo -e "\n3. Testing KPI History endpoint..."
curl -sS "$BASE_URL/api/tenants/$TENANT_ID/kpi/history" | jq '.data|keys'

echo -e "\n4. Testing Alerts endpoint..."
curl -sS "$BASE_URL/api/tenants/$TENANT_ID/alerts/latest" | jq '.data|length'

echo -e "\n✅ API tests completed!"
