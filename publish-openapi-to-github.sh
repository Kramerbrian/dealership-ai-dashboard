#!/bin/bash

# Publish DealershipAI OpenAPI Spec to GitHub
# Creates a new dedicated public repository for the OpenAPI specification

set -e

echo "🚀 Publishing DealershipAI OpenAPI Specification to GitHub"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
REPO_NAME="dealershipai-openapi"
OPENAPI_FILE="dealershipai-actions.yaml"
CURRENT_DIR=$(pwd)

# Step 1: Check if file exists
if [ ! -f "$OPENAPI_FILE" ]; then
    echo "❌ Error: $OPENAPI_FILE not found in current directory"
    exit 1
fi

echo "✅ Found OpenAPI file: $OPENAPI_FILE"
echo ""

# Step 2: Create temporary directory
TEMP_DIR=$(mktemp -d)
echo "📁 Created temporary directory: $TEMP_DIR"
cd "$TEMP_DIR"

# Step 3: Initialize git repo
git init
echo "✅ Initialized git repository"
echo ""

# Step 4: Copy OpenAPI file
cp "$CURRENT_DIR/$OPENAPI_FILE" .
echo "📋 Copied $OPENAPI_FILE to temporary repo"
echo ""

# Step 5: Create README
cat > README.md << EOF
# DealershipAI OpenAPI Specification

OpenAPI 3.1.0 specification for DealershipAI Action API endpoints.

## Usage

Import this specification into ChatGPT Actions or any OpenAPI-compatible client.

**Raw URL**: \`https://raw.githubusercontent.com/YOUR_USERNAME/$REPO_NAME/main/$OPENAPI_FILE\`

## Endpoints

- \`GET /api/ai-scores\` - Get AI visibility metrics
- \`GET /api/opportunities\` - List schema optimization opportunities
- \`POST /api/site-inject\` - Deploy JSON-LD to dealer CMS
- \`POST /api/refresh\` - Trigger fresh crawl & recompute
- \`GET /api/zero-click\` - Get zero-click rates & AI Overview stats
- \`GET /api/ai/health\` - Get AI engine health & visibility trends

## Import to ChatGPT

1. Go to: https://chat.openai.com/gpts
2. Click: "Create" or "Edit"
3. Click: "Add actions" → "Import from URL"
4. Paste: \`https://raw.githubusercontent.com/YOUR_USERNAME/$REPO_NAME/main/$OPENAPI_FILE\`

## License

Copyright © 2024 DealershipAI
EOF

git add .
git commit -m "Initial commit: Add DealershipAI OpenAPI specification"
echo "✅ Created initial commit"
echo ""

# Step 6: Instructions
echo "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo "${BLUE}📝 NEXT STEPS:${NC}"
echo ""
echo "1. ${GREEN}Create GitHub repository:${NC}"
echo "   → Go to: https://github.com/new"
echo "   → Name: ${YELLOW}$REPO_NAME${NC}"
echo "   → Visibility: ${GREEN}Public${NC} ✅"
echo "   → Don't initialize with README, .gitignore, or license"
echo "   → Click 'Create repository'"
echo ""
echo "2. ${GREEN}Add remote and push:${NC}"
echo "   → Replace YOUR_USERNAME with your GitHub username"
echo "   → Run these commands:"
echo ""
echo "   ${BLUE}git remote add origin https://github.com/YOUR_USERNAME/$REPO_NAME.git${NC}"
echo "   ${BLUE}git branch -M main${NC}"
echo "   ${BLUE}git push -u origin main${NC}"
echo ""
echo "3. ${GREEN}Get your raw URL:${NC}"
echo "   → https://raw.githubusercontent.com/YOUR_USERNAME/$REPO_NAME/main/$OPENAPI_FILE"
echo ""
echo "4. ${GREEN}Import to ChatGPT:${NC}"
echo "   → See CHATGPT_IMPORT_GUIDE.md"
echo ""
echo "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "✅ Temporary repository prepared in: $TEMP_DIR"
echo "💡 You can navigate there with: cd $TEMP_DIR"
echo ""

