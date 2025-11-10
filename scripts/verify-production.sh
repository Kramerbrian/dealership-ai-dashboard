#!/bin/bash

# Production Verification Script
# Tests core functionality of deployed DealershipAI application

set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Production URL (update to latest deployment)
PROD_URL="https://dealership-ai-dashboard-bvt4d357i-brian-kramer-dealershipai.vercel.app"

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  DealershipAI Production Verification${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Function to test endpoint
test_endpoint() {
    local name=$1
    local path=$2
    local method=${3:-GET}
    
    echo -n "Testing $name... "
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -o /dev/null -w "%{http_code}" "$PROD_URL$path" --max-time 10)
    else
        response=$(curl -s -o /dev/null -w "%{http_code}" -X "$method" "$PROD_URL$path" --max-time 10)
    fi
    
    if [ "$response" = "200" ] || [ "$response" = "401" ] || [ "$response" = "403" ]; then
        echo -e "${GREEN}✓${NC} (HTTP $response)"
        return 0
    else
        echo -e "${RED}✗${NC} (HTTP $response)"
        return 1
    fi
}

# Function to test health endpoint with details
test_health() {
    echo -e "${BLUE}━━━ Health Check ━━━${NC}"
    echo ""
    
    health_response=$(curl -s "$PROD_URL/api/health" --max-time 10)
    
    if [ $? -eq 0 ] && echo "$health_response" | grep -q "status"; then
        echo -e "${GREEN}✓ Health endpoint responding${NC}"
        echo ""
        echo "Health Status:"
        echo "$health_response" | jq '.' 2>/dev/null || echo "$health_response"
        echo ""
        
        # Check specific services
        db_status=$(echo "$health_response" | jq -r '.services.database' 2>/dev/null || echo "unknown")
        redis_status=$(echo "$health_response" | jq -r '.services.redis' 2>/dev/null || echo "unknown")
        
        if [ "$db_status" = "connected" ]; then
            echo -e "${GREEN}✓ Database: Connected${NC}"
        else
            echo -e "${YELLOW}⚠ Database: $db_status${NC}"
        fi
        
        if [ "$redis_status" = "connected" ]; then
            echo -e "${GREEN}✓ Redis: Connected${NC}"
        else
            echo -e "${YELLOW}⚠ Redis: $redis_status${NC}"
        fi
        
        return 0
    else
        echo -e "${RED}✗ Health endpoint failed${NC}"
        return 1
    fi
}

# Start verification
echo -e "${BLUE}Production URL:${NC} $PROD_URL"
echo ""

# Test health endpoint
test_health

echo ""
echo -e "${BLUE}━━━ Core Endpoints ━━━${NC}"
echo ""

# Test core endpoints
test_endpoint "Landing Page" "/"
test_endpoint "Sign In Page" "/sign-in"
test_endpoint "Sign Up Page" "/sign-up"
test_endpoint "Health API" "/api/health"
test_endpoint "Status API" "/api/status"
test_endpoint "V1 Health" "/api/v1/health"

echo ""
echo -e "${BLUE}━━━ API Endpoints ━━━${NC}"
echo ""

# Test API endpoints (may return 401/403 if auth required - that's OK)
test_endpoint "Metrics QAI" "/api/metrics/qai"
test_endpoint "Metrics PIQR" "/api/metrics/piqr"
test_endpoint "AI Scores" "/api/ai-scores"

echo ""
echo -e "${BLUE}━━━ Performance Check ━━━${NC}"
echo ""

# Test response times
echo -n "Health endpoint response time... "
health_time=$(curl -s -o /dev/null -w "%{time_total}" "$PROD_URL/api/health" --max-time 10)
health_time_ms=$(echo "$health_time * 1000" | bc | cut -d. -f1)

if [ "$health_time_ms" -lt 500 ]; then
    echo -e "${GREEN}✓${NC} ${health_time_ms}ms (Excellent)"
elif [ "$health_time_ms" -lt 1000 ]; then
    echo -e "${GREEN}✓${NC} ${health_time_ms}ms (Good)"
elif [ "$health_time_ms" -lt 2000 ]; then
    echo -e "${YELLOW}⚠${NC} ${health_time_ms}ms (Acceptable)"
else
    echo -e "${RED}✗${NC} ${health_time_ms}ms (Slow)"
fi

echo ""
echo -e "${BLUE}━━━ SSL & Security ━━━${NC}"
echo ""

# Check SSL
echo -n "SSL Certificate... "
ssl_check=$(echo | openssl s_client -connect $(echo $PROD_URL | sed 's|https://||' | sed 's|/.*||'):443 -servername $(echo $PROD_URL | sed 's|https://||' | sed 's|/.*||') 2>/dev/null | grep -c "Verify return code: 0" || echo "0")

if [ "$ssl_check" = "1" ]; then
    echo -e "${GREEN}✓ Valid${NC}"
else
    echo -e "${YELLOW}⚠ Check manually${NC}"
fi

# Check security headers
echo -n "Security Headers... "
headers=$(curl -s -I "$PROD_URL/api/health" --max-time 10)
has_xss=$(echo "$headers" | grep -i "X-XSS-Protection" | wc -l)
has_frame=$(echo "$headers" | grep -i "X-Frame-Options" | wc -l)
has_content=$(echo "$headers" | grep -i "X-Content-Type-Options" | wc -l)

if [ "$has_xss" -gt 0 ] && [ "$has_frame" -gt 0 ] && [ "$has_content" -gt 0 ]; then
    echo -e "${GREEN}✓ Present${NC}"
else
    echo -e "${YELLOW}⚠ Some headers missing${NC}"
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${GREEN}Verification Complete!${NC}"
echo ""
echo "Next Steps:"
echo "1. Visit the production site: $PROD_URL"
echo "2. Test sign-up/sign-in flows manually"
echo "3. Check browser console for errors"
echo "4. Review Vercel dashboard for deployment status"
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
