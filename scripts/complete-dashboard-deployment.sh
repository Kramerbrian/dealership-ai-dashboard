#!/bin/bash
# Complete dashboard deployment script
# Handles Vercel project creation, env vars, and deployment

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 Complete Dashboard Deployment${NC}\n"

# Check prerequisites
if ! command -v vercel &> /dev/null; then
  echo -e "${RED}❌ Vercel CLI not found${NC}"
  echo -e "${YELLOW}Install: npm install -g vercel${NC}"
  exit 1
fi

if [ ! -d "apps/dashboard" ]; then
  echo -e "${RED}❌ apps/dashboard directory not found${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Prerequisites met${NC}\n"

# Step 1: Verify files exist
echo -e "${YELLOW}Step 1: Verifying dashboard files...${NC}"
REQUIRED_FILES=(
  "apps/dashboard/package.json"
  "apps/dashboard/middleware.ts"
  "apps/dashboard/app/layout.tsx"
  "apps/dashboard/app/page.tsx"
)

for file in "${REQUIRED_FILES[@]}"; do
  if [ -f "$file" ]; then
    echo -e "${GREEN}✅ $(basename $file)${NC}"
  else
    echo -e "${RED}❌ Missing: $file${NC}"
    exit 1
  fi
done

# Step 2: Link to Vercel
echo -e "\n${YELLOW}Step 2: Linking to Vercel project...${NC}"
cd apps/dashboard

if [ ! -f ".vercel/project.json" ]; then
  echo -e "${YELLOW}Not linked. Running vercel link...${NC}"
  vercel link
else
  echo -e "${GREEN}✅ Already linked${NC}"
fi

# Step 3: Environment variables
echo -e "\n${YELLOW}Step 3: Environment Variables${NC}"
echo -e "${YELLOW}Required variables:${NC}"
echo -e "  - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"
echo -e "  - CLERK_SECRET_KEY"
echo -e "  - DATABASE_URL (if using database)"
echo -e "  - UPSTASH_REDIS_REST_URL (if using Redis)"
echo -e "\n${YELLOW}Add these in Vercel Dashboard or via CLI${NC}"

# Step 4: Deploy
echo -e "\n${YELLOW}Step 4: Deploying to production...${NC}"
read -p "Deploy now? (y/n): " deploy
if [[ "$deploy" =~ ^([yY][eE][sS]|[yY])$ ]]; then
  vercel --prod --yes
  echo -e "${GREEN}✅ Deployment complete!${NC}"
else
  echo -e "${YELLOW}Deployment skipped. Run 'vercel --prod' when ready.${NC}"
fi

cd ../..

# Step 5: Domain reminder
echo -e "\n${YELLOW}Step 5: Domain Configuration${NC}"
echo -e "${YELLOW}Don't forget to:${NC}"
echo -e "  1. Add domain in Vercel: ${GREEN}dash.dealershipai.com${NC}"
echo -e "  2. Configure DNS: ${GREEN}CNAME dash → cname.vercel-dns.com${NC}"
echo -e "  3. Configure Clerk: ${GREEN}Add dash.dealershipai.com to allowed origins${NC}"

echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Deployment process complete!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

