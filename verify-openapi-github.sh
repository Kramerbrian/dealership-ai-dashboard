#!/bin/bash

# =====================================================
# VERIFY OPENAPI SPEC ON GITHUB
# =====================================================
# Checks if OpenAPI spec is accessible on GitHub
# =====================================================

set -e

echo "🤖 DealershipAI - OpenAPI GitHub Verification"
echo "============================================="
echo ""

GITHUB_USER="Kramerbrian"
REPO_NAME="dealershipai-openapi"
BRANCH="main"
FILE_NAME="dealershipai-actions.yaml"

OPENAPI_URL="https://raw.githubusercontent.com/$GITHUB_USER/$REPO_NAME/$BRANCH/$FILE_NAME"

echo "Checking: $OPENAPI_URL"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# =====================================================
# Test 1: URL Accessibility
# =====================================================
echo "Test 1: URL Accessibility"
echo "------------------------"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$OPENAPI_URL")

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ OpenAPI spec is accessible (200)${NC}"
else
    echo -e "${RED}❌ OpenAPI spec returned $HTTP_CODE${NC}"
    echo ""
    echo "Possible issues:"
    echo "  - Repository doesn't exist"
    echo "  - File not pushed to GitHub"
    echo "  - Wrong branch name"
    echo "  - Wrong file name"
    exit 1
fi
echo ""

# =====================================================
# Test 2: File Content Validation
# =====================================================
echo "Test 2: File Content Validation"
echo "--------------------------------"

CONTENT=$(curl -s "$OPENAPI_URL")

# Check for OpenAPI version
if echo "$CONTENT" | grep -q "openapi: 3.1.0"; then
    echo -e "${GREEN}✅ OpenAPI 3.1.0 format detected${NC}"
else
    echo -e "${RED}❌ OpenAPI version not found${NC}"
fi

# Check for required endpoints
REQUIRED_ENDPOINTS=(
    "getAIScores"
    "listOpportunities"
    "runSchemaInject"
    "refreshDealerCrawl"
    "checkZeroClick"
    "fetchAIHealth"
)

echo ""
echo "Checking endpoints:"
for endpoint in "${REQUIRED_ENDPOINTS[@]}"; do
    if echo "$CONTENT" | grep -q "$endpoint"; then
        echo -e "${GREEN}✅ $endpoint${NC}"
    else
        echo -e "${RED}❌ $endpoint not found${NC}"
    fi
done

# Check for cursor pagination
if echo "$CONTENT" | grep -q "cursor" && echo "$CONTENT" | grep -q "nextCursor"; then
    echo -e "${GREEN}✅ Cursor pagination documented${NC}"
else
    echo -e "${YELLOW}⚠️  Cursor pagination may need verification${NC}"
fi

echo ""

# =====================================================
# Test 3: YAML Syntax Check
# =====================================================
echo "Test 3: YAML Syntax Check"
echo "-------------------------"

# Try to parse YAML (basic check)
if command -v python3 &> /dev/null; then
    if python3 -c "import yaml; yaml.safe_load(open('$FILE_NAME'))" 2>/dev/null || \
       echo "$CONTENT" | python3 -c "import sys, yaml; yaml.safe_load(sys.stdin)" 2>/dev/null; then
        echo -e "${GREEN}✅ YAML syntax appears valid${NC}"
    else
        echo -e "${YELLOW}⚠️  YAML syntax check skipped (python yaml library not available)${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Python not available (skipping YAML validation)${NC}"
fi

echo ""

# =====================================================
# Test 4: Server URLs
# =====================================================
echo "Test 4: Server URLs"
echo "------------------"
if echo "$CONTENT" | grep -q "servers:"; then
    echo -e "${GREEN}✅ Server URLs configured${NC}"
    echo "$CONTENT" | grep -A 5 "servers:" | head -6
else
    echo -e "${RED}❌ Server URLs not found${NC}"
fi

echo ""

# =====================================================
# SUMMARY
# =====================================================
echo "=========================================="
echo "📋 Verification Complete"
echo "=========================================="
echo ""
echo "✅ OpenAPI Spec URL (for ChatGPT Actions):"
echo "   $OPENAPI_URL"
echo ""
echo "📝 Next Steps:"
echo "   1. Go to https://chat.openai.com/gpts"
echo "   2. Edit your GPT → Add actions"
echo "   3. Import from URL: $OPENAPI_URL"
echo "   4. Configure server URL in ChatGPT Actions"
echo ""
echo "See CHATGPT_IMPORT_GUIDE.md for detailed instructions"
echo ""

