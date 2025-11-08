#!/bin/bash

# DealershipAI Production Deployment Script
# This script helps deploy to Vercel with proper checks

set -e

echo "🚀 DealershipAI Production Deployment"
echo "===================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Check if Vercel CLI is installed
echo "📦 Checking Vercel CLI..."
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}❌ Vercel CLI not found. Install with: npm i -g vercel${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Vercel CLI found${NC}"
echo ""

# Step 2: Run build locally
echo "🔨 Running production build..."
npm run build
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build successful${NC}"
else
    echo -e "${RED}❌ Build failed. Fix errors before deploying.${NC}"
    exit 1
fi
echo ""

# Step 3: Check environment variables
echo "🔐 Checking environment variables..."
echo -e "${YELLOW}⚠️  Make sure these are set in Vercel:${NC}"
echo "   - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"
echo "   - CLERK_SECRET_KEY"
echo "   - SUPABASE_URL"
echo "   - SUPABASE_SERVICE_KEY"
echo "   - ADMIN_EMAILS"
echo ""
read -p "Have you set all required environment variables in Vercel? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}⚠️  Please set environment variables first:${NC}"
    echo "   vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production"
    echo "   vercel env add CLERK_SECRET_KEY production"
    echo "   # ... etc"
    exit 1
fi
echo ""

# Step 4: Deploy to production
echo "🚀 Deploying to production..."
read -p "Deploy to production now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    vercel --prod
    echo ""
    echo -e "${GREEN}✅ Deployment complete!${NC}"
    echo ""
    echo "📋 Post-Deployment Checklist:"
    echo "   1. Test landing page: https://your-domain.com"
    echo "   2. Test sign up flow → should redirect to /onboarding"
    echo "   3. Complete onboarding → should redirect to /dashboard"
    echo "   4. Verify Clerk metadata updates"
    echo "   5. Check Vercel logs for errors"
else
    echo -e "${YELLOW}Deployment cancelled${NC}"
fi
