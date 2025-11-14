#!/bin/bash
# Setup Clerk SSO for cross-domain authentication
# This script helps configure Clerk for dealershipai.com and dash.dealershipai.com

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔐 Clerk SSO Configuration Helper${NC}\n"

echo -e "${YELLOW}This script will help you configure Clerk for SSO across domains.${NC}\n"

# Check if Clerk CLI is available
if command -v clerk &> /dev/null; then
  echo -e "${GREEN}✅ Clerk CLI found${NC}"
  CLERK_CLI_AVAILABLE=true
else
  echo -e "${YELLOW}⚠️  Clerk CLI not found (optional)${NC}"
  CLERK_CLI_AVAILABLE=false
fi

echo -e "\n${YELLOW}Manual Configuration Steps:${NC}\n"

echo -e "${BLUE}1. Clerk Dashboard Configuration${NC}"
echo -e "   Visit: ${GREEN}https://dashboard.clerk.dev${NC}"
echo -e "   Go to: Settings → Domain & Cookies\n"
echo -e "   Set Cookie Domain: ${GREEN}.dealershipai.com${NC} (with leading dot)\n"
echo -e "   Add Allowed Origins:"
echo -e "     - ${GREEN}https://dealershipai.com${NC}"
echo -e "     - ${GREEN}https://www.dealershipai.com${NC}"
echo -e "     - ${GREEN}https://dash.dealershipai.com${NC}"
echo -e "     - ${GREEN}http://localhost:3000${NC} (dev)\n"
echo -e "   Add Redirect URLs:"
echo -e "     - ${GREEN}https://dealershipai.com/sign-in${NC}"
echo -e "     - ${GREEN}https://dealershipai.com/sign-up${NC}"
echo -e "     - ${GREEN}https://dash.dealershipai.com/sign-in${NC}"
echo -e "     - ${GREEN}https://dash.dealershipai.com/sign-up${NC}\n"

echo -e "${BLUE}2. Environment Variables${NC}"
echo -e "   Ensure both Vercel projects have:"
echo -e "     ${GREEN}NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY${NC}"
echo -e "     ${GREEN}CLERK_SECRET_KEY${NC}\n"

echo -e "${BLUE}3. Test SSO${NC}"
echo -e "   a. Visit: ${GREEN}https://dealershipai.com${NC}"
echo -e "   b. Sign in via Clerk"
echo -e "   c. Visit: ${GREEN}https://dash.dealershipai.com${NC}"
echo -e "   d. Should be automatically signed in\n"

if [ "$CLERK_CLI_AVAILABLE" = true ]; then
  echo -e "${YELLOW}Would you like to check current Clerk configuration? (y/n)${NC}"
  read -r response
  if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    echo -e "\n${YELLOW}Checking Clerk configuration...${NC}"
    clerk status 2>&1 || echo -e "${YELLOW}Not logged in to Clerk CLI${NC}"
  fi
fi

echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Configuration guide complete${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

echo -e "${YELLOW}Next Steps:${NC}"
echo -e "  1. Configure Clerk Dashboard (see steps above)"
echo -e "  2. Set environment variables in Vercel"
echo -e "  3. Test SSO flow"
echo -e "  4. Deploy both projects\n"

echo -e "${YELLOW}Documentation:${NC}"
echo -e "  ${GREEN}docs/CLERK_SSO_SETUP.md${NC} - Complete setup guide\n"

