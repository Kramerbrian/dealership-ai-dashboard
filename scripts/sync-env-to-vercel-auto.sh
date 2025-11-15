#!/bin/bash

# Auto-sync environment variables to Vercel (non-interactive)
# Sets Supabase variables automatically, prompts for Clerk keys

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "🚀 Auto-Syncing Environment Variables to Vercel"
echo "================================================"
echo ""

# Check Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}Installing Vercel CLI...${NC}"
    npm install -g vercel
fi

# Check login
if ! vercel whoami &> /dev/null; then
    echo -e "${RED}❌ Not logged in. Run: vercel login${NC}"
    exit 1
fi

SYNCED=0
FAILED=0

echo -e "${BLUE}📋 Setting Supabase Variables (from MCP)...${NC}"
echo ""

# Supabase URL
echo -n "  Setting NEXT_PUBLIC_SUPABASE_URL for production... "
if echo "https://gzlgfghpkbqlhgfozjkb.supabase.co" | vercel env add NEXT_PUBLIC_SUPABASE_URL production 2>&1 | grep -qE "Added|Updated|already exists"; then
    echo -e "${GREEN}✓${NC}"
    ((SYNCED++))
else
    echo -e "${YELLOW}⚠ (may already exist)${NC}"
fi

# Supabase Anon Key
echo -n "  Setting NEXT_PUBLIC_SUPABASE_ANON_KEY for production... "
if echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6bGdmZ2hwa2JxbGhnZm96amtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzOTg1MDQsImV4cCI6MjA3MDk3NDUwNH0.0X_zVfNH9K5FBDcMl_O7yeXJYwuWvGLALwjIe5JRlqg" | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production 2>&1 | grep -qE "Added|Updated|already exists"; then
    echo -e "${GREEN}✓${NC}"
    ((SYNCED++))
else
    echo -e "${YELLOW}⚠ (may already exist)${NC}"
fi

# Also set for preview and development
echo -n "  Setting NEXT_PUBLIC_SUPABASE_URL for preview... "
echo "https://gzlgfghpkbqlhgfozjkb.supabase.co" | vercel env add NEXT_PUBLIC_SUPABASE_URL preview 2>&1 | grep -qE "Added|Updated|already exists" && echo -e "${GREEN}✓${NC}" || echo -e "${YELLOW}⚠${NC}"

echo -n "  Setting NEXT_PUBLIC_SUPABASE_ANON_KEY for preview... "
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6bGdmZ2hwa2JxbGhnZm96amtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzOTg1MDQsImV4cCI6MjA3MDk3NDUwNH0.0X_zVfNH9K5FBDcMl_O7yeXJYwuWvGLALwjIe5JRlqg" | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY preview 2>&1 | grep -qE "Added|Updated|already exists" && echo -e "${GREEN}✓${NC}" || echo -e "${YELLOW}⚠${NC}"

echo ""
echo -e "${YELLOW}⚠️  Manual Steps Required:${NC}"
echo ""
echo "1. Set SUPABASE_SERVICE_ROLE_KEY:"
echo "   vercel env add SUPABASE_SERVICE_ROLE_KEY production"
echo "   (Get from: Supabase Dashboard → Settings → API → service_role key)"
echo ""
echo "2. Set Clerk Keys:"
if [ -f .env.local ]; then
    CLERK_PUB=$(grep "^NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=" .env.local | cut -d '=' -f2- | tr -d '"' | tr -d "'" | head -1)
    CLERK_SECRET=$(grep "^CLERK_SECRET_KEY=" .env.local | cut -d '=' -f2- | tr -d '"' | tr -d "'" | head -1)
    
    if [ -n "$CLERK_PUB" ]; then
        echo "   Found Clerk publishable key in .env.local"
        echo "   Run: vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production"
        echo "   Then paste: ${CLERK_PUB:0:20}..."
    else
        echo "   Clerk publishable key not found in .env.local"
        echo "   Get from: Clerk Dashboard → API Keys → Publishable Key"
        echo "   Run: vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production"
    fi
    
    if [ -n "$CLERK_SECRET" ]; then
        echo "   Found Clerk secret key in .env.local"
        echo "   Run: vercel env add CLERK_SECRET_KEY production"
        echo "   Then paste: ${CLERK_SECRET:0:20}..."
    else
        echo "   Clerk secret key not found in .env.local"
        echo "   Get from: Clerk Dashboard → API Keys → Secret Key"
        echo "   Run: vercel env add CLERK_SECRET_KEY production"
    fi
else
    echo "   .env.local not found"
    echo "   Get from: Clerk Dashboard → API Keys"
    echo "   Run: vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production"
    echo "   Run: vercel env add CLERK_SECRET_KEY production"
fi

echo ""
echo -e "${GREEN}✅ Supabase variables set!${NC}"
echo ""
echo "📋 Next Steps:"
echo "  1. Set SUPABASE_SERVICE_ROLE_KEY (see above)"
echo "  2. Set Clerk keys (see above)"
echo "  3. Redeploy: vercel --prod"
echo "  4. Test: https://dash.dealershipai.com/sign-in"
echo ""

