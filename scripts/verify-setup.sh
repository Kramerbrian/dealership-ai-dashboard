#!/bin/bash

# DealershipAI Setup Verification Script
# This script helps verify that OpenAI and Supabase are properly configured

echo "🔍 DealershipAI Setup Verification"
echo "=================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if environment variable is set
check_env_var() {
    local var_name=$1
    local var_value=${!var_name}
    
    if [ -z "$var_value" ]; then
        echo -e "${RED}❌ $var_name is not set${NC}"
        return 1
    else
        echo -e "${GREEN}✅ $var_name is set${NC}"
        return 0
    fi
}

# Function to test API endpoint
test_api_endpoint() {
    local endpoint=$1
    local method=$2
    local data=$3
    local expected_status=$4
    
    echo -n "Testing $endpoint... "
    
    if [ "$method" = "POST" ]; then
        response=$(curl -s -w "%{http_code}" -X POST "http://localhost:3000$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data" 2>/dev/null)
    else
        response=$(curl -s -w "%{http_code}" "http://localhost:3000$endpoint" 2>/dev/null)
    fi
    
    http_code="${response: -3}"
    body="${response%???}"
    
    if [ "$http_code" = "$expected_status" ]; then
        echo -e "${GREEN}✅ OK (HTTP $http_code)${NC}"
        return 0
    else
        echo -e "${RED}❌ FAILED (HTTP $http_code)${NC}"
        echo "Response: $body"
        return 1
    fi
}

echo "1. Checking Environment Variables"
echo "--------------------------------"

# Check if .env.local exists
if [ -f ".env.local" ]; then
    echo -e "${GREEN}✅ .env.local file exists${NC}"
    source .env.local
else
    echo -e "${YELLOW}⚠️  .env.local file not found${NC}"
    echo "Please create .env.local with your configuration"
fi

# Check required environment variables
check_env_var "OPENAI_API_KEY"
check_env_var "OPENAI_ASSISTANT_ID" 
check_env_var "SUPABASE_URL"
check_env_var "SUPABASE_ANON_KEY"

echo ""
echo "2. Testing API Endpoints"
echo "------------------------"

# Check if server is running
if ! curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
    echo -e "${RED}❌ Development server is not running${NC}"
    echo "Please run 'npm run dev' first"
    exit 1
fi

echo -e "${GREEN}✅ Development server is running${NC}"

# Test API endpoints
test_api_endpoint "/api/gpt-proxy" "POST" '{"prompt":"test"}' "200"
test_api_endpoint "/api/aiv-metrics?dealerId=demo-dealer" "GET" "" "200"
test_api_endpoint "/api/elasticity/recompute" "POST" '{"dealerId":"demo-dealer"}' "200"

echo ""
echo "3. Checking Data Sources"
echo "-----------------------"

# Check if we're getting live data or mock data
echo -n "Checking data source... "
aiv_response=$(curl -s "http://localhost:3000/api/aiv-metrics?dealerId=demo-dealer" 2>/dev/null)

if echo "$aiv_response" | grep -q "mock_data"; then
    echo -e "${YELLOW}⚠️  Using mock data (Supabase not configured)${NC}"
elif echo "$aiv_response" | grep -q "live_data"; then
    echo -e "${GREEN}✅ Using live data (Supabase configured)${NC}"
else
    echo -e "${RED}❌ Unknown data source${NC}"
fi

echo ""
echo "4. Dashboard Test"
echo "----------------"

# Test dashboard accessibility
echo -n "Testing dashboard... "
dashboard_status=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000/dashboard" 2>/dev/null)

if [ "$dashboard_status" = "200" ]; then
    echo -e "${GREEN}✅ Dashboard accessible${NC}"
else
    echo -e "${RED}❌ Dashboard not accessible (HTTP $dashboard_status)${NC}"
fi

echo ""
echo "5. Summary"
echo "---------"

# Count successful checks
total_checks=0
passed_checks=0

# Environment variables (4 checks)
for var in OPENAI_API_KEY OPENAI_ASSISTANT_ID SUPABASE_URL SUPABASE_ANON_KEY; do
    total_checks=$((total_checks + 1))
    if [ -n "${!var}" ]; then
        passed_checks=$((passed_checks + 1))
    fi
done

# API endpoints (3 checks)
for endpoint in "/api/gpt-proxy" "/api/aiv-metrics?dealerId=demo-dealer" "/api/elasticity/recompute"; do
    total_checks=$((total_checks + 1))
    if test_api_endpoint "$endpoint" "GET" "" "200" > /dev/null 2>&1; then
        passed_checks=$((passed_checks + 1))
    fi
done

# Dashboard (1 check)
total_checks=$((total_checks + 1))
if [ "$dashboard_status" = "200" ]; then
    passed_checks=$((passed_checks + 1))
fi

echo "Passed: $passed_checks/$total_checks checks"

if [ $passed_checks -eq $total_checks ]; then
    echo -e "${GREEN}🎉 All checks passed! System is ready for production.${NC}"
    exit 0
elif [ $passed_checks -gt $((total_checks / 2)) ]; then
    echo -e "${YELLOW}⚠️  Some checks failed. Please review the configuration.${NC}"
    exit 1
else
    echo -e "${RED}❌ Most checks failed. Please check the setup guide.${NC}"
    exit 1
fi
