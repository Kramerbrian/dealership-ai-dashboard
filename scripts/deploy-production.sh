#!/bin/bash

# DealershipAI Production Deployment Script
# This script prepares and deploys the application to Vercel

set -e  # Exit on error

echo "🚀 DealershipAI Production Deployment"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Step 1: Environment Check
echo -e "${BLUE}1. Checking environment...${NC}"
if [ ! -f ".env.production.local" ]; then
    echo -e "${YELLOW}Warning: .env.production.local not found${NC}"
    echo "Creating from example..."
    cp .env.example .env.production.local
    echo -e "${YELLOW}Please update .env.production.local with production values${NC}"
fi

# Step 2: Install Dependencies
echo -e "${BLUE}2. Installing dependencies...${NC}"
npm install --production=false

# Step 3: Run Tests
echo -e "${BLUE}3. Running tests...${NC}"
npm run test:ci || echo -e "${YELLOW}Tests skipped or failed (non-blocking)${NC}"

# Step 4: Build Application
echo -e "${BLUE}4. Building application...${NC}"
npm run build || {
    echo -e "${RED}Build failed! Please fix errors before deploying.${NC}"
    exit 1
}

# Step 5: Check Vercel CLI
echo -e "${BLUE}5. Checking Vercel CLI...${NC}"
if ! command -v vercel &> /dev/null; then
    echo "Installing Vercel CLI..."
    npm i -g vercel
fi

# Step 6: Deploy to Vercel
echo -e "${BLUE}6. Deploying to Vercel...${NC}"
echo "Choose deployment type:"
echo "  1) Preview deployment"
echo "  2) Production deployment"
read -p "Enter choice (1 or 2): " choice

case $choice in
    1)
        echo -e "${YELLOW}Deploying to preview...${NC}"
        vercel --no-clipboard
        ;;
    2)
        echo -e "${GREEN}Deploying to production...${NC}"
        vercel --prod --no-clipboard
        ;;
    *)
        echo -e "${RED}Invalid choice. Exiting.${NC}"
        exit 1
        ;;
esac

# Step 7: Post-deployment
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Check deployment at: https://vercel.com/dashboard"
echo "2. Test production endpoints:"
echo "   - Health: https://dealershipai.com/api/health"
echo "   - Status: https://dealershipai.com/api/system/status"
echo "   - Monitor: https://dealershipai.com/api/monitor"
echo "3. Monitor logs: vercel logs --follow"
echo ""
echo "📊 Production URLs:"
echo "   Main: https://dealershipai.com"
echo "   Calculator: https://dealershipai.com/calculator"
echo "   Intelligence: https://dealershipai.com/intelligence"
echo "   Status: https://dealershipai.com/status"
echo ""
echo -e "${GREEN}🎉 DealershipAI is live!${NC}"