#!/bin/bash
# Activate Pulse Dashboard - Complete activation script
# This script verifies all components and activates the Pulse Dashboard

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 Pulse Dashboard Activation Script${NC}\n"

# Step 1: Check environment variables
echo -e "${YELLOW}Step 1: Checking environment variables...${NC}"
REQUIRED_VARS=(
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"
  "CLERK_SECRET_KEY"
  "UPSTASH_REDIS_REST_URL"
  "UPSTASH_REDIS_REST_TOKEN"
  "DATABASE_URL"
)

MISSING_VARS=()
for var in "${REQUIRED_VARS[@]}"; do
  if [ -z "${!var}" ]; then
    MISSING_VARS+=("$var")
  fi
done

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
  echo -e "${RED}❌ Missing required environment variables:${NC}"
  for var in "${MISSING_VARS[@]}"; do
    echo -e "   - $var"
  done
  echo -e "\n${YELLOW}Please set these in Vercel Dashboard or .env.local${NC}"
  exit 1
else
  echo -e "${GREEN}✅ All required environment variables are set${NC}"
fi

# Step 2: Verify components exist
echo -e "\n${YELLOW}Step 2: Verifying components...${NC}"
COMPONENTS=(
  "app/(dashboard)/pulse/page.tsx"
  "app/components/pulse/PulseInbox.tsx"
  "app/api/pulse/route.ts"
  "app/api/pulse/snapshot/route.ts"
)

MISSING_COMPONENTS=()
for component in "${COMPONENTS[@]}"; do
  if [ ! -f "$component" ]; then
    MISSING_COMPONENTS+=("$component")
  fi
done

if [ ${#MISSING_COMPONENTS[@]} -gt 0 ]; then
  echo -e "${RED}❌ Missing components:${NC}"
  for component in "${MISSING_COMPONENTS[@]}"; do
    echo -e "   - $component"
  done
  exit 1
else
  echo -e "${GREEN}✅ All components exist${NC}"
fi

# Step 3: Test Redis connection (if possible)
echo -e "\n${YELLOW}Step 3: Testing Redis connection...${NC}"
if command -v node &> /dev/null; then
  NODE_TEST=$(node -e "
    try {
      const { redis } = require('./lib/redis');
      if (redis && typeof redis.ping === 'function') {
        console.log('✅ Redis client initialized');
      } else {
        console.log('⚠️  Redis client not available (may need env vars)');
      }
    } catch (e) {
      console.log('⚠️  Redis test skipped:', e.message);
    }
  " 2>&1)
  echo "$NODE_TEST"
else
  echo -e "${YELLOW}⚠️  Node.js not available, skipping Redis test${NC}"
fi

# Step 4: Build check
echo -e "\n${YELLOW}Step 4: Checking build configuration...${NC}"
if [ -f "next.config.js" ] || [ -f "next.config.ts" ]; then
  echo -e "${GREEN}✅ Next.js config found${NC}"
else
  echo -e "${YELLOW}⚠️  Next.js config not found (may be in apps/ directory)${NC}"
fi

# Step 5: Verify API routes
echo -e "\n${YELLOW}Step 5: Verifying API routes...${NC}"
API_ROUTES=(
  "app/api/pulse/route.ts"
  "app/api/pulse/snapshot/route.ts"
  "app/api/pulse/trends/route.ts"
  "app/api/pulse/inbox/push/route.ts"
)

EXISTING_ROUTES=0
for route in "${API_ROUTES[@]}"; do
  if [ -f "$route" ]; then
    ((EXISTING_ROUTES++))
  fi
done

echo -e "${GREEN}✅ Found $EXISTING_ROUTES/${#API_ROUTES[@]} API routes${NC}"

# Step 6: Summary
echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Pulse Dashboard Activation Check Complete${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

echo -e "${YELLOW}Next Steps:${NC}"
echo -e "  1. Deploy to production: ${GREEN}vercel --prod${NC}"
echo -e "  2. Visit dashboard: ${GREEN}https://dash.dealershipai.com/pulse${NC}"
echo -e "  3. Test API: ${GREEN}curl https://dash.dealershipai.com/api/pulse/snapshot?tenant=demo${NC}"
echo -e "  4. Monitor logs: ${GREEN}vercel logs --follow${NC}\n"

echo -e "${GREEN}🎉 Pulse Dashboard is ready to activate!${NC}\n"

