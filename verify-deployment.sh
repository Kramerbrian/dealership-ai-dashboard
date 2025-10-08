#!/bin/bash

# DealershipAI Enterprise - Deployment Verification Script
# Tests all API endpoints and services

set -e

DEPLOYMENT_URL="https://dealershipai-enterprise-a839dxdvw-brian-kramers-projects.vercel.app"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   DealershipAI Enterprise - Deployment Verification       ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo "Testing: $DEPLOYMENT_URL"
echo ""

# Function to test endpoint
test_endpoint() {
    local name=$1
    local endpoint=$2
    local method=${3:-GET}

    echo -n "Testing $name... "

    response=$(curl -s -o /dev/null -w "%{http_code}" -X $method "$DEPLOYMENT_URL$endpoint")

    case $response in
        200|201)
            echo -e "${GREEN}✓ OK (HTTP $response)${NC}"
            return 0
            ;;
        401|403)
            echo -e "${YELLOW}⚠ Protected (HTTP $response) - Authentication required${NC}"
            return 1
            ;;
        404)
            echo -e "${RED}✗ Not Found (HTTP $response)${NC}"
            return 1
            ;;
        500|502|503)
            echo -e "${RED}✗ Server Error (HTTP $response)${NC}"
            return 1
            ;;
        *)
            echo -e "${YELLOW}? Unknown (HTTP $response)${NC}"
            return 1
            ;;
    esac
}

echo -e "${BLUE}━━━ Core Endpoints ━━━${NC}"
test_endpoint "Health Check" "/api/health"
test_endpoint "Home Page" "/"
test_endpoint "Dashboard" "/dashboard"
test_endpoint "Sign In" "/auth/signin"

echo ""
echo -e "${BLUE}━━━ API Endpoints ━━━${NC}"
test_endpoint "Scores API" "/api/scores"
test_endpoint "Scoring Engine" "/api/scoring"
test_endpoint "AI Test" "/api/ai/test"

echo ""
echo -e "${BLUE}━━━ Billing Endpoints ━━━${NC}"
test_endpoint "Checkout" "/api/billing/checkout"
test_endpoint "Portal" "/api/billing/portal"
test_endpoint "Usage" "/api/billing/usage"
test_endpoint "Billing Info" "/api/billing/info"

echo ""
echo -e "${BLUE}━━━ Webhook Endpoints ━━━${NC}"
test_endpoint "Stripe Webhook" "/api/webhooks/stripe" "POST"

echo ""
echo -e "${BLUE}━━━ Auth Endpoints ━━━${NC}"
test_endpoint "NextAuth Session" "/api/auth/session"
test_endpoint "Demo Authorize" "/api/auth/demo/authorize"
test_endpoint "Demo Token" "/api/auth/demo/token" "POST"

echo ""
echo -e "${BLUE}━━━ Detailed Health Check ━━━${NC}"

health_response=$(curl -s "$DEPLOYMENT_URL/api/health" 2>/dev/null || echo '{"error": "Unable to fetch"}')

if echo "$health_response" | grep -q "Authentication Required"; then
    echo -e "${YELLOW}⚠ Deployment protection is enabled${NC}"
    echo ""
    echo "To disable protection:"
    echo "1. Visit: https://vercel.com/brian-kramers-projects/dealershipai-enterprise/settings/deployment-protection"
    echo "2. Toggle 'Protection' to OFF"
else
    echo "$health_response" | python3 -m json.tool 2>/dev/null || echo "$health_response"
fi

echo ""
echo -e "${BLUE}━━━ DNS & Connectivity ━━━${NC}"

echo -n "DNS Resolution... "
if host $(echo $DEPLOYMENT_URL | sed 's|https://||' | sed 's|/.*||') > /dev/null 2>&1; then
    echo -e "${GREEN}✓ OK${NC}"
else
    echo -e "${RED}✗ Failed${NC}"
fi

echo -n "SSL Certificate... "
if echo | openssl s_client -connect $(echo $DEPLOYMENT_URL | sed 's|https://||' | sed 's|/.*||'):443 2>/dev/null | grep -q "Verify return code: 0"; then
    echo -e "${GREEN}✓ Valid${NC}"
else
    echo -e "${YELLOW}⚠ Check Certificate${NC}"
fi

echo -n "Response Time... "
start_time=$(date +%s%N)
curl -s -o /dev/null "$DEPLOYMENT_URL/"
end_time=$(date +%s%N)
elapsed=$((($end_time - $start_time) / 1000000))
echo -e "${GREEN}${elapsed}ms${NC}"

echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                   Verification Complete                    ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo "Dashboard URL: $DEPLOYMENT_URL"
echo ""
echo "Next steps:"
echo "1. If endpoints show 'Protected', disable deployment protection"
echo "2. Configure environment variables if health check fails"
echo "3. Set up OAuth providers for authentication"
echo "4. Configure Stripe webhook"
echo ""
echo "For detailed setup instructions:"
echo "  cat DEPLOYMENT-SETUP-GUIDE.md"
echo ""
echo "To run interactive setup:"
echo "  ./setup-deployment.sh"
echo ""
