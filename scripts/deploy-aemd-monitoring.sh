#!/bin/bash

# AEMD & Accuracy Monitoring Deployment Script
# This script deploys the complete AEMD monitoring system

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "========================================"
echo "AEMD & Accuracy Monitoring Deployment"
echo "========================================"
echo -e "${NC}"

# Check if we're in the right directory
if [ ! -f "$PROJECT_ROOT/package.json" ]; then
    echo -e "${RED}❌ Error: Not in project root directory${NC}"
    exit 1
fi

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Step 1: Check prerequisites
echo -e "${YELLOW}Step 1: Checking prerequisites...${NC}"

if ! command_exists psql; then
    echo -e "${RED}❌ PostgreSQL client (psql) not found${NC}"
    echo "Install with: brew install postgresql"
    exit 1
fi

if ! command_exists node; then
    echo -e "${RED}❌ Node.js not found${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Prerequisites met${NC}"
echo ""

# Step 2: Get Supabase credentials
echo -e "${YELLOW}Step 2: Supabase Configuration${NC}"

# Check if env vars are already set
if [ -z "$SUPABASE_URL" ]; then
    echo "SUPABASE_URL not found in environment"
    echo ""
    echo "Please enter your Supabase credentials:"
    echo "(You can find these at https://supabase.com/dashboard → Your Project → Settings → API)"
    echo ""
    read -p "Supabase URL (https://xxx.supabase.co): " SUPABASE_URL
    read -sp "Service Role Key: " SUPABASE_SERVICE_ROLE_KEY
    echo ""
    echo ""
fi

# Validate URL format
if [[ ! "$SUPABASE_URL" =~ ^https://.*\.supabase\.co$ ]]; then
    echo -e "${RED}❌ Invalid Supabase URL format${NC}"
    echo "Expected format: https://your-project-id.supabase.co"
    exit 1
fi

# Extract connection details from Supabase URL
PROJECT_ID=$(echo "$SUPABASE_URL" | sed -E 's|https://([^.]+)\.supabase\.co|\1|')
DB_HOST="db.${PROJECT_ID}.supabase.co"
DB_PORT="5432"
DB_NAME="postgres"
DB_USER="postgres"

echo -e "${GREEN}✓ Supabase URL validated${NC}"
echo "  Project ID: $PROJECT_ID"
echo ""

# Ask for database password
if [ -z "$DB_PASSWORD" ]; then
    echo "To apply the migration, we need your database password."
    echo "(This is the password you set when creating your Supabase project)"
    echo ""
    read -sp "Database Password: " DB_PASSWORD
    echo ""
    echo ""
fi

# Step 3: Test database connection
echo -e "${YELLOW}Step 3: Testing database connection...${NC}"

if PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1" >/dev/null 2>&1; then
    echo -e "${GREEN}✓ Database connection successful${NC}"
else
    echo -e "${RED}❌ Database connection failed${NC}"
    echo "Please check your credentials and try again"
    exit 1
fi
echo ""

# Step 4: Apply migration
echo -e "${YELLOW}Step 4: Applying database migration...${NC}"
echo "This will create the following tables:"
echo "  • aemd_metrics"
echo "  • accuracy_monitoring"
echo "  • accuracy_thresholds"
echo "  • accuracy_alerts"
echo ""

MIGRATION_FILE="$PROJECT_ROOT/supabase/migrations/20250111000001_add_aemd_accuracy_monitoring.sql"

if [ ! -f "$MIGRATION_FILE" ]; then
    echo -e "${RED}❌ Migration file not found: $MIGRATION_FILE${NC}"
    exit 1
fi

# Backup option
read -p "Create a database backup first? (y/n): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Creating backup..."
    BACKUP_FILE="$PROJECT_ROOT/backup-$(date +%Y%m%d-%H%M%S).sql"
    PGPASSWORD="$DB_PASSWORD" pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$BACKUP_FILE"
    echo -e "${GREEN}✓ Backup saved to: $BACKUP_FILE${NC}"
fi
echo ""

# Apply migration
echo "Applying migration..."
if PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$MIGRATION_FILE"; then
    echo -e "${GREEN}✓ Migration applied successfully${NC}"
else
    echo -e "${RED}❌ Migration failed${NC}"
    exit 1
fi
echo ""

# Step 5: Verify tables were created
echo -e "${YELLOW}Step 5: Verifying table creation...${NC}"

TABLES=("aemd_metrics" "accuracy_monitoring" "accuracy_thresholds" "accuracy_alerts")
for table in "${TABLES[@]}"; do
    if PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "\d $table" >/dev/null 2>&1; then
        echo -e "${GREEN}✓ Table $table exists${NC}"
    else
        echo -e "${RED}❌ Table $table not found${NC}"
        exit 1
    fi
done
echo ""

# Step 6: Update .env.local
echo -e "${YELLOW}Step 6: Updating environment variables...${NC}"

ENV_FILE="$PROJECT_ROOT/.env.local"

# Backup existing .env.local
if [ -f "$ENV_FILE" ]; then
    cp "$ENV_FILE" "$ENV_FILE.backup-$(date +%Y%m%d-%H%M%S)"
    echo -e "${GREEN}✓ Backed up existing .env.local${NC}"
fi

# Update or add Supabase credentials
if grep -q "NEXT_PUBLIC_SUPABASE_URL" "$ENV_FILE" 2>/dev/null; then
    echo "Updating existing Supabase configuration..."
    sed -i.bak "s|NEXT_PUBLIC_SUPABASE_URL=.*|NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL|" "$ENV_FILE"
    sed -i.bak "s|SUPABASE_SERVICE_ROLE_KEY=.*|SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY|" "$ENV_FILE"
    rm -f "$ENV_FILE.bak"
else
    echo "Adding Supabase configuration..."
    echo "" >> "$ENV_FILE"
    echo "# Supabase Configuration" >> "$ENV_FILE"
    echo "NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL" >> "$ENV_FILE"
    echo "SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY" >> "$ENV_FILE"
fi

echo -e "${GREEN}✓ Environment variables updated${NC}"
echo ""

# Step 7: Run tests
echo -e "${YELLOW}Step 7: Running test suite...${NC}"
echo "This will verify all endpoints are working correctly"
echo ""

read -p "Run tests now? (y/n): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Start dev server in background if not running
    if ! lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null; then
        echo "Starting development server..."
        cd "$PROJECT_ROOT"
        npm run dev > /dev/null 2>&1 &
        DEV_SERVER_PID=$!
        echo "Waiting for server to start..."
        sleep 10
        SHOULD_KILL_SERVER=true
    else
        echo "Development server already running"
        SHOULD_KILL_SERVER=false
    fi

    # Run tests
    if [ -f "$SCRIPT_DIR/test-aemd-accuracy.sh" ]; then
        bash "$SCRIPT_DIR/test-aemd-accuracy.sh"
    else
        echo -e "${YELLOW}⚠ Test script not found${NC}"
    fi

    # Kill dev server if we started it
    if [ "$SHOULD_KILL_SERVER" = true ]; then
        echo "Stopping development server..."
        kill $DEV_SERVER_PID 2>/dev/null || true
    fi
else
    echo "Skipping tests"
fi
echo ""

# Step 8: Summary and next steps
echo -e "${GREEN}"
echo "========================================"
echo "✅ Deployment Complete!"
echo "========================================"
echo -e "${NC}"

echo "What was deployed:"
echo "  ✅ 4 database tables with RLS policies"
echo "  ✅ 6 database triggers for automation"
echo "  ✅ 1 composite view for reporting"
echo "  ✅ Default accuracy thresholds"
echo ""

echo "API Endpoints available:"
echo "  • POST /api/aemd-metrics"
echo "  • GET  /api/aemd-metrics"
echo "  • POST /api/accuracy-monitoring"
echo "  • GET  /api/accuracy-monitoring"
echo "  • PATCH /api/accuracy-monitoring?action=..."
echo ""

echo "Dashboard component:"
echo "  📍 Location: src/components/dashboard/AEMDMonitoringDashboard.tsx"
echo ""
echo "  Usage:"
echo "    import { AEMDMonitoringDashboard } from '@/components/dashboard/AEMDMonitoringDashboard';"
echo ""
echo "    <AEMDMonitoringDashboard tenantId=\"your-tenant-id\" />"
echo ""

echo "Next steps:"
echo "  1. Start your development server: npm run dev"
echo "  2. Integrate the dashboard component"
echo "  3. Configure alerting channels (see AEMD_ACCURACY_MONITORING_GUIDE.md)"
echo "  4. Set tenant-specific thresholds"
echo "  5. Test with real data"
echo ""

echo "Documentation:"
echo "  📖 Complete Guide: AEMD_ACCURACY_MONITORING_GUIDE.md"
echo "  📋 Quick Reference: AEMD_QUICK_REFERENCE.md"
echo "  📊 Implementation Summary: AEMD_IMPLEMENTATION_SUMMARY.md"
echo ""

echo -e "${BLUE}🎉 Your AEMD monitoring system is ready to use!${NC}"
echo ""

# Save credentials for future use
echo "Credentials saved for this session:"
echo "  export SUPABASE_URL='$SUPABASE_URL'"
echo "  export SUPABASE_SERVICE_ROLE_KEY='[hidden]'"
echo "  export DB_PASSWORD='[hidden]'"
echo ""

echo "To use these in your current shell, run:"
echo "  source <(echo 'export SUPABASE_URL=\"$SUPABASE_URL\"')"
echo ""
