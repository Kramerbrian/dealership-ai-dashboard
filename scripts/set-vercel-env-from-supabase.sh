#!/bin/bash

# Set Vercel environment variables from Supabase
# This script gets Supabase values and sets them in Vercel

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "🚀 Setting Vercel Environment Variables from Supabase"
echo "====================================================="
echo ""

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}⚠️  Vercel CLI not found. Installing...${NC}"
    npm install -g vercel
fi

# Check if logged in
if ! vercel whoami &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not logged in to Vercel. Please run: vercel login${NC}"
    exit 1
fi

# Get Supabase values (from MCP or environment)
SUPABASE_URL="https://gzlgfghpkbqlhgfozjkb.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6bGdmZ2hwa2JxbGhnZm96amtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzOTg1MDQsImV4cCI6MjA3MDk3NDUwNH0.0X_zVfNH9K5FBDcMl_O7yeXJYwuWvGLALwjIe5JRlqg"

echo -e "${BLUE}📋 Supabase Configuration:${NC}"
echo "  URL: $SUPABASE_URL"
echo "  Anon Key: ${SUPABASE_ANON_KEY:0:20}..."
echo ""

# Function to set env var in Vercel
set_vercel_env() {
    local key=$1
    local value=$2
    local env=${3:-production}
    
    if [ -z "$value" ]; then
        echo -e "${YELLOW}  ⚠️  Skipping $key (empty value)${NC}"
        return 1
    fi
    
    echo -n "  Setting $key for $env... "
    
    # Use vercel env add with echo pipe
    if echo "$value" | vercel env add "$key" "$env" --yes --force 2>&1 | grep -q "Added\|Updated"; then
        echo -e "${GREEN}✓${NC}"
        return 0
    else
        # Try alternative method
        if vercel env add "$key" "$env" <<< "$value" 2>&1 | grep -q "Added\|Updated"; then
            echo -e "${GREEN}✓${NC}"
            return 0
        else
            echo -e "${RED}✗ (may already exist)${NC}"
            return 1
        fi
    fi
}

SYNCED=0
FAILED=0

echo -e "${BLUE}🔧 Setting Supabase Variables:${NC}"

# Set Supabase variables
if set_vercel_env "NEXT_PUBLIC_SUPABASE_URL" "$SUPABASE_URL" "production"; then ((SYNCED++)); else ((FAILED++)); fi
if set_vercel_env "NEXT_PUBLIC_SUPABASE_URL" "$SUPABASE_URL" "preview"; then ((SYNCED++)); else ((FAILED++)); fi
if set_vercel_env "NEXT_PUBLIC_SUPABASE_URL" "$SUPABASE_URL" "development"; then ((SYNCED++)); else ((FAILED++)); fi

if set_vercel_env "NEXT_PUBLIC_SUPABASE_ANON_KEY" "$SUPABASE_ANON_KEY" "production"; then ((SYNCED++)); else ((FAILED++)); fi
if set_vercel_env "NEXT_PUBLIC_SUPABASE_ANON_KEY" "$SUPABASE_ANON_KEY" "preview"; then ((SYNCED++)); else ((FAILED++)); fi
if set_vercel_env "NEXT_PUBLIC_SUPABASE_ANON_KEY" "$SUPABASE_ANON_KEY" "development"; then ((SYNCED++)); else ((FAILED++)); fi

echo ""
echo -e "${YELLOW}⚠️  Note: SUPABASE_SERVICE_ROLE_KEY must be set manually${NC}"
echo "  (Service role key is sensitive and not available via API)"
echo "  Get it from: Supabase Dashboard → Settings → API → service_role key"
echo ""

# Check for Clerk keys in .env.local
if [ -f .env.local ]; then
    echo -e "${BLUE}🔍 Checking .env.local for Clerk keys...${NC}"
    
    CLERK_PUB_KEY=$(grep "^NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=" .env.local | cut -d '=' -f2- | tr -d '"' | tr -d "'" || echo "")
    CLERK_SECRET=$(grep "^CLERK_SECRET_KEY=" .env.local | cut -d '=' -f2- | tr -d '"' | tr -d "'" || echo "")
    
    if [ -n "$CLERK_PUB_KEY" ]; then
        echo "  Found NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"
        if set_vercel_env "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" "$CLERK_PUB_KEY" "production"; then ((SYNCED++)); else ((FAILED++)); fi
        if set_vercel_env "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" "$CLERK_PUB_KEY" "preview"; then ((SYNCED++)); else ((FAILED++)); fi
        if set_vercel_env "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" "$CLERK_PUB_KEY" "development"; then ((SYNCED++)); else ((FAILED++)); fi
    else
        echo -e "${YELLOW}  ⚠️  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY not found in .env.local${NC}"
    fi
    
    if [ -n "$CLERK_SECRET" ]; then
        echo "  Found CLERK_SECRET_KEY"
        if set_vercel_env "CLERK_SECRET_KEY" "$CLERK_SECRET" "production"; then ((SYNCED++)); else ((FAILED++)); fi
        if set_vercel_env "CLERK_SECRET_KEY" "$CLERK_SECRET" "preview"; then ((SYNCED++)); else ((FAILED++)); fi
        # Note: Don't set secret key for development (security)
    else
        echo -e "${YELLOW}  ⚠️  CLERK_SECRET_KEY not found in .env.local${NC}"
    fi
else
    echo -e "${YELLOW}  ⚠️  .env.local not found${NC}"
fi

echo ""
echo "====================================================="
echo "📊 Summary"
echo "====================================================="
echo -e "${GREEN}Synced: $SYNCED variables${NC}"
echo -e "${RED}Failed/Skipped: $FAILED${NC}"
echo ""

if [ $SYNCED -gt 0 ]; then
    echo -e "${GREEN}✅ Environment variables set successfully!${NC}"
    echo ""
    echo "📋 Next Steps:"
    echo "  1. Set SUPABASE_SERVICE_ROLE_KEY manually in Vercel Dashboard"
    echo "  2. Set CLERK keys if not already set"
    echo "  3. Redeploy: vercel --prod"
else
    echo -e "${RED}❌ No variables were set. Check errors above.${NC}"
    exit 1
fi

