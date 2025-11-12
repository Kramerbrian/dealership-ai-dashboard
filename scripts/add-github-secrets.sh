#!/bin/bash

# Script to automatically add all required GitHub Secrets
# Requires: gh CLI installed and authenticated

set -e

REPO="Kramerbrian/dealership-ai-dashboard"

echo "========================================="
echo "Adding GitHub Secrets for Deployment"
echo "Repository: $REPO"
echo "========================================="
echo ""

# Check if gh is installed and authenticated
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is not installed"
    echo "Install with: brew install gh"
    exit 1
fi

# Check authentication
if ! gh auth status &> /dev/null; then
    echo "⚠️  GitHub CLI not authenticated"
    echo "Please authenticate with: gh auth login"
    echo ""
    echo "Opening authentication prompt..."
    gh auth login
fi

echo "✅ GitHub CLI authenticated"
echo ""

# Load environment variables from .env.local
if [ -f .env.local ]; then
    export $(cat .env.local | grep -v '^#' | grep -v '^\s*$' | xargs)
else
    echo "❌ .env.local file not found"
    exit 1
fi

echo "📝 Adding secrets from .env.local..."
echo ""

# Add OpenAI API Key
if [ -n "$OPENAI_API_KEY" ]; then
    echo "1/9 Adding OPENAI_API_KEY..."
    echo "$OPENAI_API_KEY" | gh secret set OPENAI_API_KEY --repo="$REPO"
    echo "  ✅ OPENAI_API_KEY added"
else
    echo "  ⚠️  OPENAI_API_KEY not found in .env.local"
fi

# Add Supabase URL
if [ -n "$SUPABASE_URL" ]; then
    echo "2/9 Adding NEXT_PUBLIC_SUPABASE_URL..."
    echo "$SUPABASE_URL" | gh secret set NEXT_PUBLIC_SUPABASE_URL --repo="$REPO"
    echo "  ✅ NEXT_PUBLIC_SUPABASE_URL added"
else
    echo "  ⚠️  SUPABASE_URL not found in .env.local"
fi

# Add Supabase Anon Key
if [ -n "$SUPABASE_ANON_KEY" ]; then
    echo "3/9 Adding NEXT_PUBLIC_SUPABASE_ANON_KEY..."
    echo "$SUPABASE_ANON_KEY" | gh secret set NEXT_PUBLIC_SUPABASE_ANON_KEY --repo="$REPO"
    echo "  ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY added"
else
    echo "  ⚠️  SUPABASE_ANON_KEY not found in .env.local"
fi

# Add Supabase Service Role Key
if [ -n "$SUPABASE_SERVICE_KEY" ]; then
    echo "4/9 Adding SUPABASE_SERVICE_ROLE_KEY..."
    echo "$SUPABASE_SERVICE_KEY" | gh secret set SUPABASE_SERVICE_ROLE_KEY --repo="$REPO"
    echo "  ✅ SUPABASE_SERVICE_ROLE_KEY added"
else
    echo "  ⚠️  SUPABASE_SERVICE_KEY not found in .env.local"
fi

# Add Clerk Publishable Key
if [ -n "$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" ]; then
    echo "5/9 Adding NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY..."
    echo "$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" | gh secret set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY --repo="$REPO"
    echo "  ✅ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY added"
else
    echo "  ⚠️  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY not found in .env.local"
fi

# Add Clerk Secret Key
if [ -n "$CLERK_SECRET_KEY" ]; then
    echo "6/9 Adding CLERK_SECRET_KEY..."
    echo "$CLERK_SECRET_KEY" | gh secret set CLERK_SECRET_KEY --repo="$REPO"
    echo "  ✅ CLERK_SECRET_KEY added"
else
    echo "  ⚠️  CLERK_SECRET_KEY not found in .env.local"
fi

echo ""
echo "🔧 Now adding Vercel configuration..."
echo ""

# Get Vercel Project Info
echo "Retrieving Vercel project information..."
VERCEL_PROJECT_JSON=$(npx vercel inspect 2>/dev/null || echo "{}")

# Try to get Vercel ORG ID from whoami
VERCEL_USER=$(npx vercel whoami 2>/dev/null | head -n 1 || echo "")

# Prompt for Vercel Token
echo ""
echo "7/9 VERCEL_TOKEN required:"
echo "  📌 Visit: https://vercel.com/account/tokens"
echo "  📌 Create a new token named 'GitHub Actions Deploy'"
echo "  📌 Copy the token (starts with 'vercel_')"
echo ""
read -p "Paste your VERCEL_TOKEN: " VERCEL_TOKEN

if [ -n "$VERCEL_TOKEN" ]; then
    echo "$VERCEL_TOKEN" | gh secret set VERCEL_TOKEN --repo="$REPO"
    echo "  ✅ VERCEL_TOKEN added"
else
    echo "  ⚠️  VERCEL_TOKEN not provided"
fi

# Prompt for Vercel ORG ID
echo ""
echo "8/9 VERCEL_ORG_ID required:"
if [ -n "$VERCEL_USER" ]; then
    echo "  📌 Detected Vercel user: $VERCEL_USER"
    echo "  📌 Your ORG_ID might be: $VERCEL_USER"
fi
echo "  📌 Or visit: https://vercel.com/account"
echo "  📌 Look for 'Team ID' or use your username"
echo ""
read -p "Enter your VERCEL_ORG_ID [$VERCEL_USER]: " VERCEL_ORG_ID
VERCEL_ORG_ID=${VERCEL_ORG_ID:-$VERCEL_USER}

if [ -n "$VERCEL_ORG_ID" ]; then
    echo "$VERCEL_ORG_ID" | gh secret set VERCEL_ORG_ID --repo="$REPO"
    echo "  ✅ VERCEL_ORG_ID added"
else
    echo "  ⚠️  VERCEL_ORG_ID not provided"
fi

# Prompt for Vercel Project ID
echo ""
echo "9/9 VERCEL_PROJECT_ID required:"
echo "  📌 Visit: https://vercel.com/$VERCEL_ORG_ID/dealership-ai-dashboard/settings"
echo "  📌 Look for 'Project ID' (format: prj_xxxxx)"
echo ""
read -p "Enter your VERCEL_PROJECT_ID: " VERCEL_PROJECT_ID

if [ -n "$VERCEL_PROJECT_ID" ]; then
    echo "$VERCEL_PROJECT_ID" | gh secret set VERCEL_PROJECT_ID --repo="$REPO"
    echo "  ✅ VERCEL_PROJECT_ID added"
else
    echo "  ⚠️  VERCEL_PROJECT_ID not provided"
fi

echo ""
echo "========================================="
echo "✅ GitHub Secrets Configuration Complete!"
echo "========================================="
echo ""
echo "📊 Summary:"
gh secret list --repo="$REPO"
echo ""
echo "🚀 Next Steps:"
echo "1. Trigger deployment with:"
echo "   git commit --allow-empty -m 'Trigger deployment'"
echo "   git push origin main"
echo ""
echo "2. Monitor deployment:"
echo "   - GitHub Actions: https://github.com/$REPO/actions"
echo "   - Vercel: https://vercel.com/$VERCEL_ORG_ID/dealership-ai-dashboard"
echo ""
echo "3. Test orchestrator:"
echo "   curl https://api.dealershipai.com/api/orchestrator/v3/status | jq"
echo ""
