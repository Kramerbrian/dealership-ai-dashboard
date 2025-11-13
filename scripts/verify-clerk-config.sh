#!/bin/bash

# Verify Clerk Configuration
# Checks environment variables and domain configuration

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 Verifying Clerk Configuration${NC}\n"

# Check .env.local
echo -e "${BLUE}📋 Checking .env.local...${NC}"
if [ -f .env.local ]; then
  source .env.local
  
  if [ -z "$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" ]; then
    echo -e "${RED}❌ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY not found in .env.local${NC}"
  else
    KEY_PREFIX=$(echo "$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" | cut -d'_' -f1-2)
    echo -e "${GREEN}✅ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY found: ${KEY_PREFIX}_***${NC}"
    
    if [[ "$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" =~ ^pk_live_ ]]; then
      echo -e "${GREEN}   → Production key detected${NC}"
    elif [[ "$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" =~ ^pk_test_ ]]; then
      echo -e "${YELLOW}   → Development key detected${NC}"
    fi
  fi
  
  if [ -z "$CLERK_SECRET_KEY" ]; then
    echo -e "${RED}❌ CLERK_SECRET_KEY not found in .env.local${NC}"
  else
    KEY_PREFIX=$(echo "$CLERK_SECRET_KEY" | cut -d'_' -f1-2)
    echo -e "${GREEN}✅ CLERK_SECRET_KEY found: ${KEY_PREFIX}_***${NC}"
    
    if [[ "$CLERK_SECRET_KEY" =~ ^sk_live_ ]]; then
      echo -e "${GREEN}   → Production key detected${NC}"
    elif [[ "$CLERK_SECRET_KEY" =~ ^sk_test_ ]]; then
      echo -e "${YELLOW}   → Development key detected${NC}"
    fi
  fi
else
  echo -e "${RED}❌ .env.local not found${NC}"
fi

# Check Vercel (if CLI available)
echo -e "\n${BLUE}📋 Checking Vercel environment variables...${NC}"
if command -v vercel &> /dev/null; then
  if vercel env ls 2>/dev/null | grep -q "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"; then
    echo -e "${GREEN}✅ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY found in Vercel${NC}"
  else
    echo -e "${YELLOW}⚠️  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY not found in Vercel${NC}"
    echo "   Add with: vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production"
  fi
  
  if vercel env ls 2>/dev/null | grep -q "CLERK_SECRET_KEY"; then
    echo -e "${GREEN}✅ CLERK_SECRET_KEY found in Vercel${NC}"
  else
    echo -e "${YELLOW}⚠️  CLERK_SECRET_KEY not found in Vercel${NC}"
    echo "   Add with: vercel env add CLERK_SECRET_KEY production"
  fi
else
  echo -e "${YELLOW}⚠️  Vercel CLI not installed${NC}"
fi

# Check Supabase (if CLI available)
echo -e "\n${BLUE}📋 Checking Supabase secrets...${NC}"
if command -v supabase &> /dev/null; then
  if supabase secrets list 2>/dev/null | grep -q "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"; then
    echo -e "${GREEN}✅ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY found in Supabase${NC}"
  else
    echo -e "${YELLOW}⚠️  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY not found in Supabase${NC}"
  fi
  
  if supabase secrets list 2>/dev/null | grep -q "CLERK_SECRET_KEY"; then
    echo -e "${GREEN}✅ CLERK_SECRET_KEY found in Supabase${NC}"
  else
    echo -e "${YELLOW}⚠️  CLERK_SECRET_KEY not found in Supabase${NC}"
  fi
else
  echo -e "${YELLOW}⚠️  Supabase CLI not installed${NC}"
fi

# Check Clerk CLI
echo -e "\n${BLUE}📋 Checking Clerk CLI...${NC}"
if command -v clerk &> /dev/null; then
  echo -e "${GREEN}✅ Clerk CLI installed${NC}"
  
  # Try to get instance info
  if clerk status 2>/dev/null | grep -q "Instance"; then
    echo -e "${GREEN}✅ Clerk CLI authenticated${NC}"
    clerk status 2>/dev/null | head -10
  else
    echo -e "${YELLOW}⚠️  Clerk CLI not authenticated${NC}"
    echo "   Login with: clerk login"
  fi
else
  echo -e "${YELLOW}⚠️  Clerk CLI not installed${NC}"
  echo "   Install with: npm i -g @clerk/cli"
fi

# Domain configuration check
echo -e "\n${BLUE}🌐 Domain Configuration${NC}"
echo "Current deployment URL:"
echo "  https://dealership-ai-dashboard-gazyukvz2-brian-kramers-projects.vercel.app"
echo ""
echo "Required Clerk domains:"
echo "  ✅ *.vercel.app (for preview deployments)"
echo "  ✅ dash.dealershipai.com (production dashboard)"
echo "  ✅ dealershipai.com (main landing - no auth)"
echo ""
echo -e "${YELLOW}⚠️  Make sure these domains are added in Clerk Dashboard:${NC}"
echo "  1. Go to https://dashboard.clerk.com"
echo "  2. Select your application"
echo "  3. Navigate to Domains → Satellites"
echo "  4. Add: *.vercel.app or your specific preview URL"
echo ""

# Summary
echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Verification Complete${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
echo ""
echo "Next steps:"
echo "1. Verify domains in Clerk Dashboard"
echo "2. Ensure environment variables match (test vs live keys)"
echo "3. Test sign-in flow: https://your-url.vercel.app/sign-in"
echo ""

