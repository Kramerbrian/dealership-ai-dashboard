#!/bin/bash
set -e

echo "=========================================="
echo "DealershipAI Production Deployment"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Build
echo -e "${YELLOW}Step 1/4: Building production bundle...${NC}"
npm run build
echo -e "${GREEN}✅ Build complete${NC}"
echo ""

# Step 2: Git push
echo -e "${YELLOW}Step 2/4: Pushing to Git...${NC}"
git push origin main
echo -e "${GREEN}✅ Pushed to main${NC}"
echo ""

# Step 3: Vercel deployment
echo -e "${YELLOW}Step 3/4: Deploying to Vercel...${NC}"
vercel --prod
echo -e "${GREEN}✅ Deployed to production${NC}"
echo ""

# Step 4: Verify
echo -e "${YELLOW}Step 4/4: Verifying deployment...${NC}"
echo ""

echo "Testing health endpoint..."
HEALTH=$(curl -s https://dealershipai.com/api/health)
if echo "$HEALTH" | grep -q '"status":"healthy"'; then
  echo -e "${GREEN}✅ Health check passed${NC}"
else
  echo -e "${RED}⚠️  Health check failed or degraded${NC}"
  echo "$HEALTH" | jq .
fi
echo ""

echo "Testing security headers..."
if curl -sI https://dealershipai.com | grep -q "Strict-Transport-Security"; then
  echo -e "${GREEN}✅ Security headers present${NC}"
else
  echo -e "${RED}⚠️  Security headers missing${NC}"
fi
echo ""

echo "Testing SEO files..."
if curl -s https://dealershipai.com/robots.txt | grep -q "User-agent"; then
  echo -e "${GREEN}✅ robots.txt accessible${NC}"
else
  echo -e "${RED}⚠️  robots.txt not found${NC}"
fi

if curl -s https://dealershipai.com/sitemap.xml | grep -q "<url>"; then
  echo -e "${GREEN}✅ sitemap.xml accessible${NC}"
else
  echo -e "${RED}⚠️  sitemap.xml not found${NC}"
fi
echo ""

echo "=========================================="
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo "=========================================="
echo ""
echo "Next manual steps:"
echo "1. Run database migration via Supabase SQL Editor"
echo "   URL: https://supabase.com/dashboard/project/gzlgfghpkbqlhgfozjkb/sql/new"
echo "   File: supabase/migrations/20251020_critical_production_tables.sql"
echo ""
echo "2. Enable PITR"
echo "   URL: https://supabase.com/dashboard/project/gzlgfghpkbqlhgfozjkb/settings/database"
echo ""
echo "3. Set up uptime monitoring"
echo "   URL: https://uptimerobot.com"
echo "   Monitor: https://dealershipai.com/api/health"
echo ""
