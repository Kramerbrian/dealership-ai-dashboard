#!/bin/bash

set -e

echo "🔧 Updating WorkOS Environment Variables in Vercel Production"
echo "=============================================================="
echo ""

# Read credentials from .env.local
CLIENT_ID=$(grep "^WORKOS_CLIENT_ID=" .env.local | cut -d'=' -f2)
API_KEY=$(grep "^WORKOS_API_KEY=" .env.local | cut -d'=' -f2)

echo "Found credentials:"
echo "  Client ID: ${CLIENT_ID:0:20}..."
echo "  API Key: ${API_KEY:0:20}..."
echo ""

# Remove old variables
echo "Step 1: Removing old environment variables..."
echo "y" | vercel env rm WORKOS_CLIENT_ID production --scope brian-kramers-projects 2>&1 | grep -v "Are you sure"  || true
echo "y" | vercel env rm WORKOS_API_KEY production --scope brian-kramers-projects 2>&1 | grep -v "Are you sure" || true
echo "y" | vercel env rm NEXT_PUBLIC_WORKOS_CLIENT_ID production --scope brian-kramers-projects 2>&1 | grep -v "Are you sure" || true

echo ""
echo "Step 2: Adding new environment variables with correct values..."

# Add new variables
echo "$CLIENT_ID" | vercel env add WORKOS_CLIENT_ID production --scope brian-kramers-projects 2>&1 | tail -2
echo "$API_KEY" | vercel env add WORKOS_API_KEY production --scope brian-kramers-projects 2>&1 | tail -2  
echo "$CLIENT_ID" | vercel env add NEXT_PUBLIC_WORKOS_CLIENT_ID production --scope brian-kramers-projects 2>&1 | tail -2

echo ""
echo "✅ WorkOS environment variables updated in Vercel production!"
echo ""
echo "Next steps:"
echo "  1. Redeploy to production: vercel --prod --scope brian-kramers-projects"
echo "  2. Configure redirect URI in WorkOS dashboard"
echo "  3. Test OAuth flow"

