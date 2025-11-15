#!/bin/bash

# Sync environment variables from .env.local to Vercel
# This script reads .env.local and sets variables in Vercel

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "🔄 Syncing Environment Variables to Vercel"
echo "=========================================="
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo -e "${RED}❌ .env.local not found${NC}"
    exit 1
fi

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

# Project ID from Vercel
PROJECT_ID="prj_n5a2az9ZjfIyAtv6izWeSb5vvVQH"
TEAM_ID="team_J5h3AZhwYBLSHC561ioEMwGH"

echo "📋 Reading .env.local..."
echo ""

# Critical variables to sync
CRITICAL_VARS=(
    "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"
    "CLERK_SECRET_KEY"
    "NEXT_PUBLIC_SUPABASE_URL"
    "SUPABASE_ANON_KEY"
    "SUPABASE_SERVICE_ROLE_KEY"
    "DATABASE_URL"
)

# Optional but recommended
OPTIONAL_VARS=(
    "NEXT_PUBLIC_BASE_URL"
    "NEXT_PUBLIC_GA"
    "OPENAI_API_KEY"
    "ANTHROPIC_API_KEY"
)

SYNCED=0
SKIPPED=0
FAILED=0

# Function to set env var in Vercel
set_vercel_env() {
    local key=$1
    local value=$2
    local env=${3:-production}
    
    echo -n "  Setting $key for $env... "
    
    # Use vercel env add command
    if echo "$value" | vercel env add "$key" "$env" --yes 2>/dev/null; then
        echo -e "${GREEN}✓${NC}"
        ((SYNCED++))
        return 0
    else
        # Try updating if it exists
        if echo "$value" | vercel env rm "$key" "$env" --yes 2>/dev/null && \
           echo "$value" | vercel env add "$key" "$env" --yes 2>/dev/null; then
            echo -e "${GREEN}✓ (updated)${NC}"
            ((SYNCED++))
            return 0
        else
            echo -e "${RED}✗${NC}"
            ((FAILED++))
            return 1
        fi
    fi
}

# Read .env.local and extract values
while IFS='=' read -r key value || [ -n "$key" ]; do
    # Skip comments and empty lines
    [[ "$key" =~ ^#.*$ ]] && continue
    [[ -z "$key" ]] && continue
    
    # Remove quotes from value
    value=$(echo "$value" | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//")
    
    # Check if it's a critical variable
    if [[ " ${CRITICAL_VARS[@]} " =~ " ${key} " ]]; then
        echo "🔑 Critical: $key"
        set_vercel_env "$key" "$value" "production"
        set_vercel_env "$key" "$value" "preview"
        set_vercel_env "$key" "$value" "development"
    elif [[ " ${OPTIONAL_VARS[@]} " =~ " ${key} " ]]; then
        echo "📌 Optional: $key"
        set_vercel_env "$key" "$value" "production"
    else
        ((SKIPPED++))
    fi
done < .env.local

echo ""
echo "=========================================="
echo "📊 Summary"
echo "=========================================="
echo -e "${GREEN}Synced: $SYNCED${NC}"
echo -e "${YELLOW}Skipped: $SKIPPED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ Environment variables synced successfully!${NC}"
    echo ""
    echo "Next: Redeploy your project to apply changes"
    echo "  vercel --prod"
else
    echo -e "${RED}❌ Some variables failed to sync. Check errors above.${NC}"
    exit 1
fi
