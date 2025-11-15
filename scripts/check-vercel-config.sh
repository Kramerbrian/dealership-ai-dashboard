#!/bin/bash

# Check Vercel Configuration Script
# Inspects current Vercel project configuration

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔧 Vercel Configuration Check${NC}"
echo "================================"
echo ""

# Check Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}⚠️  Vercel CLI not installed${NC}"
    echo "   Install: npm install -g vercel"
    exit 1
fi

# Check authentication
echo -e "${BLUE}📋 Authentication Status${NC}"
if vercel whoami &> /dev/null; then
    USER=$(vercel whoami)
    echo -e "${GREEN}✓ Logged in as: ${USER}${NC}"
else
    echo -e "${RED}✗ Not logged in${NC}"
    echo "   Run: vercel login"
    exit 1
fi

# Check project link
echo ""
echo -e "${BLUE}📋 Project Link Status${NC}"
if [ -f ".vercel/project.json" ]; then
    echo -e "${GREEN}✓ Project linked${NC}"
    echo ""
    cat .vercel/project.json | jq '.' 2>/dev/null || cat .vercel/project.json
else
    echo -e "${YELLOW}⚠️  Project not linked${NC}"
    echo "   Run: vercel link"
    echo ""
fi

# Check vercel.json
echo ""
echo -e "${BLUE}📋 Vercel Configuration File${NC}"
if [ -f "vercel.json" ]; then
    echo -e "${GREEN}✓ vercel.json exists${NC}"
    echo ""
    cat vercel.json | jq '.' 2>/dev/null || cat vercel.json
else
    echo -e "${YELLOW}⚠️  vercel.json not found (optional)${NC}"
fi

# Check environment variables
echo ""
echo -e "${BLUE}📋 Environment Variables${NC}"
if vercel env ls &> /dev/null; then
    echo -e "${GREEN}✓ Environment variables configured${NC}"
    echo ""
    vercel env ls
else
    echo -e "${YELLOW}⚠️  Unable to list environment variables${NC}"
    echo "   Check: https://vercel.com/[your-team]/[project]/settings/environment-variables"
fi

# Check domains
echo ""
echo -e "${BLUE}📋 Domain Configuration${NC}"
if vercel domains ls &> /dev/null; then
    vercel domains ls
else
    echo -e "${YELLOW}⚠️  Unable to list domains${NC}"
    echo "   Check: https://vercel.com/[your-team]/[project]/settings/domains"
fi

echo ""
echo -e "${BLUE}================================"
echo -e "${BLUE}💡 Important Notes${NC}"
echo -e "${BLUE}================================"
echo ""
echo "1. Root Directory must be set to '.' in Vercel dashboard"
echo "2. Dashboard: https://vercel.com/[your-team]/[project]/settings"
echo "3. Build settings override vercel.json"
echo ""

