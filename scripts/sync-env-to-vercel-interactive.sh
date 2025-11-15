#!/bin/bash

# Interactive script to sync environment variables to Vercel
# This script will prompt you to paste values

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "🚀 Vercel Environment Variables Sync"
echo "====================================="
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

echo -e "${BLUE}📋 Supabase Variables (from MCP):${NC}"
echo ""

# Supabase URL
echo -e "${GREEN}1. Setting NEXT_PUBLIC_SUPABASE_URL${NC}"
echo "   Value: https://gzlgfghpkbqlhgfozjkb.supabase.co"
echo "   Press Enter to set for production..."
read
echo "https://gzlgfghpkbqlhgfozjkb.supabase.co" | vercel env add NEXT_PUBLIC_SUPABASE_URL production

echo ""
echo -e "${GREEN}2. Setting NEXT_PUBLIC_SUPABASE_ANON_KEY${NC}"
echo "   Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
echo "   Press Enter to set for production..."
read
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6bGdmZ2hwa2JxbGhnZm96amtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzOTg1MDQsImV4cCI6MjA3MDk3NDUwNH0.0X_zVfNH9K5FBDcMl_O7yeXJYwuWvGLALwjIe5JRlqg" | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production

echo ""
echo -e "${YELLOW}⚠️  Manual Steps Required:${NC}"
echo ""
echo "3. Set SUPABASE_SERVICE_ROLE_KEY:"
echo "   - Get from: Supabase Dashboard → Settings → API → service_role key"
echo "   - Run: vercel env add SUPABASE_SERVICE_ROLE_KEY production"
echo ""
echo "4. Set Clerk Keys (if in .env.local):"
if [ -f .env.local ]; then
    CLERK_PUB=$(grep "^NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=" .env.local | cut -d '=' -f2- | tr -d '"' | tr -d "'" | head -1)
    if [ -n "$CLERK_PUB" ]; then
        echo "   Found Clerk publishable key in .env.local"
        echo "   Run: vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production"
        echo "   Then paste: $CLERK_PUB"
    else
        echo "   Clerk publishable key not found in .env.local"
    fi
    
    CLERK_SECRET=$(grep "^CLERK_SECRET_KEY=" .env.local | cut -d '=' -f2- | tr -d '"' | tr -d "'" | head -1)
    if [ -n "$CLERK_SECRET" ]; then
        echo "   Found Clerk secret key in .env.local"
        echo "   Run: vercel env add CLERK_SECRET_KEY production"
        echo "   Then paste: $CLERK_SECRET"
    else
        echo "   Clerk secret key not found in .env.local"
    fi
else
    echo "   .env.local not found"
fi

echo ""
echo -e "${GREEN}✅ Supabase variables set!${NC}"
echo ""
echo "📋 Next: Set remaining variables manually, then redeploy: vercel --prod"

