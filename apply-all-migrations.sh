#!/bin/bash

# Apply All Database Migrations Script
# This script applies all necessary database migrations to Supabase

set -e

echo "🗄️  Starting database migration process..."
echo ""

# Supabase connection details
DB_HOST="aws-0-us-west-1.pooler.supabase.com"
DB_PORT="6543"
DB_NAME="postgres"
DB_USER="postgres.gzlgfghpkbqlhgfozjkb"
DB_PASSWORD="${SUPABASE_DB_PASSWORD:-Autonation2077\$}"

# Color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to run SQL file
run_sql_file() {
    local file=$1
    local description=$2

    echo -e "${YELLOW}📋 Applying: $description${NC}"
    echo "   File: $file"

    if [ ! -f "$file" ]; then
        echo -e "${RED}❌ File not found: $file${NC}"
        return 1
    fi

    PGPASSWORD="$DB_PASSWORD" psql \
        "postgresql://${DB_USER}@${DB_HOST}:${DB_PORT}/${DB_NAME}" \
        -f "$file" \
        --quiet \
        2>&1 | grep -v "NOTICE" || true

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Success${NC}"
    else
        echo -e "${RED}❌ Failed${NC}"
        return 1
    fi
    echo ""
}

echo "=================================="
echo "Database Migration Plan"
echo "=================================="
echo ""
echo "This will apply the following migrations:"
echo "  1. Core monitoring tables (cron jobs, alerts)"
echo "  2. Security framework (events, access control, audit log)"
echo "  3. Model audit tables"
echo "  4. Governance framework"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Migration cancelled."
    exit 0
fi
echo ""

# Apply migrations in order
echo "=================================="
echo "Step 1: Core Monitoring Tables"
echo "=================================="
echo ""

run_sql_file "supabase/migrations/20250109_add_cron_monitoring_tables.sql" \
    "Cron Job Monitoring Tables"

run_sql_file "supabase/migrations/20250109_add_system_alerts_table.sql" \
    "System Alerts Table"

echo "=================================="
echo "Step 2: Security Framework"
echo "=================================="
echo ""

run_sql_file "database/security-schema.sql" \
    "Security Events, Access Controls, Audit Log"

echo "=================================="
echo "Step 3: Model & Governance"
echo "=================================="
echo ""

run_sql_file "database/model-audit-schema.sql" \
    "Model Audit and Performance Tracking"

run_sql_file "database/governance-schema.sql" \
    "Governance Rules and Compliance"

echo "=================================="
echo "Step 4: Additional Schemas (Optional)"
echo "=================================="
echo ""

# Optional: Apply AIV training schema if it exists
if [ -f "database/aiv-training-schema.sql" ]; then
    run_sql_file "database/aiv-training-schema.sql" \
        "AIV Training and Reinforcement Learning"
fi

# Optional: Apply AOER schema
if [ -f "database/aoer-schema.sql" ]; then
    run_sql_file "database/aoer-schema.sql" \
        "AOER Queue and Processing"
fi

echo "=================================="
echo "Migration Summary"
echo "=================================="
echo ""
echo -e "${GREEN}✅ All migrations applied successfully!${NC}"
echo ""
echo "Next steps:"
echo "  1. Verify tables were created: psql 'postgresql://...' -c '\dt'"
echo "  2. Check cron jobs in Vercel dashboard"
echo "  3. Test monitoring API endpoints"
echo ""
echo "API endpoints to test:"
echo "  • GET /api/monitoring/system-health?query=executive-summary"
echo "  • GET /api/monitoring/system-health?query=control-rules"
echo "  • GET /api/cron/health"
echo "  • POST /api/monitoring/alerts"
echo ""
