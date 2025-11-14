#!/bin/bash
# Create Vercel projects for landing and dashboard
# Requires: VERCEL_TOKEN, VERCEL_ORG_ID

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

VERCEL_TOKEN="${VERCEL_TOKEN:-}"
VERCEL_ORG_ID="${VERCEL_ORG_ID:-}"
GITHUB_REPO="${GITHUB_REPO:-Kramerbrian/dealership-ai-dashboard}"

if [ -z "$VERCEL_TOKEN" ]; then
  echo -e "${RED}❌ VERCEL_TOKEN not set${NC}"
  echo -e "${YELLOW}Get token from: https://vercel.com/account/tokens${NC}"
  exit 1
fi

if [ -z "$VERCEL_ORG_ID" ]; then
  echo -e "${RED}❌ VERCEL_ORG_ID not set${NC}"
  echo -e "${YELLOW}Get org ID from: https://vercel.com/account${NC}"
  exit 1
fi

echo -e "${GREEN}🚀 Creating Vercel projects...${NC}\n"

# Create Landing Project
echo -e "${YELLOW}Creating landing project...${NC}"
LANDING_RESPONSE=$(curl -s -X POST "https://api.vercel.com/v10/projects" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"dealershipai-landing\",
    \"gitRepository\": {
      \"type\": \"github\",
      \"repo\": \"$GITHUB_REPO\"
    },
    \"rootDirectory\": \"apps/landing\",
    \"framework\": \"nextjs\"
  }")

LANDING_PROJECT_ID=$(echo "$LANDING_RESPONSE" | jq -r '.id // empty')

if [ -n "$LANDING_PROJECT_ID" ] && [ "$LANDING_PROJECT_ID" != "null" ]; then
  echo -e "${GREEN}✅ Landing project created: $LANDING_PROJECT_ID${NC}"
else
  echo -e "${YELLOW}⚠️  Landing project may already exist or creation failed${NC}"
  echo "$LANDING_RESPONSE" | jq '.'
fi

# Create Dashboard Project
echo -e "${YELLOW}Creating dashboard project...${NC}"
DASHBOARD_RESPONSE=$(curl -s -X POST "https://api.vercel.com/v10/projects" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"dealershipai-dashboard\",
    \"gitRepository\": {
      \"type\": \"github\",
      \"repo\": \"$GITHUB_REPO\"
    },
    \"rootDirectory\": \"apps/dashboard\",
    \"framework\": \"nextjs\"
  }")

DASHBOARD_PROJECT_ID=$(echo "$DASHBOARD_RESPONSE" | jq -r '.id // empty')

if [ -n "$DASHBOARD_PROJECT_ID" ] && [ "$DASHBOARD_PROJECT_ID" != "null" ]; then
  echo -e "${GREEN}✅ Dashboard project created: $DASHBOARD_PROJECT_ID${NC}"
else
  echo -e "${YELLOW}⚠️  Dashboard project may already exist or creation failed${NC}"
  echo "$DASHBOARD_RESPONSE" | jq '.'
fi

echo -e "\n${GREEN}✨ Project creation complete!${NC}"
echo -e "${YELLOW}Next steps:${NC}"
echo -e "  1. Add domains in Vercel dashboard"
echo -e "  2. Add environment variables"
echo -e "  3. Configure DNS records"
echo -e "  4. Deploy both projects"

