#!/bin/bash

# DealershipAI Deployment Script
# This script helps you deploy to production

set -e

echo "🚀 DealershipAI Deployment Script"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Check .env.local
echo "📋 Step 1: Checking environment configuration..."
if [ ! -f .env.local ]; then
    echo -e "${RED}❌ .env.local not found${NC}"
    echo "Creating from .env.example..."
    cp .env.example .env.local
    echo -e "${YELLOW}⚠️  Please edit .env.local with your actual values${NC}"
    exit 1
fi

# Check if critical vars are set
if grep -q "YOUR_" .env.local || grep -q "your-" .env.local; then
    echo -e "${YELLOW}⚠️  .env.local contains placeholder values${NC}"
    echo "Please update .env.local with your actual values before continuing"
    read -p "Press enter to continue anyway, or Ctrl+C to exit..."
fi

echo -e "${GREEN}✅ .env.local exists${NC}"
echo ""

# Step 2: Supabase migration
echo "📋 Step 2: Supabase migration..."
read -p "Do you want to run Supabase migration? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if ! command -v supabase &> /dev/null; then
        echo -e "${RED}❌ Supabase CLI not found${NC}"
        echo "Install with: brew install supabase/tap/supabase"
        exit 1
    fi
    
    # Check if already linked
    if [ -f .supabase/config.toml ]; then
        echo "Project already linked, pushing migration..."
        supabase db push
    else
        echo "Please link your project first:"
        echo "  supabase login"
        echo "  supabase link --project-ref YOUR_PROJECT_REF"
        echo ""
        read -p "Have you linked your project? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            supabase db push
        else
            echo -e "${YELLOW}⚠️  Skipping Supabase migration${NC}"
            echo "Run manually: supabase link --project-ref YOUR_PROJECT_REF && supabase db push"
        fi
    fi
else
    echo -e "${YELLOW}⚠️  Skipping Supabase migration${NC}"
fi
echo ""

# Step 3: Test locally
echo "📋 Step 3: Testing locally..."
read -p "Do you want to test locally? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Starting dev server..."
    echo "Press Ctrl+C to stop when done testing"
    pnpm run dev
else
    echo -e "${YELLOW}⚠️  Skipping local test${NC}"
fi
echo ""

# Step 4: Build
echo "📋 Step 4: Building for production..."
read -p "Do you want to build? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Running build..."
    pnpm run build
    echo -e "${GREEN}✅ Build successful${NC}"
else
    echo -e "${YELLOW}⚠️  Skipping build${NC}"
fi
echo ""

# Step 5: Deploy
echo "📋 Step 5: Deploy to Vercel..."
echo ""
echo "Options:"
echo "  1. Deploy via Vercel Dashboard (recommended)"
echo "     - Push to GitHub"
echo "     - Go to Vercel Dashboard → Deploy"
echo ""
echo "  2. Deploy via Vercel CLI"
echo "     - Run: vercel --prod"
echo ""
read -p "Have you deployed to Vercel? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${GREEN}✅ Deployment complete!${NC}"
else
    echo -e "${YELLOW}⚠️  Remember to deploy to Vercel${NC}"
    echo "Make sure to add all environment variables to Vercel Dashboard"
fi

echo ""
echo "🎉 Deployment process complete!"
echo ""
echo "Next steps:"
echo "  1. Verify production deployment"
echo "  2. Test all endpoints"
echo "  3. Check error logs"
echo "  4. Monitor performance"
