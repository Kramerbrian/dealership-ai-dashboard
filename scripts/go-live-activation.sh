#!/bin/bash

# Go Live Activation Script
# Activates dealershipai.com and dash.dealershipai.com

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "🚀 GO LIVE: 100% Activation"
echo "=============================="
echo ""

# Check Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}Installing Vercel CLI...${NC}"
    npm install -g vercel
fi

# Check login
if ! vercel whoami &> /dev/null; then
    echo -e "${RED}❌ Not logged in. Run: vercel login${NC}"
    exit 1
fi

echo -e "${BLUE}📋 Activation Checklist:${NC}"
echo ""
echo "1. Environment Variables"
echo "2. Clerk Configuration"
echo "3. DNS & Domains"
echo "4. Database Verification"
echo "5. Final Deployment"
echo "6. Testing"
echo ""

echo -e "${YELLOW}⚠️  This script will guide you through each step.${NC}"
echo ""

# Step 1: Environment Variables
echo -e "${BLUE}Step 1: Environment Variables${NC}"
echo "----------------------------"
echo ""
echo "Setting Supabase variables from MCP..."
echo "https://gzlgfghpkbqlhgfozjkb.supabase.co" | vercel env add NEXT_PUBLIC_SUPABASE_URL production 2>&1 | grep -v "Vercel CLI" || echo "  (may already exist)"
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6bGdmZ2hwa2JxbGhnZm96amtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzOTg1MDQsImV4cCI6MjA3MDk3NDUwNH0.0X_zVfNH9K5FBDcMl_O7yeXJYwuWvGLALwjIe5JRlqg" | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production 2>&1 | grep -v "Vercel CLI" || echo "  (may already exist)"

echo ""
echo -e "${YELLOW}⚠️  Manual Steps Required:${NC}"
echo ""
echo "1. Set SUPABASE_SERVICE_ROLE_KEY:"
echo "   vercel env add SUPABASE_SERVICE_ROLE_KEY production"
echo "   (Get from Supabase Dashboard → Settings → API)"
echo ""
echo "2. Set Clerk Keys:"
echo "   vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production"
echo "   vercel env add CLERK_SECRET_KEY production"
echo "   (Get from Clerk Dashboard → API Keys)"
echo ""

read -p "Press Enter after setting all environment variables..."

# Step 2: Deploy
echo ""
echo -e "${BLUE}Step 2: Deploying to Production${NC}"
echo "----------------------------"
echo ""
read -p "Deploy to production now? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Deploying..."
    vercel --prod
else
    echo "Skipping deployment. Run 'vercel --prod' when ready."
fi

# Step 3: Testing
echo ""
echo -e "${BLUE}Step 3: Testing${NC}"
echo "----------------------------"
echo ""
echo "Testing endpoints..."
echo ""

# Test health endpoint
if curl -s "https://dealershipai.com/api/health" | grep -q "healthy"; then
    echo -e "${GREEN}✅ Landing page health check: PASS${NC}"
else
    echo -e "${RED}❌ Landing page health check: FAIL${NC}"
fi

# Test sign-in page
SIGN_IN_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://dash.dealershipai.com/sign-in")
if [ "$SIGN_IN_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ Sign-in page: PASS (HTTP $SIGN_IN_STATUS)${NC}"
else
    echo -e "${RED}❌ Sign-in page: FAIL (HTTP $SIGN_IN_STATUS)${NC}"
fi

echo ""
echo -e "${GREEN}✅ Activation script complete!${NC}"
echo ""
echo "📋 Next Steps:"
echo "  1. Test in browser: https://dealershipai.com"
echo "  2. Test sign-in: https://dash.dealershipai.com/sign-in"
echo "  3. Verify Clerk configuration in Clerk Dashboard"
echo "  4. Check DNS propagation if domains don't resolve"
echo ""

