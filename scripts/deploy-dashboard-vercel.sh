#!/bin/bash
# Deploy dashboard app to Vercel with correct root directory
# This script creates/updates the Vercel project for apps/dashboard

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 Deploy Dashboard to Vercel${NC}\n"

# Check if Vercel CLI is available
if ! command -v vercel &> /dev/null; then
  echo -e "${RED}❌ Vercel CLI not found${NC}"
  echo -e "${YELLOW}Install: npm install -g vercel${NC}"
  exit 1
fi

# Check if logged in
if ! vercel whoami &> /dev/null; then
  echo -e "${YELLOW}Not logged in to Vercel. Logging in...${NC}"
  vercel login
fi

# Check if dashboard app exists
if [ ! -d "apps/dashboard" ]; then
  echo -e "${RED}❌ apps/dashboard directory not found${NC}"
  echo -e "${YELLOW}Create the dashboard app first${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Dashboard app found${NC}\n"

# Check if package.json exists
if [ ! -f "apps/dashboard/package.json" ]; then
  echo -e "${RED}❌ apps/dashboard/package.json not found${NC}"
  exit 1
fi

# Deploy from dashboard directory
echo -e "${YELLOW}Deploying dashboard app...${NC}"
echo -e "${YELLOW}Root Directory: apps/dashboard${NC}\n"

cd apps/dashboard

# Deploy to production
echo -e "${YELLOW}Running: vercel --prod${NC}"
vercel --prod --yes

cd ../..

echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Deployment initiated!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

echo -e "${YELLOW}Next Steps:${NC}"
echo -e "  1. Add domain in Vercel dashboard: ${GREEN}dash.dealershipai.com${NC}"
echo -e "  2. Configure DNS: ${GREEN}CNAME dash → cname.vercel-dns.com${NC}"
echo -e "  3. Add environment variables in Vercel"
echo -e "  4. Test: ${GREEN}https://dash.dealershipai.com${NC}\n"

