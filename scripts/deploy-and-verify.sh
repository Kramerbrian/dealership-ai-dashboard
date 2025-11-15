#!/bin/bash

# Deploy and Verify Script
# Deploys to Vercel and verifies deployment

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 Deploy and Verify${NC}"
echo "===================="
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}⚠️  Vercel CLI not found. Installing...${NC}"
    npm install -g vercel
fi

# Check authentication
echo -e "${BLUE}📋 Step 1: Checking authentication${NC}"
if vercel whoami &> /dev/null; then
    USER=$(vercel whoami)
    echo -e "${GREEN}✓ Logged in as: ${USER}${NC}"
else
    echo -e "${RED}✗ Not logged in${NC}"
    echo "   Run: vercel login"
    exit 1
fi

# Check root directory warning
echo ""
echo -e "${YELLOW}⚠️  IMPORTANT: Ensure root directory is set to '.' in Vercel dashboard${NC}"
echo "   Go to: https://vercel.com/[your-team]/[project]/settings"
echo "   Find: Build & Development Settings → Root Directory"
echo "   Set to: . (single dot)"
echo ""
read -p "Have you verified the root directory setting? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}⚠️  Please fix root directory setting first${NC}"
    exit 1
fi

# Run local build check
echo ""
echo -e "${BLUE}📋 Step 2: Running local build check${NC}"
if npm run build 2>&1 | grep -q "Compiled successfully\|Creating an optimized production build"; then
    echo -e "${GREEN}✓ Local build successful${NC}"
else
    echo -e "${RED}✗ Local build failed${NC}"
    echo "   Fix build errors before deploying"
    exit 1
fi

# Deploy to Vercel
echo ""
echo -e "${BLUE}📋 Step 3: Deploying to Vercel${NC}"
read -p "Deploy to production? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    vercel --prod
else
    echo -e "${YELLOW}⚠️  Skipping deployment${NC}"
    exit 0
fi

# Wait for deployment
echo ""
echo -e "${BLUE}📋 Step 4: Waiting for deployment to complete${NC}"
echo "   Check deployment status in Vercel dashboard"
sleep 5

# Run verification
echo ""
echo -e "${BLUE}📋 Step 5: Running verification${NC}"
if [ -f "./scripts/verify-vercel-deployment.sh" ]; then
    ./scripts/verify-vercel-deployment.sh
else
    echo -e "${YELLOW}⚠️  Verification script not found${NC}"
fi

echo ""
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Check deployment: https://vercel.com/[your-team]/[project]/deployments"
echo "2. Verify domain: https://dash.dealershipai.com"
echo "3. Test routes: /dashboard, /pulse, /onboarding"

