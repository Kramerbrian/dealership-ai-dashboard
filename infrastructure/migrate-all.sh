#!/bin/bash
# Complete migration script for both GitHub and Supabase

set -e

echo "🚀 AIM Infrastructure Migration Script"
echo "========================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# GitHub Migration
echo -e "${YELLOW}📦 Step 1: Migrating to GitHub...${NC}"
echo ""

GITHUB_REPO="https://github.com/Kramerbrian/AppraiseYourVehicle.git"
TEMP_DIR="/tmp/aim-migration"

# Clean up
rm -rf "$TEMP_DIR"
mkdir -p "$TEMP_DIR"
cd "$TEMP_DIR"

# Try GitHub migration
if bash /workspace/infrastructure/migrate-to-github.sh 2>&1; then
  echo -e "${GREEN}✅ GitHub migration completed${NC}"
else
  echo -e "${RED}⚠️  GitHub migration requires manual setup${NC}"
  echo "   Please run: bash /workspace/infrastructure/migrate-to-github.sh"
fi

echo ""
echo -e "${YELLOW}☁️  Step 2: Migrating to Supabase...${NC}"
echo ""

# Check if Node.js is available
if command -v node &> /dev/null; then
  # Check if supabase-js is installed
  if [ -f "package.json" ] && grep -q "@supabase/supabase-js" package.json 2>/dev/null; then
    echo "   Running Node.js migration script..."
    cd /workspace/infrastructure
    if [ -f ".env" ]; then
      export $(cat .env | xargs)
    fi
    node migrate-to-supabase.js
  else
    echo -e "${YELLOW}   ⚠️  @supabase/supabase-js not installed${NC}"
    echo "   Install with: npm install @supabase/supabase-js"
    echo "   Then run: node /workspace/infrastructure/migrate-to-supabase.js"
  fi
else
  echo -e "${YELLOW}   ⚠️  Node.js not found${NC}"
  echo "   Install Node.js or use Supabase Dashboard/CLI"
  echo "   See: /workspace/infrastructure/MIGRATE_TO_SUPABASE.md"
fi

echo ""
echo "📋 Migration Summary"
echo "=================="
echo ""
echo "✅ Files ready for migration:"
echo "   Source: /workspace/infrastructure/terraform"
echo ""
echo "📦 GitHub:"
echo "   Repository: $GITHUB_REPO"
echo "   Run: bash /workspace/infrastructure/migrate-to-github.sh"
echo ""
echo "☁️  Supabase:"
echo "   Project: https://supabase.com/dashboard/project/jhftjurcpewsagbkbtmv"
echo "   Options:"
echo "   1. Use Node.js script: node migrate-to-supabase.js"
echo "   2. Use Supabase Dashboard: Upload manually"
echo "   3. Use Supabase CLI: supabase storage upload"
echo ""
echo "📚 Documentation:"
echo "   - GitHub: /workspace/infrastructure/MIGRATE_TO_GITHUB.md"
echo "   - Supabase: /workspace/infrastructure/MIGRATE_TO_SUPABASE.md"
echo ""
