#!/bin/bash

# =====================================================
# DEALERSHIPAI - AUTOMATED TASK EXECUTION
# =====================================================
# This script automates all remaining deployment tasks:
#   1. Verify migration SQL is ready
#   2. Test authentication configuration
#   3. Verify OpenAPI spec is ready for ChatGPT
#   4. Check deployment status
# =====================================================

set -e

echo "🚀 DealershipAI - Automated Task Execution"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# =====================================================
# TASK 1: Verify Migration SQL
# =====================================================
echo "📊 Task 1: Verify Migration SQL"
echo "-------------------------------"

if [ -f "COPY_PASTE_MIGRATION.sql" ]; then
    echo -e "${GREEN}✅ Migration SQL file found${NC}"
    
    # Check for critical components
    if grep -q "CREATE TABLE IF NOT EXISTS opportunities" COPY_PASTE_MIGRATION.sql; then
        echo -e "${GREEN}✅ Opportunities table definition found${NC}"
    else
        echo -e "${RED}❌ Missing opportunities table definition${NC}"
        exit 1
    fi
    
    if grep -q "idx_opportunities_impact_id" COPY_PASTE_MIGRATION.sql; then
        echo -e "${GREEN}✅ Cursor pagination index found${NC}"
    else
        echo -e "${RED}❌ Missing pagination index${NC}"
        exit 1
    fi
    
    LINE_COUNT=$(wc -l < COPY_PASTE_MIGRATION.sql)
    echo "   Migration file: $LINE_COUNT lines"
    echo ""
else
    echo -e "${RED}❌ Migration SQL file not found${NC}"
    exit 1
fi

# =====================================================
# TASK 2: Verify Authentication Setup
# =====================================================
echo "🔐 Task 2: Verify Authentication Configuration"
echo "----------------------------------------------"

# Check if Clerk is configured in layout
if grep -q "ClerkProvider" app/\(dashboard\)/layout.tsx; then
    echo -e "${GREEN}✅ ClerkProvider found in dashboard layout${NC}"
else
    echo -e "${RED}❌ ClerkProvider not found${NC}"
    exit 1
fi

# Check middleware
if grep -q "clerkMiddleware" middleware.ts; then
    echo -e "${GREEN}✅ Clerk middleware configured${NC}"
else
    echo -e "${RED}❌ Clerk middleware not found${NC}"
    exit 1
fi

# Check for sign-in/sign-up pages
if [ -f "app/sign-in/page.tsx" ] && [ -f "app/sign-up/page.tsx" ]; then
    echo -e "${GREEN}✅ Auth pages exist${NC}"
else
    echo -e "${YELLOW}⚠️  Auth pages may need verification${NC}"
fi

echo ""

# =====================================================
# TASK 3: Verify OpenAPI Spec
# =====================================================
echo "📄 Task 3: Verify OpenAPI Specification"
echo "----------------------------------------"

if [ -f "dealershipai-actions.yaml" ]; then
    echo -e "${GREEN}✅ OpenAPI spec file found${NC}"
    
    # Check for critical endpoints
    ENDPOINTS=("getAIScores" "listOpportunities" "runSchemaInject" "refreshDealerCrawl" "checkZeroClick" "fetchAIHealth")
    for endpoint in "${ENDPOINTS[@]}"; do
        if grep -q "$endpoint" dealershipai-actions.yaml; then
            echo -e "${GREEN}✅ Endpoint $endpoint found${NC}"
        else
            echo -e "${YELLOW}⚠️  Endpoint $endpoint not found${NC}"
        fi
    done
    
    # Check for cursor pagination in opportunities endpoint
    if grep -q "cursor" dealershipai-actions.yaml && grep -q "nextCursor" dealershipai-actions.yaml; then
        echo -e "${GREEN}✅ Cursor pagination documented${NC}"
    else
        echo -e "${YELLOW}⚠️  Cursor pagination may need verification${NC}"
    fi
    
    LINE_COUNT=$(wc -l < dealershipai-actions.yaml)
    echo "   OpenAPI spec: $LINE_COUNT lines"
    echo ""
else
    echo -e "${RED}❌ OpenAPI spec file not found${NC}"
    exit 1
fi

# Check GitHub repo status
echo "📦 Checking GitHub OpenAPI Repository"
if [ -d "~/temp-openapi-repo" ]; then
    echo -e "${GREEN}✅ Local OpenAPI repo exists${NC}"
    if [ -f "~/temp-openapi-repo/dealershipai-actions.yaml" ]; then
        echo -e "${GREEN}✅ YAML file in local repo${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Local OpenAPI repo not found (may be in different location)${NC}"
fi

echo ""

# =====================================================
# TASK 4: Check Zero-Click Implementation
# =====================================================
echo "📊 Task 4: Verify Zero-Click Implementation"
echo "-------------------------------------------"

if [ -f "app/api/zero-click/recompute/route.ts" ]; then
    echo -e "${GREEN}✅ Zero-click recompute API exists${NC}"
else
    echo -e "${RED}❌ Zero-click recompute API not found${NC}"
fi

if [ -f "components/zero-click/AIVCard.tsx" ]; then
    echo -e "${GREEN}✅ AIV Card component exists${NC}"
else
    echo -e "${RED}❌ AIV Card component not found${NC}"
fi

if [ -f "components/zero-click/VisibilityROICard.tsx" ]; then
    echo -e "${GREEN}✅ Visibility ROI Card exists${NC}"
else
    echo -e "${RED}❌ Visibility ROI Card not found${NC}"
fi

if grep -q "/api/zero-click/recompute" vercel.json; then
    echo -e "${GREEN}✅ Cron job configured in vercel.json${NC}"
else
    echo -e "${YELLOW}⚠️  Cron job may need verification${NC}"
fi

echo ""

# =====================================================
# TASK 5: Check Prisma Setup
# =====================================================
echo "🗄️  Task 5: Verify Prisma Configuration"
echo "--------------------------------------"

if [ -f "prisma/schema.prisma" ]; then
    echo -e "${GREEN}✅ Prisma schema exists${NC}"
    
    if grep -q "model Opportunity" prisma/schema.prisma; then
        echo -e "${GREEN}✅ Opportunity model defined${NC}"
    else
        echo -e "${YELLOW}⚠️  Opportunity model may need verification${NC}"
    fi
else
    echo -e "${RED}❌ Prisma schema not found${NC}"
fi

echo ""

# =====================================================
# SUMMARY & NEXT STEPS
# =====================================================
echo "=========================================="
echo "📋 SUMMARY & NEXT STEPS"
echo "=========================================="
echo ""
echo "✅ Automated checks complete!"
echo ""
echo "📝 Manual Steps Required:"
echo ""
echo "   1. 🗄️  RUN DATABASE MIGRATION:"
echo "      → Go to Supabase Dashboard"
echo "      → SQL Editor → New Query"
echo "      → Copy entire COPY_PASTE_MIGRATION.sql"
echo "      → Paste and Run"
echo ""
echo "   2. 🔐 TEST AUTHENTICATION:"
echo "      → Visit your Vercel deployment URL"
echo "      → Click 'Sign Up' → Create account"
echo "      → Verify redirect to /dashboard"
echo "      → Test sign out and sign in"
echo ""
echo "   3. 🤖 RE-IMPORT OPENAPI TO CHATGPT:"
echo "      → Go to https://chat.openai.com/gpts"
echo "      → Edit your GPT → Add actions"
echo "      → Import from URL:"
echo "        https://raw.githubusercontent.com/Kramerbrian/dealershipai-openapi/main/dealershipai-actions.yaml"
echo ""
echo "   4. 🚀 VERIFY DEPLOYMENT:"
echo "      → Push changes to GitHub (Vercel auto-deploys)"
echo "      → Test all API endpoints"
echo "      → Verify cron job is running"
echo ""
echo "=========================================="
echo "✨ All automated tasks complete!"
echo "=========================================="

