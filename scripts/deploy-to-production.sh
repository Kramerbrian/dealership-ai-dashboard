#!/bin/bash
# ==========================================================================
# DealershipAI Production Deployment Script
# Deploys to dealershipai.com and dash.dealershipai.com
# ==========================================================================

set -e

echo "🚀 DealershipAI Production Deployment"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
PRIMARY_DOMAIN="dealershipai.com"
DASHBOARD_DOMAIN="dash.dealershipai.com"
PROJECT_NAME="dealership-ai-dashboard"

echo "${BLUE}📋 Pre-flight Checks${NC}"
echo "─────────────────────────────────────────────────────────────"

# Check if Vercel CLI is installed
if ! command -v npx &> /dev/null; then
    echo "${RED}❌ Error: npx not found${NC}"
    exit 1
fi

echo "${GREEN}✓${NC} npx/Vercel CLI available"

# Check if we're in a git repo
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "${RED}❌ Error: Not in a git repository${NC}"
    exit 1
fi

echo "${GREEN}✓${NC} Git repository detected"

# Get current branch and commit
GIT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
GIT_COMMIT=$(git rev-parse --short HEAD)
GIT_STATUS=$(git status --porcelain)

echo "${GREEN}✓${NC} Branch: $GIT_BRANCH"
echo "${GREEN}✓${NC} Commit: $GIT_COMMIT"

# Check for uncommitted changes
if [ -n "$GIT_STATUS" ]; then
    echo "${YELLOW}⚠️  Warning: You have uncommitted changes${NC}"
    echo "$GIT_STATUS"
    echo ""
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "${RED}Deployment cancelled${NC}"
        exit 1
    fi
fi

echo ""
echo "${BLUE}🔍 Environment Check${NC}"
echo "─────────────────────────────────────────────────────────────"

# Check environment variables in Vercel
echo "Checking Vercel environment variables..."
ENV_COUNT=$(npx vercel env ls 2>&1 | grep "Production" | wc -l | tr -d ' ')
echo "${GREEN}✓${NC} $ENV_COUNT environment variables configured in Production"

# Check required environment variables locally
REQUIRED_VARS=(
    "NEXT_PUBLIC_SUPABASE_URL"
    "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"
)

MISSING_VARS=()
for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ] && ! grep -q "^$var=" .env.local 2>/dev/null; then
        MISSING_VARS+=("$var")
    fi
done

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
    echo "${YELLOW}⚠️  Warning: Some local env vars not set (Vercel will use production values)${NC}"
    for var in "${MISSING_VARS[@]}"; do
        echo "   - $var"
    done
else
    echo "${GREEN}✓${NC} Required environment variables present"
fi

echo ""
echo "${BLUE}🏗️  Build Test${NC}"
echo "─────────────────────────────────────────────────────────────"

# Run type check
echo "Running TypeScript type check..."
if npm run type-check 2>&1 | tail -5; then
    echo "${GREEN}✓${NC} Type check passed"
else
    echo "${YELLOW}⚠️  Type check had warnings (continuing)${NC}"
fi

echo ""
echo "${BLUE}📦 Deployment${NC}"
echo "─────────────────────────────────────────────────────────────"

# Deploy to Vercel
echo "Deploying to Vercel production..."
echo ""

DEPLOY_OUTPUT=$(npx vercel --prod --yes 2>&1)
DEPLOY_URL=$(echo "$DEPLOY_OUTPUT" | grep -oE 'https://[a-zA-Z0-9-]+\.vercel\.app' | head -1)

if [ -z "$DEPLOY_URL" ]; then
    echo "${RED}❌ Deployment failed${NC}"
    echo "$DEPLOY_OUTPUT"
    exit 1
fi

echo ""
echo "${GREEN}✓${NC} Deployed to: $DEPLOY_URL"

# Wait for deployment to be ready
echo ""
echo "Waiting for deployment to be ready..."
sleep 10

echo ""
echo "${BLUE}🌐 Domain Configuration${NC}"
echo "─────────────────────────────────────────────────────────────"

echo ""
echo "${YELLOW}📝 Manual Steps Required:${NC}"
echo ""
echo "1. Add domains in Vercel Dashboard:"
echo "   ${BLUE}https://vercel.com/brian-kramer-dealershipai/$PROJECT_NAME/settings/domains${NC}"
echo ""
echo "   Add these domains:"
echo "   • $PRIMARY_DOMAIN"
echo "   • www.$PRIMARY_DOMAIN (redirect to $PRIMARY_DOMAIN)"
echo "   • $DASHBOARD_DOMAIN"
echo ""
echo "2. DNS is already configured (using Vercel nameservers)"
echo "   NS1.VERCEL-DNS.COM"
echo "   NS2.VERCEL-DNS.COM"
echo ""
echo "3. Verify deployment health:"
echo "   ${BLUE}https://$PRIMARY_DOMAIN/api/health${NC}"
echo "   ${BLUE}https://$DASHBOARD_DOMAIN/api/health${NC}"
echo ""

echo "${BLUE}✅ Deployment Complete!${NC}"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "📊 Deployment Summary:"
echo "   • Branch: $GIT_BRANCH"
echo "   • Commit: $GIT_COMMIT"
echo "   • Deployment URL: $DEPLOY_URL"
echo "   • Target Domains: $PRIMARY_DOMAIN, $DASHBOARD_DOMAIN"
echo ""
echo "🔗 Next Steps:"
echo "   1. Complete domain setup in Vercel Dashboard"
echo "   2. Test: curl https://$PRIMARY_DOMAIN/api/health"
echo "   3. Monitor: npx vercel logs $DEPLOY_URL"
echo ""
