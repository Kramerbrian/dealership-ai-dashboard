#!/bin/bash

# ATI Deployment Script
# DealershipAI Command Center - Algorithmic Trust Index

set -e

echo "🚀 ATI Deployment Script"
echo "========================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Get Supabase credentials
echo -e "${YELLOW}Step 1: Checking Supabase credentials...${NC}"

if [ -f .env.local ]; then
  SUPABASE_URL=$(grep "NEXT_PUBLIC_SUPABASE_URL" .env.local | cut -d'"' -f2)
  SUPABASE_KEY=$(grep "SUPABASE_SERVICE_ROLE_KEY" .env.local | cut -d'"' -f2)
elif [ -f .env ]; then
  SUPABASE_URL=$(grep "NEXT_PUBLIC_SUPABASE_URL" .env | cut -d'"' -f2)
  SUPABASE_KEY=$(grep "SUPABASE_SERVICE_ROLE_KEY" .env | cut -d'"' -f2)
else
  echo -e "${RED}❌ .env.local or .env file not found${NC}"
  exit 1
fi

if [ -z "$SUPABASE_URL" ]; then
  echo -e "${RED}❌ SUPABASE_URL not found in .env${NC}"
  exit 1
fi

# Extract project ID from URL
PROJECT_ID=$(echo "$SUPABASE_URL" | sed -E 's|https://([^.]+)\.supabase\.co|\1|')
echo -e "${GREEN}✅ Project ID: $PROJECT_ID${NC}"

# Step 2: Apply database migration
echo ""
echo -e "${YELLOW}Step 2: Apply ATI database migration...${NC}"
echo "Migration file: supabase/migrations/20250115000005_ati_signals.sql"
echo ""

# Check if migration file exists
if [ ! -f "supabase/migrations/20250115000005_ati_signals.sql" ]; then
  echo -e "${RED}❌ Migration file not found!${NC}"
  exit 1
fi

echo "Would you like to apply the migration now?"
echo "This will create the ati_signals table with RLS policies."
echo ""
echo "Options:"
echo "  1) Apply via Supabase SQL Editor (manual)"
echo "  2) Apply via psql (requires credentials)"
echo "  3) Skip for now"
echo ""
read -p "Choose option (1-3): " option

case $option in
  1)
    echo ""
    echo -e "${GREEN}Opening Supabase SQL Editor...${NC}"
    echo ""
    echo "Copy and paste the contents of:"
    echo "  supabase/migrations/20250115000005_ati_signals.sql"
    echo ""
    echo "Into the SQL Editor at:"
    echo "  https://supabase.com/dashboard/project/$PROJECT_ID/sql/new"
    echo ""
    open "https://supabase.com/dashboard/project/$PROJECT_ID/sql/new" 2>/dev/null || \
      echo "Navigate to: https://supabase.com/dashboard/project/$PROJECT_ID/sql/new"
    echo ""
    read -p "Press Enter when migration is applied..."
    ;;
  2)
    echo ""
    echo -e "${YELLOW}Applying migration via psql...${NC}"
    echo "You'll need your database password."
    echo ""

    # Try to get DB password
    DB_PASSWORD=$(grep "SUPABASE_DB_PASSWORD" .env.local 2>/dev/null | cut -d'"' -f2)

    if [ -z "$DB_PASSWORD" ]; then
      echo "Database password not found in .env.local"
      echo "Get it from: https://supabase.com/dashboard/project/$PROJECT_ID/settings/database"
      echo ""
      read -sp "Enter database password: " DB_PASSWORD
      echo ""
    fi

    PGPASSWORD="$DB_PASSWORD" psql \
      "postgresql://postgres.$PROJECT_ID@aws-0-us-west-1.pooler.supabase.com:6543/postgres" \
      -f supabase/migrations/20250115000005_ati_signals.sql

    if [ $? -eq 0 ]; then
      echo -e "${GREEN}✅ Migration applied successfully${NC}"
    else
      echo -e "${RED}❌ Migration failed${NC}"
      exit 1
    fi
    ;;
  3)
    echo -e "${YELLOW}⚠️  Skipping migration${NC}"
    ;;
  *)
    echo -e "${RED}Invalid option${NC}"
    exit 1
    ;;
esac

# Step 3: Verify table created
echo ""
echo -e "${YELLOW}Step 3: Verify ati_signals table...${NC}"
echo ""
echo "Check table exists in Supabase:"
echo "  https://supabase.com/dashboard/project/$PROJECT_ID/editor"
echo ""
read -p "Press Enter to continue..."

# Step 4: Build the project
echo ""
echo -e "${YELLOW}Step 4: Build the project...${NC}"
echo ""

npm run build

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Build successful${NC}"
else
  echo -e "${RED}❌ Build failed${NC}"
  exit 1
fi

# Step 5: Deploy to Vercel
echo ""
echo -e "${YELLOW}Step 5: Deploy to Vercel...${NC}"
echo ""

read -p "Deploy to Vercel production? (y/n): " deploy_choice

if [ "$deploy_choice" = "y" ] || [ "$deploy_choice" = "Y" ]; then
  vercel --prod

  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Deployed to Vercel${NC}"
  else
    echo -e "${RED}❌ Deployment failed${NC}"
    exit 1
  fi
else
  echo -e "${YELLOW}⚠️  Skipping deployment${NC}"
fi

# Step 6: Verify cron jobs
echo ""
echo -e "${YELLOW}Step 6: Verify cron jobs...${NC}"
echo ""

vercel crons ls --prod 2>/dev/null | grep -E "ati-analysis|Path" || echo "Run: vercel crons ls --prod"

# Step 7: Test endpoint
echo ""
echo -e "${YELLOW}Step 7: Test ATI endpoint...${NC}"
echo ""

read -p "Enter a tenant ID to test (or press Enter to skip): " TENANT_ID

if [ ! -z "$TENANT_ID" ]; then
  echo ""
  echo "Testing: GET /api/tenants/$TENANT_ID/ati/latest"

  # Get deployment URL
  DEPLOYMENT_URL=$(vercel ls --prod 2>/dev/null | grep "dealership-ai-dashboard" | head -1 | awk '{print $2}')

  if [ -z "$DEPLOYMENT_URL" ]; then
    echo "Enter your production URL (e.g., https://yourdomain.com):"
    read DEPLOYMENT_URL
  fi

  curl -s "$DEPLOYMENT_URL/api/tenants/$TENANT_ID/ati/latest" | jq . || \
    curl -s "$DEPLOYMENT_URL/api/tenants/$TENANT_ID/ati/latest"
else
  echo -e "${YELLOW}⚠️  Skipping endpoint test${NC}"
fi

# Summary
echo ""
echo "================================================"
echo -e "${GREEN}✅ ATI Deployment Complete!${NC}"
echo "================================================"
echo ""
echo "Next steps:"
echo "  1. Verify ati_signals table in Supabase:"
echo "     https://supabase.com/dashboard/project/$PROJECT_ID/editor"
echo ""
echo "  2. Check cron jobs scheduled:"
echo "     vercel crons ls --prod"
echo ""
echo "  3. Wait for Monday 6 AM for automatic ATI analysis"
echo "     Or trigger manually:"
echo "     curl -X POST https://yourdomain.com/api/cron/ati-analysis \\"
echo "       -H \"Authorization: Bearer \$ADMIN_API_KEY\""
echo ""
echo "  4. View ATI in dashboard:"
echo "     https://yourdomain.com/dashboard"
echo ""
echo "Documentation:"
echo "  - ATI_IMPLEMENTATION_GUIDE.md"
echo "  - ATI_QUICK_REFERENCE.md"
echo "  - ATI_IMPLEMENTATION_COMPLETE.md"
echo ""
