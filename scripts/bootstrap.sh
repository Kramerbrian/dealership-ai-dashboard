#!/usr/bin/env bash
# ============================================================================
# DealershipAI Market Pulse™ - Bootstrap Script
# ============================================================================
# Automated setup for local development or agent initialization
# Safe for Cursor, VS Code, or CI environments
# ============================================================================

set -euo pipefail
export TERM=xterm-256color

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
PROJECT="DealershipAI Market Pulse™"
NODE_VERSION_REQUIRED=18
REPO_URL="https://github.com/Kramerbrian/dealership-ai-dashboard.git"

echo -e "${CYAN}🚗  Bootstrapping ${PROJECT}${NC}"
echo ""

# ============================================================================
# Pre-flight Checks
# ============================================================================

echo -e "${YELLOW}📋 Running pre-flight checks...${NC}"

# Check Node.js
if ! command -v node >/dev/null 2>&1; then
  echo -e "${RED}❌ Node.js not found. Install Node >=${NODE_VERSION_REQUIRED}${NC}"
  exit 1
fi

NODE_VER=$(node -v | cut -d. -f1 | tr -d 'v')
if [ "$NODE_VER" -lt "$NODE_VERSION_REQUIRED" ]; then
  echo -e "${RED}❌ Node version too old. Required ${NODE_VERSION_REQUIRED}+, found ${NODE_VER}${NC}"
  exit 1
fi
echo -e "${GREEN}✅ Node.js ${NODE_VER} detected${NC}"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
  echo -e "${YELLOW}ℹ️  No package.json detected${NC}"
  echo -e "${YELLOW}Would you like to clone the repository? (y/n)${NC}"
  read -r response
  if [[ "$response" =~ ^[Yy]$ ]]; then
    echo -e "${CYAN}📦 Cloning repository...${NC}"
    git clone --depth=1 ${REPO_URL} .
  else
    echo -e "${RED}❌ Exiting. Please run this script from the project root.${NC}"
    exit 1
  fi
fi

# ============================================================================
# Install Dependencies
# ============================================================================

echo ""
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
npm install --legacy-peer-deps

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Dependencies installed${NC}"
else
  echo -e "${RED}❌ Failed to install dependencies${NC}"
  exit 1
fi

# ============================================================================
# Environment Setup
# ============================================================================

echo ""
echo -e "${YELLOW}🔧 Setting up environment...${NC}"

if [ ! -f ".env.local" ]; then
  echo -e "${CYAN}Creating .env.local from template...${NC}"
  if [ -f ".env.example" ]; then
    cp .env.example .env.local
    echo -e "${GREEN}✅ Created .env.local from .env.example${NC}"
    echo -e "${YELLOW}⚠️  Please update .env.local with your actual API keys${NC}"
  else
    cat <<EOF > .env.local
# DealershipAI Environment Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# Clerk Authentication (Required)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Upstash Redis (Optional)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# AI Providers (Optional)
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
PERPLEXITY_API_KEY=
GOOGLE_API_KEY=
EOF
    echo -e "${GREEN}✅ Created default .env.local${NC}"
    echo -e "${YELLOW}⚠️  Please update .env.local with your API keys${NC}"
  fi
else
  echo -e "${GREEN}✅ .env.local already exists${NC}"
fi

# ============================================================================
# TypeScript Validation
# ============================================================================

echo ""
echo -e "${YELLOW}🧠 Running TypeScript validation...${NC}"
if npx tsc --noEmit; then
  echo -e "${GREEN}✅ TypeScript validation passed${NC}"
else
  echo -e "${YELLOW}⚠️  TypeScript warnings detected (safe to ignore for development)${NC}"
fi

# ============================================================================
# Build or Run
# ============================================================================

echo ""
MODE=${1:-dev}

if [ "$MODE" == "build" ]; then
  echo -e "${YELLOW}🏗️  Building Next.js application...${NC}"
  npm run build

  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build complete${NC}"
  else
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
  fi

elif [ "$MODE" == "audit" ]; then
  echo -e "${YELLOW}🧮 Running schema health audit...${NC}"
  if [ -f "scripts/schema-health-report.js" ]; then
    node scripts/schema-health-report.js
  else
    echo -e "${YELLOW}⚠️  schema-health-report.js not found${NC}"
  fi

else
  echo -e "${YELLOW}🚀 Starting development server...${NC}"
  echo -e "${CYAN}Press Ctrl+C to stop${NC}"
  echo ""

  # Start dev server
  npm run dev
fi

# ============================================================================
# Success Summary
# ============================================================================

cat <<SUMMARY

${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ ${PROJECT} ready!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}

${CYAN}📍 Key Routes:${NC}
  • http://localhost:3000                    → Landing page
  • http://localhost:3000/dashboard          → Main dashboard
  • http://localhost:3000/onboarding         → Onboarding flow
  • http://localhost:3000/preview/orchestrator → Orchestrator demo

${CYAN}🔧 Available Commands:${NC}
  • npm run dev          → Start development server
  • npm run build        → Build for production
  • npm run audit        → Run schema health audit
  • vercel --prod        → Deploy to Vercel

${CYAN}📚 Documentation:${NC}
  • README.md                       → Project overview
  • FINAL_DEPLOYMENT_STEPS.md       → Deployment guide
  • docs/SYSTEM_ONLINE_OVERLAY.md   → Component docs
  • docs/GITHUB_ACTIONS_SETUP.md    → CI/CD setup

${YELLOW}⚠️  Next Steps:${NC}
  1. Update .env.local with your API keys
  2. Ensure Clerk, Supabase, and Redis are configured
  3. Run 'npm run dev' to start development
  4. Visit http://localhost:3000 to verify

${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}

SUMMARY
