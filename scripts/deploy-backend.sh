#!/bin/bash

# Complete Backend Deployment Script
# Run this script to deploy the entire backend infrastructure

set -e  # Exit on error

echo "🚀 DealershipAI - Complete Backend Deployment"
echo "=============================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Check Prerequisites
echo "📋 Step 1: Checking prerequisites..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi

# Check if Prisma is installed
if ! command -v npx prisma &> /dev/null; then
    echo -e "${YELLOW}⚠️  Prisma not found, installing...${NC}"
    npm install @prisma/client prisma
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}⚠️  Vercel CLI not found, installing...${NC}"
    npm install -g vercel
fi

echo -e "${GREEN}✅ Prerequisites check passed${NC}"
echo ""

# Step 2: Environment Variables Check
echo "📋 Step 2: Checking environment variables..."

REQUIRED_VARS=(
    "DATABASE_URL"
    "DIRECT_URL"
    "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"
    "CLERK_SECRET_KEY"
)

MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        MISSING_VARS+=("$var")
    fi
done

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
    echo -e "${RED}❌ Missing required environment variables:${NC}"
    printf '%s\n' "${MISSING_VARS[@]}"
    echo ""
    echo "Please set these in your .env.local file or Vercel Dashboard"
    echo "See DEPLOYMENT_SETUP_GUIDE.md for details"
    exit 1
fi

echo -e "${GREEN}✅ Environment variables check passed${NC}"
echo ""

# Step 3: Install Dependencies
echo "📋 Step 3: Installing dependencies..."
npm install
echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# Step 4: Generate Prisma Client
echo "📋 Step 4: Generating Prisma Client..."
npx prisma generate
echo -e "${GREEN}✅ Prisma Client generated${NC}"
echo ""

# Step 5: Database Migration
echo "📋 Step 5: Running database migrations..."

if [ "$NODE_ENV" = "production" ]; then
    echo "Running production migrations..."
    npx prisma migrate deploy
else
    echo "Running development migrations..."
    npx prisma migrate dev --name backend_deployment
fi

echo -e "${GREEN}✅ Database migrations complete${NC}"
echo ""

# Step 6: Build Verification
echo "📋 Step 6: Building application..."
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build successful${NC}"
else
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi

echo ""

# Step 7: Deploy to Vercel
echo "📋 Step 7: Deploying to Vercel..."

read -p "Do you want to deploy to production now? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    vercel --prod
    echo ""
    echo -e "${GREEN}✅ Deployment initiated${NC}"
else
    echo -e "${YELLOW}⏭️  Skipping deployment. Run 'vercel --prod' when ready.${NC}"
fi

echo ""
echo "=============================================="
echo -e "${GREEN}🎉 Backend Deployment Complete!${NC}"
echo "=============================================="
echo ""
echo "Next steps:"
echo "1. Verify deployment in Vercel Dashboard"
echo "2. Test API endpoints (see TESTING_GUIDE.md)"
echo "3. Verify cron jobs are configured"
echo "4. Monitor logs for errors"
echo ""

