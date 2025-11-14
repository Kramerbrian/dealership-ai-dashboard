#!/bin/bash
# Verify deployment readiness - checks all prerequisites
# Run this before deploying to ensure everything is configured

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔍 Deployment Readiness Verification${NC}\n"

CHECKS_PASSED=0
CHECKS_FAILED=0
WARNINGS=0

# Check 1: Code changes
echo -e "${YELLOW}1. Checking code changes...${NC}"
if git diff --quiet HEAD middleware.ts 2>/dev/null; then
  if git log -1 --oneline | grep -q "middleware\|domain\|SSO"; then
    echo -e "${GREEN}✅ Code changes committed${NC}"
    ((CHECKS_PASSED++))
  else
    echo -e "${YELLOW}⚠️  Code changes may not be committed${NC}"
    ((WARNINGS++))
  fi
else
  echo -e "${YELLOW}⚠️  Uncommitted changes in middleware.ts${NC}"
  ((WARNINGS++))
fi

# Check 2: Middleware file exists and has domain routing
echo -e "\n${YELLOW}2. Checking middleware configuration...${NC}"
if grep -q "dash.dealershipai.com" middleware.ts 2>/dev/null; then
  echo -e "${GREEN}✅ Domain routing configured${NC}"
  ((CHECKS_PASSED++))
else
  echo -e "${RED}❌ Domain routing not found in middleware${NC}"
  ((CHECKS_FAILED++))
fi

# Check 3: Documentation exists
echo -e "\n${YELLOW}3. Checking documentation...${NC}"
DOCS=(
  "docs/CLERK_SSO_SETUP.md"
  "docs/VERCEL_DEPLOYMENT_GUIDE.md"
  "DEPLOYMENT_READY.md"
)
for doc in "${DOCS[@]}"; do
  if [ -f "$doc" ]; then
    echo -e "${GREEN}✅ $doc exists${NC}"
    ((CHECKS_PASSED++))
  else
    echo -e "${RED}❌ $doc missing${NC}"
    ((CHECKS_FAILED++))
  fi
done

# Check 4: Environment variables (local check)
echo -e "\n${YELLOW}4. Checking environment variables (local)...${NC}"
REQUIRED_VARS=(
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"
  "CLERK_SECRET_KEY"
)

if [ -f ".env.local" ]; then
  for var in "${REQUIRED_VARS[@]}"; do
    if grep -q "$var" .env.local 2>/dev/null; then
      echo -e "${GREEN}✅ $var found in .env.local${NC}"
      ((CHECKS_PASSED++))
    else
      echo -e "${YELLOW}⚠️  $var not in .env.local (may be in Vercel)${NC}"
      ((WARNINGS++))
    fi
  done
else
  echo -e "${YELLOW}⚠️  .env.local not found (variables may be in Vercel)${NC}"
  ((WARNINGS++))
fi

# Check 5: Vercel CLI
echo -e "\n${YELLOW}5. Checking Vercel CLI...${NC}"
if command -v vercel &> /dev/null; then
  echo -e "${GREEN}✅ Vercel CLI installed${NC}"
  if vercel whoami &> /dev/null; then
    echo -e "${GREEN}✅ Logged in to Vercel${NC}"
    ((CHECKS_PASSED++))
  else
    echo -e "${YELLOW}⚠️  Not logged in to Vercel${NC}"
    echo -e "${YELLOW}   Run: vercel login${NC}"
    ((WARNINGS++))
  fi
  ((CHECKS_PASSED++))
else
  echo -e "${YELLOW}⚠️  Vercel CLI not installed${NC}"
  echo -e "${YELLOW}   Install: npm install -g vercel${NC}"
  ((WARNINGS++))
fi

# Check 6: Scripts exist
echo -e "\n${YELLOW}6. Checking deployment scripts...${NC}"
SCRIPTS=(
  "scripts/setup-clerk-sso.sh"
  "scripts/deploy-vercel-projects.sh"
)
for script in "${SCRIPTS[@]}"; do
  if [ -f "$script" ] && [ -x "$script" ]; then
    echo -e "${GREEN}✅ $script exists and is executable${NC}"
    ((CHECKS_PASSED++))
  else
    echo -e "${RED}❌ $script missing or not executable${NC}"
    ((CHECKS_FAILED++))
  fi
done

# Summary
echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Verification Summary${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

echo -e "${GREEN}✅ Passed: $CHECKS_PASSED${NC}"
if [ $WARNINGS -gt 0 ]; then
  echo -e "${YELLOW}⚠️  Warnings: $WARNINGS${NC}"
fi
if [ $CHECKS_FAILED -gt 0 ]; then
  echo -e "${RED}❌ Failed: $CHECKS_FAILED${NC}"
fi

echo -e "\n${YELLOW}Manual Checks Required:${NC}"
echo -e "  [ ] Clerk Dashboard configured (.dealershipai.com cookie domain)"
echo -e "  [ ] Environment variables set in Vercel"
echo -e "  [ ] Domains added in Vercel dashboard"

if [ $CHECKS_FAILED -eq 0 ]; then
  echo -e "\n${GREEN}✅ Code is ready for deployment!${NC}"
  echo -e "${YELLOW}Next: Configure Clerk Dashboard and deploy${NC}\n"
  exit 0
else
  echo -e "\n${RED}❌ Some checks failed. Please fix before deploying.${NC}\n"
  exit 1
fi

