#!/bin/bash

# Deploy DealershipAI Dashboard to dash.dealershipai.com
# This script configures and deploys the application to the new domain

set -e

echo "🚀 Deploying DealershipAI Dashboard to dash.dealershipai.com"
echo "=========================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="dash.dealershipai.com"
PROJECT_NAME="dealership-ai-dashboard"

echo -e "${BLUE}📋 Deployment Configuration:${NC}"
echo "Domain: $DOMAIN"
echo "Project: $PROJECT_NAME"
echo ""

# Step 1: Check prerequisites
echo -e "${YELLOW}🔍 Step 1: Checking prerequisites...${NC}"

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}❌ Vercel CLI not found. Installing...${NC}"
    npm install -g vercel
fi

# Check if logged in to Vercel
if ! vercel whoami &> /dev/null; then
    echo -e "${RED}❌ Not logged in to Vercel. Please login first:${NC}"
    echo "vercel login"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites check complete${NC}"

# Step 2: Update environment variables
echo -e "${YELLOW}🔧 Step 2: Updating environment variables...${NC}"

# Set domain-specific environment variables
export NEXT_PUBLIC_APP_URL="https://$DOMAIN"
export NEXTAUTH_URL="https://$DOMAIN"
export VERCEL_URL="$DOMAIN"

echo "Updated environment variables:"
echo "NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL"
echo "NEXTAUTH_URL=$NEXTAUTH_URL"
echo "VERCEL_URL=$VERCEL_URL"

# Step 3: Build the application
echo -e "${YELLOW}🏗️  Step 3: Building application...${NC}"

# Install dependencies
npm install

# Build the application
npm run build

echo -e "${GREEN}✅ Build complete${NC}"

# Step 4: Deploy to Vercel
echo -e "${YELLOW}🚀 Step 4: Deploying to Vercel...${NC}"

# Deploy to production
vercel --prod --yes

echo -e "${GREEN}✅ Deployment complete${NC}"

# Step 5: Configure custom domain
echo -e "${YELLOW}🌐 Step 5: Configuring custom domain...${NC}"

# Add custom domain to Vercel project
vercel domains add $DOMAIN

echo -e "${GREEN}✅ Custom domain configured${NC}"

# Step 6: Test API endpoints
echo -e "${YELLOW}🧪 Step 6: Testing API endpoints...${NC}"

# Test health endpoint
echo "Testing health endpoint..."
curl -f "https://$DOMAIN/api/health" || echo "Health endpoint test failed"

# Test quick audit endpoint
echo "Testing quick audit endpoint..."
curl -X POST "https://$DOMAIN/api/quick-audit" \
  -H "Content-Type: application/json" \
  -d '{"domain":"test.com"}' || echo "Quick audit endpoint test failed"

# Test dashboard overview endpoint
echo "Testing dashboard overview endpoint..."
curl -f "https://$DOMAIN/api/dashboard/overview?dealerId=demo" || echo "Dashboard overview endpoint test failed"

echo -e "${GREEN}✅ API endpoint tests complete${NC}"

# Step 7: Update DNS (if needed)
echo -e "${YELLOW}🌍 Step 7: DNS Configuration${NC}"
echo "If you haven't already, update your DNS settings:"
echo "1. Add a CNAME record pointing $DOMAIN to cname.vercel-dns.com"
echo "2. Or add an A record pointing to Vercel's IP addresses"
echo ""

# Step 8: Final verification
echo -e "${YELLOW}✅ Step 8: Final verification...${NC}"

echo "Deployment Summary:"
echo "=================="
echo "✅ Application built successfully"
echo "✅ Deployed to Vercel"
echo "✅ Custom domain configured: $DOMAIN"
echo "✅ API endpoints tested"
echo ""

echo -e "${GREEN}🎉 Deployment to dash.dealershipai.com complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Verify DNS propagation (may take up to 24 hours)"
echo "2. Test all functionality on the live site"
echo "3. Update any external references to use the new domain"
echo "4. Monitor application performance and logs"
echo ""
echo "Useful URLs:"
echo "- Dashboard: https://$DOMAIN"
echo "- Health Check: https://$DOMAIN/api/health"
echo "- Vercel Dashboard: https://vercel.com/dashboard"
echo ""
