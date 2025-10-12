#!/bin/bash

# AVI Dashboard Database Setup Script
# This script automates the setup of the AVI reports database

set -e  # Exit on error

echo "🚀 AVI Dashboard Database Setup"
echo "================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}❌ Supabase CLI not found${NC}"
    echo "Install it with: npm install -g supabase"
    exit 1
fi

echo -e "${GREEN}✅ Supabase CLI found${NC}"

# Check environment variables
echo ""
echo "📋 Checking environment variables..."

if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
    echo -e "${RED}❌ NEXT_PUBLIC_SUPABASE_URL not set${NC}"
    echo "Set it in .env.local or export it"
    exit 1
fi

if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo -e "${RED}❌ SUPABASE_SERVICE_ROLE_KEY not set${NC}"
    echo "Set it in .env.local or export it"
    exit 1
fi

echo -e "${GREEN}✅ Environment variables configured${NC}"

# Step 1: Link to Supabase project
echo ""
echo "📡 Step 1: Linking to Supabase project..."

# Extract project ref from URL
PROJECT_REF=$(echo $NEXT_PUBLIC_SUPABASE_URL | sed 's/https:\/\///' | sed 's/.supabase.co//')

echo "Project ref: $PROJECT_REF"

supabase link --project-ref $PROJECT_REF || {
    echo -e "${YELLOW}⚠️  Link failed. Continuing anyway...${NC}"
}

# Step 2: Run migration
echo ""
echo "🗄️  Step 2: Running database migration..."

# Check if migration file exists
if [ ! -f "supabase/migrations/20250110000001_create_avi_reports.sql" ]; then
    echo -e "${RED}❌ Migration file not found${NC}"
    exit 1
fi

echo "Found migration file"

# Try using Supabase CLI
echo "Attempting migration with Supabase CLI..."
supabase db push || {
    echo -e "${YELLOW}⚠️  CLI push failed. Will provide manual instructions.${NC}"
    echo ""
    echo "Please run this SQL manually in Supabase SQL Editor:"
    echo "https://supabase.com/dashboard/project/$PROJECT_REF/sql"
    echo ""
    echo "Copy the contents of:"
    echo "  supabase/migrations/20250110000001_create_avi_reports.sql"
    echo ""
    read -p "Press Enter after running the SQL manually..."
}

# Step 3: Verify migration
echo ""
echo "🔍 Step 3: Verifying migration..."

# Create a temporary SQL file for verification
cat > /tmp/verify_avi.sql << 'EOF'
SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name = 'avi_reports'
) as table_exists;
EOF

echo "Checking if avi_reports table exists..."

# This might fail if CLI isn't properly configured
supabase db remote ls || {
    echo -e "${YELLOW}⚠️  Cannot verify automatically${NC}"
    echo "Please verify manually that the avi_reports table exists"
    read -p "Confirm table exists (y/n): " CONFIRM
    if [ "$CONFIRM" != "y" ]; then
        echo "Setup incomplete"
        exit 1
    fi
}

echo -e "${GREEN}✅ Migration verified${NC}"

# Step 4: Seed database (optional)
echo ""
echo "🌱 Step 4: Seeding database (optional)..."
read -p "Do you want to seed the database with demo data? (y/n): " SEED

if [ "$SEED" = "y" ]; then
    echo "Running seed script..."

    # Check if seed script exists
    if [ ! -f "scripts/seed-avi-reports.ts" ]; then
        echo -e "${RED}❌ Seed script not found${NC}"
        exit 1
    fi

    # Check if tsx is installed
    if ! command -v tsx &> /dev/null; then
        echo "Installing tsx..."
        npm install -D tsx
    fi

    echo ""
    echo -e "${YELLOW}⚠️  IMPORTANT: Update DEMO_TENANTS in scripts/seed-avi-reports.ts with your real tenant IDs${NC}"
    read -p "Press Enter to continue with seeding..."

    npx tsx scripts/seed-avi-reports.ts || {
        echo -e "${RED}❌ Seeding failed${NC}"
        exit 1
    }

    echo -e "${GREEN}✅ Database seeded${NC}"
else
    echo "Skipping seeding"
fi

# Step 5: Verify data
echo ""
echo "🔍 Step 5: Verifying data..."

cat > /tmp/verify_data.sql << 'EOF'
SELECT COUNT(*) as report_count FROM avi_reports;
SELECT COUNT(*) as policy_count FROM pg_policies WHERE tablename = 'avi_reports';
SELECT indexname FROM pg_indexes WHERE tablename = 'avi_reports';
EOF

echo "Data verification queries created"
echo "You can run these in Supabase SQL Editor to verify:"
echo ""
cat /tmp/verify_data.sql
echo ""

# Final summary
echo ""
echo "================================"
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo "================================"
echo ""
echo "Next steps:"
echo "1. Verify table exists in Supabase Dashboard"
echo "2. Check RLS policies are enabled"
echo "3. Test API endpoint: /api/avi-report"
echo "4. Deploy to Vercel"
echo ""
echo "Documentation:"
echo "- Setup Guide: AVI_SUPABASE_INTEGRATION.md"
echo "- Deployment: AVI_DEPLOYMENT_CHECKLIST.md"
echo "- Examples: AVI_EXAMPLES.md"
echo ""
echo "🎉 Happy coding!"
