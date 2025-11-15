#!/bin/bash

# Verify Vercel Deployment Script
# Checks deployment status, build logs, and domain configuration

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="${VERCEL_PROJECT_NAME:-dealership-ai-dashboard}"
DOMAIN="${VERCEL_DOMAIN:-dash.dealershipai.com}"
BASE_URL="${VERCEL_BASE_URL:-https://dealershipai.com}"

echo -e "${BLUE}🔍 Vercel Deployment Verification${NC}"
echo "=================================="
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}⚠️  Vercel CLI not found. Installing...${NC}"
    npm install -g vercel
fi

# Check if logged in
echo -e "${BLUE}📋 Step 1: Checking Vercel authentication${NC}"
if vercel whoami &> /dev/null; then
    USER=$(vercel whoami)
    echo -e "${GREEN}✓ Logged in as: ${USER}${NC}"
else
    echo -e "${RED}✗ Not logged in. Run: vercel login${NC}"
    exit 1
fi

# Check project link
echo ""
echo -e "${BLUE}📋 Step 2: Checking project link${NC}"
if [ -f ".vercel/project.json" ]; then
    PROJECT_ID=$(cat .vercel/project.json | grep -o '"projectId":"[^"]*"' | cut -d'"' -f4)
    ORG_ID=$(cat .vercel/project.json | grep -o '"orgId":"[^"]*"' | cut -d'"' -f4)
    echo -e "${GREEN}✓ Project linked: ${PROJECT_ID}${NC}"
    echo -e "${GREEN}✓ Organization: ${ORG_ID}${NC}"
else
    echo -e "${YELLOW}⚠️  Project not linked. Run: vercel link${NC}"
fi

# Check root directory setting
echo ""
echo -e "${BLUE}📋 Step 3: Checking root directory setting${NC}"
echo -e "${YELLOW}⚠️  Root directory must be set to '.' in Vercel dashboard${NC}"
echo "   Go to: https://vercel.com/[your-team]/${PROJECT_NAME}/settings"
echo "   Find: Build & Development Settings → Root Directory"
echo "   Set to: . (single dot)"
echo ""

# Check latest deployment
echo -e "${BLUE}📋 Step 4: Checking latest deployment${NC}"
if vercel ls --scope="${ORG_ID}" 2>/dev/null | head -5; then
    echo -e "${GREEN}✓ Deployments found${NC}"
else
    echo -e "${YELLOW}⚠️  No deployments found or unable to list${NC}"
fi

# Test domain accessibility
echo ""
echo -e "${BLUE}📋 Step 5: Testing domain accessibility${NC}"
if curl -s -o /dev/null -w "%{http_code}" "https://${DOMAIN}" | grep -q "200\|301\|302"; then
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "https://${DOMAIN}")
    echo -e "${GREEN}✓ Domain accessible: ${DOMAIN} (HTTP ${HTTP_CODE})${NC}"
else
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "https://${DOMAIN}" 2>/dev/null || echo "000")
    echo -e "${RED}✗ Domain not accessible: ${DOMAIN} (HTTP ${HTTP_CODE})${NC}"
    echo "   Check DNS configuration and Vercel domain settings"
fi

# Test API endpoints
echo ""
echo -e "${BLUE}📋 Step 6: Testing API endpoints${NC}"
ENDPOINTS=(
    "/api/health"
    "/api/pulse"
    "/api/marketpulse/compute"
    "/api/oem/gpt-parse"
    "/api/agentic/execute"
)

for endpoint in "${ENDPOINTS[@]}"; do
    URL="https://${DOMAIN}${endpoint}"
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "${URL}" 2>/dev/null || echo "000")
    if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "401" ]; then
        echo -e "${GREEN}✓ ${endpoint} (HTTP ${HTTP_CODE})${NC}"
    else
        echo -e "${RED}✗ ${endpoint} (HTTP ${HTTP_CODE})${NC}"
    fi
done

# Check build status
echo ""
echo -e "${BLUE}📋 Step 7: Checking build configuration${NC}"
if [ -f "vercel.json" ]; then
    echo -e "${GREEN}✓ vercel.json exists${NC}"
    if grep -q "rootDirectory" vercel.json; then
        ROOT_DIR=$(grep -o '"rootDirectory":"[^"]*"' vercel.json | cut -d'"' -f4)
        echo -e "${YELLOW}⚠️  Root directory in vercel.json: ${ROOT_DIR}${NC}"
        echo "   Note: Vercel dashboard setting overrides this"
    fi
else
    echo -e "${YELLOW}⚠️  vercel.json not found (optional)${NC}"
fi

# Check environment variables
echo ""
echo -e "${BLUE}📋 Step 8: Checking environment variables${NC}"
REQUIRED_VARS=(
    "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"
    "CLERK_SECRET_KEY"
    "DATABASE_URL"
)

for var in "${REQUIRED_VARS[@]}"; do
    if vercel env ls 2>/dev/null | grep -q "${var}"; then
        echo -e "${GREEN}✓ ${var} is set${NC}"
    else
        echo -e "${RED}✗ ${var} is missing${NC}"
    fi
done

# Summary
echo ""
echo -e "${BLUE}==================================${NC}"
echo -e "${BLUE}📊 Verification Summary${NC}"
echo -e "${BLUE}==================================${NC}"
echo ""
echo "Next steps:"
echo "1. Fix root directory in Vercel dashboard (set to '.')"
echo "2. Trigger new deployment: git push origin main"
echo "3. Check deployment logs: https://vercel.com/[your-team]/${PROJECT_NAME}/deployments"
echo "4. Verify domain: https://${DOMAIN}"
echo ""

