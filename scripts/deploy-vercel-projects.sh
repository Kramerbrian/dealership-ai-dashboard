#!/bin/bash
# Deploy both landing and dashboard projects to Vercel
# This script helps deploy the monorepo structure

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 Vercel Deployment Script${NC}\n"

# Check if Vercel CLI is available
if ! command -v vercel &> /dev/null; then
  echo -e "${RED}❌ Vercel CLI not found${NC}"
  echo -e "${YELLOW}Install: npm install -g vercel${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Vercel CLI found${NC}\n"

# Check if logged in
if ! vercel whoami &> /dev/null; then
  echo -e "${YELLOW}Not logged in to Vercel. Logging in...${NC}"
  vercel login
fi

echo -e "${YELLOW}Deployment Options:${NC}\n"
echo -e "  1. Deploy current project (single app)"
echo -e "  2. Deploy as monorepo (landing + dashboard)"
echo -e "  3. Check deployment status"
echo -e "  4. Exit\n"

read -p "Select option (1-4): " option

case $option in
  1)
    echo -e "\n${YELLOW}Deploying current project...${NC}"
    vercel --prod
    ;;
  2)
    echo -e "\n${YELLOW}Monorepo deployment requires separate Vercel projects.${NC}"
    echo -e "${YELLOW}See: docs/DEPLOYMENT_PLAN_CLERK_SSO.md${NC}\n"
    echo -e "${BLUE}Option A: Single Project (Current Setup)${NC}"
    echo -e "  - Both domains point to same Vercel project"
    echo -e "  - Middleware handles domain routing"
    echo -e "  - Simpler setup\n"
    echo -e "${BLUE}Option B: Two Projects (Monorepo)${NC}"
    echo -e "  - Landing: apps/landing/"
    echo -e "  - Dashboard: apps/dashboard/"
    echo -e "  - Requires separate Vercel projects\n"
    ;;
  3)
    echo -e "\n${YELLOW}Checking deployment status...${NC}"
    vercel ls
    ;;
  4)
    echo -e "\n${GREEN}Exiting...${NC}"
    exit 0
    ;;
  *)
    echo -e "\n${RED}Invalid option${NC}"
    exit 1
    ;;
esac

echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Deployment complete${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

