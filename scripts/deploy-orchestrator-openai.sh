#!/bin/bash

# Deploy OpenAI Orchestrator Agent Integration
# This script configures and deploys the OpenAI-powered orchestrator

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Deploying OpenAI Orchestrator Agent Integration${NC}\n"

# Check for OpenAI API key
if [ -z "$OPENAI_API_KEY" ]; then
  echo -e "${YELLOW}⚠️  OPENAI_API_KEY not set in environment${NC}"
  echo "   Checking .env.local..."
  
  if [ -f .env.local ]; then
    source .env.local
    if [ -z "$OPENAI_API_KEY" ]; then
      echo -e "${RED}❌ OPENAI_API_KEY not found in .env.local${NC}"
      echo ""
      echo "Please set it with:"
      echo "  export OPENAI_API_KEY=sk-..."
      echo "  OR add to .env.local:"
      echo "  OPENAI_API_KEY=sk-..."
      exit 1
    fi
  else
    echo -e "${RED}❌ .env.local not found${NC}"
    exit 1
  fi
fi

echo -e "${GREEN}✅ OPENAI_API_KEY found${NC}"

# Verify OpenAI API key format
if [[ ! "$OPENAI_API_KEY" =~ ^sk- ]]; then
  echo -e "${YELLOW}⚠️  Warning: OPENAI_API_KEY doesn't start with 'sk-'${NC}"
  echo "   This might not be a valid OpenAI API key"
fi

# Check if we're deploying to Vercel
if command -v vercel &> /dev/null; then
  echo -e "\n${GREEN}📦 Deploying to Vercel...${NC}"
  
  # Add OpenAI API key to Vercel if not already set
  echo "   Checking Vercel environment variables..."
  
  if ! vercel env ls | grep -q "OPENAI_API_KEY"; then
    echo "   Adding OPENAI_API_KEY to Vercel..."
    echo "$OPENAI_API_KEY" | vercel env add OPENAI_API_KEY production
    echo "$OPENAI_API_KEY" | vercel env add OPENAI_API_KEY preview
    echo "$OPENAI_API_KEY" | vercel env add OPENAI_API_KEY development
    echo -e "${GREEN}✅ OPENAI_API_KEY added to Vercel${NC}"
  else
    echo -e "${GREEN}✅ OPENAI_API_KEY already in Vercel${NC}"
  fi

  # Optional: Set OpenAI model
  if [ -z "$OPENAI_MODEL" ]; then
    OPENAI_MODEL="gpt-4o"
  fi
  
  if ! vercel env ls | grep -q "OPENAI_MODEL"; then
    echo "$OPENAI_MODEL" | vercel env add OPENAI_MODEL production
    echo "$OPENAI_MODEL" | vercel env add OPENAI_MODEL preview
    echo "$OPENAI_MODEL" | vercel env add OPENAI_MODEL development
    echo -e "${GREEN}✅ OPENAI_MODEL set to ${OPENAI_MODEL}${NC}"
  fi
else
  echo -e "${YELLOW}⚠️  Vercel CLI not found. Skipping Vercel deployment.${NC}"
  echo "   Install with: npm i -g vercel"
fi

# Test OpenAI connection
echo -e "\n${GREEN}🧪 Testing OpenAI API connection...${NC}"
TEST_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  https://api.openai.com/v1/models)

if [ "$TEST_RESPONSE" = "200" ]; then
  echo -e "${GREEN}✅ OpenAI API connection successful${NC}"
else
  echo -e "${RED}❌ OpenAI API connection failed (HTTP $TEST_RESPONSE)${NC}"
  echo "   Please verify your API key is valid and has credits"
  exit 1
fi

# Verify orchestrator API route exists
if [ ! -f "app/api/orchestrator/route.ts" ]; then
  echo -e "${RED}❌ Orchestrator API route not found${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Orchestrator API route found${NC}"

# Summary
echo -e "\n${GREEN}✅ OpenAI Orchestrator Agent Integration Deployed${NC}\n"
echo "Configuration:"
echo "  • OpenAI API: ✅ Configured"
echo "  • Model: ${OPENAI_MODEL:-gpt-4o}"
echo "  • API Route: /api/orchestrator"
echo "  • Status Endpoint: /api/orchestrator/v3/status"
echo "  • Deploy Endpoint: /api/orchestrator/v3/deploy"
echo ""
echo "Next steps:"
echo "  1. Test the orchestrator:"
echo "     curl -X POST http://localhost:3000/api/orchestrator \\"
echo "       -H 'Content-Type: application/json' \\"
echo "       -d '{\"action\":\"analyze_visibility\",\"dealerId\":\"test\"}'"
echo ""
echo "  2. Deploy to production:"
echo "     vercel --prod"
echo ""
echo "  3. Monitor status:"
echo "     curl https://api.dealershipai.com/api/orchestrator/v3/status"
echo ""

