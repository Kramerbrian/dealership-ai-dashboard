#!/bin/bash
# Setup Vercel project for dashboard deployment
# Creates project with correct root directory and environment variables

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}⚙️  Vercel Dashboard Project Setup${NC}\n"

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

# Check if logged in
if ! vercel whoami &> /dev/null; then
  echo -e "${YELLOW}Not logged in. Logging in...${NC}"
  vercel login
fi

echo -e "${GREEN}✅ Prerequisites met${NC}\n"

# Navigate to dashboard directory
cd apps/dashboard

# Check if already linked
if [ -f ".vercel/project.json" ]; then
  echo -e "${YELLOW}Project already linked${NC}"
  PROJECT_ID=$(cat .vercel/project.json | grep -o '"projectId":"[^"]*' | cut -d'"' -f4)
  echo -e "${GREEN}Project ID: $PROJECT_ID${NC}\n"
else
  echo -e "${YELLOW}Linking to Vercel project...${NC}"
  echo -e "${YELLOW}When prompted:${NC}"
  echo -e "  - Set up and deploy: ${GREEN}Yes${NC}"
  echo -e "  - Root directory: ${GREEN}apps/dashboard${NC} (or current directory)"
  echo -e "  - Override settings: ${GREEN}No${NC} (use vercel.json)\n"
  
  vercel link
fi

# Environment variables prompt
echo -e "${YELLOW}Environment Variables Setup${NC}"
echo -e "${YELLOW}Add these in Vercel Dashboard or via CLI:${NC}\n"

echo -e "${BLUE}Required Variables:${NC}"
echo -e "  ${GREEN}NEXT_PUBLIC_CLERK_FRONTEND_API${NC}"
echo -e "  ${GREEN}NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY${NC}"
echo -e "  ${GREEN}CLERK_SECRET_KEY${NC}\n"

read -p "Add environment variables now? (y/n): " add_envs
if [[ "$add_envs" =~ ^([yY][eE][sS]|[yY])$ ]]; then
  echo -e "${YELLOW}Adding environment variables...${NC}"
  
  read -p "NEXT_PUBLIC_CLERK_FRONTEND_API: " CLERK_FRONTEND_API
  if [ -n "$CLERK_FRONTEND_API" ]; then
    vercel env add NEXT_PUBLIC_CLERK_FRONTEND_API production <<< "$CLERK_FRONTEND_API"
  fi
  
  read -p "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: " CLERK_PUBLISHABLE_KEY
  if [ -n "$CLERK_PUBLISHABLE_KEY" ]; then
    vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production <<< "$CLERK_PUBLISHABLE_KEY"
  fi
  
  read -p "CLERK_SECRET_KEY: " CLERK_SECRET_KEY
  if [ -n "$CLERK_SECRET_KEY" ]; then
    vercel env add CLERK_SECRET_KEY production <<< "$CLERK_SECRET_KEY"
  fi
  
  echo -e "${GREEN}✅ Environment variables added${NC}\n"
else
  echo -e "${YELLOW}⚠️  Add environment variables manually in Vercel Dashboard${NC}\n"
fi

# Domain setup reminder
echo -e "${YELLOW}Domain Setup:${NC}"
echo -e "  1. Go to Vercel Dashboard → Project → Settings → Domains"
echo -e "  2. Add: ${GREEN}dash.dealershipai.com${NC}"
echo -e "  3. Configure DNS: ${GREEN}CNAME dash → cname.vercel-dns.com${NC}\n"

cd ../..

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Vercel project setup complete!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

echo -e "${YELLOW}Next Steps:${NC}"
echo -e "  1. Add domain in Vercel dashboard"
echo -e "  2. Configure DNS CNAME record"
echo -e "  3. Deploy: ${GREEN}cd apps/dashboard && vercel --prod${NC}"
echo -e "  4. Test: ${GREEN}https://dash.dealershipai.com${NC}\n"

