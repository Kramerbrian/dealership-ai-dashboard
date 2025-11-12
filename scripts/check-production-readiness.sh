#!/bin/bash

# DealershipAI - Production Readiness Checker
# Run this script to verify your setup before going live

echo "🔍 DealershipAI Production Readiness Check"
echo "=========================================="
echo ""

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# Check environment variables
echo "📋 Checking Environment Variables..."
echo ""

REQUIRED_VARS=(
  "ANTHROPIC_API_KEY"
  "OPENAI_API_KEY"
  "DATABASE_URL"
  "SUPABASE_URL"
  "SUPABASE_ANON_KEY"
  "UPSTASH_REDIS_REST_URL"
  "UPSTASH_REDIS_REST_TOKEN"
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"
  "CLERK_SECRET_KEY"
  "STRIPE_SECRET_KEY"
)

OPTIONAL_VARS=(
  "PERPLEXITY_API_KEY"
  "GOOGLE_API_KEY"
  "ELEVENLABS_API_KEY"
  "FLEET_API_BASE"
  "X_API_KEY"
)

for var in "${REQUIRED_VARS[@]}"; do
  if [ -z "${!var}" ]; then
    echo -e "${RED}❌ Missing: $var${NC}"
    ERRORS=$((ERRORS + 1))
  else
    echo -e "${GREEN}✓ $var${NC}"
  fi
done

for var in "${OPTIONAL_VARS[@]}"; do
  if [ -z "${!var}" ]; then
    echo -e "${YELLOW}⚠ Optional: $var (not set)${NC}"
    WARNINGS=$((WARNINGS + 1))
  else
    echo -e "${GREEN}✓ $var${NC}"
  fi
done

echo ""

# Check database connection
echo "🗄️  Checking Database Connection..."
if command -v psql &> /dev/null; then
  if psql "$DATABASE_URL" -c "SELECT 1" &> /dev/null; then
    echo -e "${GREEN}✓ Database connection successful${NC}"
  else
    echo -e "${RED}❌ Database connection failed${NC}"
    ERRORS=$((ERRORS + 1))
  fi
else
  echo -e "${YELLOW}⚠ psql not installed, skipping database check${NC}"
fi

echo ""

# Check Prisma migrations
echo "📦 Checking Prisma Migrations..."
if [ -f "prisma/migrations" ]; then
  MIGRATIONS=$(ls -1 prisma/migrations 2>/dev/null | wc -l)
  if [ "$MIGRATIONS" -gt 0 ]; then
    echo -e "${GREEN}✓ Found $MIGRATIONS migrations${NC}"
  else
    echo -e "${RED}❌ No migrations found${NC}"
    ERRORS=$((ERRORS + 1))
  fi
else
  echo -e "${YELLOW}⚠ Migrations directory not found${NC}"
fi

echo ""

# Check if vector cache table exists
echo "🔍 Checking Vector Cache Table..."
if command -v psql &> /dev/null && [ -n "$DATABASE_URL" ]; then
  TABLE_EXISTS=$(psql "$DATABASE_URL" -t -c "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'ai_context_cache');" 2>/dev/null | xargs)
  if [ "$TABLE_EXISTS" = "t" ]; then
    echo -e "${GREEN}✓ ai_context_cache table exists${NC}"
  else
    echo -e "${YELLOW}⚠ ai_context_cache table not found - run migration from lib/ai/vector-cache.ts${NC}"
    WARNINGS=$((WARNINGS + 1))
  fi
fi

echo ""

# Check API routes exist
echo "🔌 Checking API Routes..."
API_ROUTES=(
  "app/api/ai/chat/route.ts"
  "app/api/ai/analyze/route.ts"
  "app/api/metrics/qai/route.ts"
  "app/api/metrics/eeat/route.ts"
  "app/api/metrics/rar/route.ts"
)

for route in "${API_ROUTES[@]}"; do
  if [ -f "$route" ]; then
    echo -e "${GREEN}✓ $route${NC}"
  else
    echo -e "${RED}❌ Missing: $route${NC}"
    ERRORS=$((ERRORS + 1))
  fi
done

echo ""

# Check components exist
echo "🧩 Checking Core Components..."
COMPONENTS=(
  "components/core/CommandBar.tsx"
  "components/core/AgentRail.tsx"
  "components/metrics/QaiModal.tsx"
  "components/metrics/EEATDrawer.tsx"
  "components/metrics/RaRModal.tsx"
)

for component in "${COMPONENTS[@]}"; do
  if [ -f "$component" ]; then
    echo -e "${GREEN}✓ $component${NC}"
  else
    echo -e "${YELLOW}⚠ Missing: $component${NC}"
    WARNINGS=$((WARNINGS + 1))
  fi
done

echo ""

# Check build
echo "🏗️  Checking Build..."
if npm run build &> /dev/null; then
  echo -e "${GREEN}✓ Production build successful${NC}"
else
  echo -e "${RED}❌ Production build failed${NC}"
  ERRORS=$((ERRORS + 1))
fi

echo ""

# Check tests (if exist)
echo "🧪 Checking Tests..."
if [ -d "tests" ] || [ -d "__tests__" ]; then
  if npm test &> /dev/null 2>&1; then
    echo -e "${GREEN}✓ Tests passing${NC}"
  else
    echo -e "${YELLOW}⚠ Some tests failing (run 'npm test' for details)${NC}"
    WARNINGS=$((WARNINGS + 1))
  fi
else
  echo -e "${YELLOW}⚠ No tests found${NC}"
fi

echo ""

# Summary
echo "=========================================="
echo "📊 Summary"
echo "=========================================="
echo -e "${GREEN}✓ Passed checks: $((${#REQUIRED_VARS[@]} - ERRORS))${NC}"
echo -e "${RED}❌ Errors: $ERRORS${NC}"
echo -e "${YELLOW}⚠ Warnings: $WARNINGS${NC}"
echo ""

if [ $ERRORS -eq 0 ]; then
  echo -e "${GREEN}🎉 Ready for production!${NC}"
  exit 0
else
  echo -e "${RED}🚨 Not ready for production. Fix errors above.${NC}"
  exit 1
fi

