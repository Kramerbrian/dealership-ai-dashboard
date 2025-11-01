#!/bin/bash

# =====================================================
# SUPABASE CLI MIGRATION AUTOMATION
# =====================================================
# Automates running the opportunities table migration
# using Supabase CLI
# =====================================================

set -e

echo "🗄️  DealershipAI - Supabase Migration Automation"
echo "================================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# =====================================================
# Step 1: Check Supabase CLI
# =====================================================
echo "Step 1: Checking Supabase CLI"
echo "-----------------------------"

if ! command -v supabase &> /dev/null; then
    echo -e "${RED}❌ Supabase CLI not found${NC}"
    echo "Install with: npm install -g supabase"
    exit 1
fi

VERSION=$(supabase --version)
echo -e "${GREEN}✅ Supabase CLI found: $VERSION${NC}"
echo ""

# =====================================================
# Step 2: Check if linked to project
# =====================================================
echo "Step 2: Checking Supabase project link"
echo "--------------------------------------"

if [ -f ".supabase/linked" ] || [ -f "supabase/.supabase/config.toml" ]; then
    echo -e "${GREEN}✅ Supabase project appears to be linked${NC}"
else
    echo -e "${YELLOW}⚠️  Project may not be linked${NC}"
    echo "If migration fails, link with: supabase link --project-ref <your-project-ref>"
fi
echo ""

# =====================================================
# Step 3: Create migration file
# =====================================================
echo "Step 3: Creating migration file"
echo "-------------------------------"

MIGRATION_DIR="supabase/migrations"
mkdir -p "$MIGRATION_DIR"

# Create timestamped migration file
TIMESTAMP=$(date +%Y%m%d%H%M%S)
MIGRATION_FILE="$MIGRATION_DIR/${TIMESTAMP}_create_opportunities_table.sql"

# Copy migration SQL
cp COPY_PASTE_MIGRATION.sql "$MIGRATION_FILE"

echo -e "${GREEN}✅ Migration file created: $MIGRATION_FILE${NC}"
echo ""

# =====================================================
# Step 4: Run migration
# =====================================================
echo "Step 4: Running migration"
echo "-------------------------"

# Try to run migration (requires project to be linked)
if supabase db push 2>&1 | tee /tmp/supabase-migration.log; then
    echo -e "${GREEN}✅ Migration applied successfully${NC}"
    SUCCESS=true
else
    # Check if we need to link first
    if grep -q "not found" /tmp/supabase-migration.log || grep -q "not linked" /tmp/supabase-migration.log; then
        echo -e "${YELLOW}⚠️  Project not linked to Supabase${NC}"
        echo ""
        echo "To link your project:"
        echo "  1. Get your project ref from Supabase Dashboard"
        echo "  2. Run: supabase link --project-ref <PROJECT_REF>"
        echo "  3. Or use direct connection:"
        echo "     supabase db push --db-url \$DATABASE_URL"
        echo ""
        
        # Try with DATABASE_URL if available
        if [ -n "$DATABASE_URL" ]; then
            echo "Attempting with DATABASE_URL..."
            if supabase db push --db-url "$DATABASE_URL" 2>&1; then
                echo -e "${GREEN}✅ Migration applied using DATABASE_URL${NC}"
                SUCCESS=true
            else
                SUCCESS=false
            fi
        else
            echo -e "${YELLOW}⚠️  DATABASE_URL not set${NC}"
            SUCCESS=false
        fi
    else
        SUCCESS=false
    fi
fi

echo ""

# =====================================================
# Step 5: Verify migration
# =====================================================
if [ "$SUCCESS" = true ]; then
    echo "Step 5: Verifying migration"
    echo "---------------------------"
    
    # Create verification query
    VERIFY_QUERY="SELECT table_name FROM information_schema.tables WHERE table_name = 'opportunities';"
    
    if supabase db execute "$VERIFY_QUERY" 2>/dev/null | grep -q "opportunities"; then
        echo -e "${GREEN}✅ Opportunities table exists${NC}"
    else
        echo -e "${YELLOW}⚠️  Could not verify table (may need manual check)${NC}"
    fi
    
    echo ""
fi

# =====================================================
# Summary
# =====================================================
echo "=========================================="
if [ "$SUCCESS" = true ]; then
    echo -e "${GREEN}✅ Migration Complete!${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Verify table in Supabase Dashboard"
    echo "  2. Test opportunities API endpoint"
    echo "  3. Verify cursor pagination works"
else
    echo -e "${YELLOW}⚠️  Migration requires manual intervention${NC}"
    echo ""
    echo "Options:"
    echo "  1. Link project: supabase link --project-ref <REF>"
    echo "  2. Use DATABASE_URL: supabase db push --db-url \$DATABASE_URL"
    echo "  3. Copy SQL to Supabase Dashboard SQL Editor"
    echo ""
    echo "Migration file saved at: $MIGRATION_FILE"
fi
echo "=========================================="

