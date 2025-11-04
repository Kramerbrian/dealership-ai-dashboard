#!/bin/bash

# Launch Full-Stack Application
# Uses .env, Supabase CLI, and Vercel CLI

set -e

echo "🚀 Launching DealershipAI Full-Stack"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check .env file
echo "📁 Checking .env file..."
if [ -f .env ]; then
  echo -e "${GREEN}✅ .env file found${NC}"
  
  # Check critical variables
  MISSING_VARS=()
  
  if ! grep -q "DATABASE_URL" .env || grep -q "your.*database" .env -i; then
    MISSING_VARS+=("DATABASE_URL")
  fi
  
  if ! grep -q "NEXT_PUBLIC_SUPABASE_URL" .env || grep -q "your.*supabase" .env -i; then
    MISSING_VARS+=("NEXT_PUBLIC_SUPABASE_URL")
  fi
  
  if [ ${#MISSING_VARS[@]} -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Missing or placeholder variables: ${MISSING_VARS[*]}${NC}"
  else
    echo -e "${GREEN}✅ Critical variables found${NC}"
  fi
else
  echo -e "${RED}❌ .env file not found${NC}"
  echo "   Create one from .env.example"
  exit 1
fi

echo ""

# Check Supabase CLI
echo "🗄️  Checking Supabase CLI..."
if command -v supabase &> /dev/null; then
  echo -e "${GREEN}✅ Supabase CLI found${NC}"
  
  # Check if linked
  if [ -f .supabase/config.toml ]; then
    echo -e "${GREEN}✅ Supabase project linked${NC}"
    
    # Check status
    echo "   Checking Supabase status..."
    SUPABASE_STATUS=$(supabase status 2>&1)
    if echo "$SUPABASE_STATUS" | grep -q "API URL"; then
      echo -e "${GREEN}✅ Supabase running${NC}"
    else
      echo -e "${YELLOW}⚠️  Supabase not running locally${NC}"
      echo "   Run: supabase start"
    fi
  else
    echo -e "${YELLOW}⚠️  Supabase project not linked${NC}"
    echo "   Run: supabase link --project-ref YOUR_PROJECT_REF"
  fi
else
  echo -e "${YELLOW}⚠️  Supabase CLI not installed${NC}"
  echo "   Install: npm install -g supabase"
fi

echo ""

# Check Vercel CLI
echo "☁️  Checking Vercel CLI..."
if command -v vercel &> /dev/null; then
  echo -e "${GREEN}✅ Vercel CLI found${NC}"
  
  # Check if logged in
  if vercel whoami &> /dev/null; then
    USER=$(vercel whoami 2>/dev/null)
    echo -e "${GREEN}✅ Logged in as: $USER${NC}"
  else
    echo -e "${YELLOW}⚠️  Not logged in to Vercel${NC}"
    echo "   Run: vercel login"
  fi
  
  # Check if project linked
  if [ -f .vercel/project.json ]; then
    echo -e "${GREEN}✅ Vercel project linked${NC}"
    PROJECT=$(cat .vercel/project.json | grep -o '"projectId":"[^"]*"' | cut -d'"' -f4)
    echo "   Project ID: $PROJECT"
  else
    echo -e "${YELLOW}⚠️  Vercel project not linked${NC}"
    echo "   Run: vercel link"
  fi
else
  echo -e "${YELLOW}⚠️  Vercel CLI not installed${NC}"
  echo "   Install: npm install -g vercel"
fi

echo ""
echo "======================================"
echo ""

# Ask what to do
echo "What would you like to do?"
echo ""
echo "1. Start local development (Next.js + Supabase local)"
echo "2. Deploy to Vercel (production)"
echo "3. Check environment setup"
echo "4. Sync environment variables"
echo ""
read -p "Enter choice [1-4]: " choice

case $choice in
  1)
    echo ""
    echo "🚀 Starting local development..."
    echo ""
    
    # Start Supabase if not running
    if ! supabase status &> /dev/null; then
      echo "Starting Supabase..."
      supabase start
    fi
    
    # Start Next.js dev server
    echo "Starting Next.js..."
    npm run dev
    ;;
    
  2)
    echo ""
    echo "☁️  Deploying to Vercel..."
    echo ""
    
    # Check if logged in
    if ! vercel whoami &> /dev/null; then
      echo "Please login to Vercel first:"
      vercel login
    fi
    
    # Deploy
    vercel --prod
    ;;
    
  3)
    echo ""
    echo "🔍 Environment Setup Check"
    echo "=========================="
    echo ""
    npm run verify:env
    echo ""
    npm run check:redis
    echo ""
    ;;
    
  4)
    echo ""
    echo "🔄 Syncing Environment Variables"
    echo "================================"
    echo ""
    echo "1. Export from .env:"
    npm run export:vercel-env
    echo ""
    echo "2. Add to Vercel:"
    echo "   https://vercel.com/YOUR_PROJECT/settings/environment-variables"
    echo ""
    echo "3. Or use Vercel CLI:"
    echo "   vercel env add VARIABLE_NAME"
    ;;
    
  *)
    echo "Invalid choice"
    exit 1
    ;;
esac

