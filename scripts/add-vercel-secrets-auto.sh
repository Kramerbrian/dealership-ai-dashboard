#!/bin/bash

# Script to automatically add the 3 remaining Vercel secrets to GitHub
# Uses Vercel CLI and project configuration

set -e

REPO="Kramerbrian/dealership-ai-dashboard"

echo "========================================="
echo "Adding Vercel Secrets to GitHub"
echo "Repository: $REPO"
echo "========================================="
echo ""

# Get Vercel org ID (username)
echo "🔍 Detecting Vercel organization..."
VERCEL_ORG_ID=$(npx vercel whoami 2>/dev/null | head -n 1 || echo "")

if [ -z "$VERCEL_ORG_ID" ]; then
    echo "❌ Could not detect Vercel org. Please run 'npx vercel login' first"
    exit 1
fi

echo "  ✅ Detected Vercel org: $VERCEL_ORG_ID"
echo ""

# Get project info from .vercel directory
echo "🔍 Looking for Vercel project configuration..."
if [ -f ".vercel/project.json" ]; then
    VERCEL_PROJECT_ID=$(cat .vercel/project.json | grep -o '"projectId":"[^"]*"' | cut -d'"' -f4)
    echo "  ✅ Found project ID: $VERCEL_PROJECT_ID"
else
    echo "  ⚠️  No .vercel/project.json found"
    echo "  ℹ️  Run 'npx vercel link' to link this project first"
    VERCEL_PROJECT_ID=""
fi
echo ""

# For VERCEL_TOKEN, we need the user to provide it
echo "🔑 VERCEL_TOKEN Required"
echo "========================================="
echo ""
echo "To get your Vercel token:"
echo "1. Visit: https://vercel.com/account/tokens"
echo "2. Click 'Create Token'"
echo "3. Name it: 'GitHub Actions Deploy'"
echo "4. Select scope: 'Full Account'"
echo "5. Copy the token (starts with 'vercel_')"
echo ""
echo "Paste your VERCEL_TOKEN below (or press Ctrl+C to exit):"
read -r VERCEL_TOKEN

if [ -z "$VERCEL_TOKEN" ]; then
    echo "❌ VERCEL_TOKEN is required"
    exit 1
fi

# Add all three Vercel secrets to GitHub
echo ""
echo "📝 Adding Vercel secrets to GitHub..."
echo ""

echo "7/9 Adding VERCEL_TOKEN..."
echo "$VERCEL_TOKEN" | gh secret set VERCEL_TOKEN --repo="$REPO"
echo "  ✅ VERCEL_TOKEN added"

echo "8/9 Adding VERCEL_ORG_ID..."
echo "$VERCEL_ORG_ID" | gh secret set VERCEL_ORG_ID --repo="$REPO"
echo "  ✅ VERCEL_ORG_ID added ($VERCEL_ORG_ID)"

if [ -n "$VERCEL_PROJECT_ID" ]; then
    echo "9/9 Adding VERCEL_PROJECT_ID..."
    echo "$VERCEL_PROJECT_ID" | gh secret set VERCEL_PROJECT_ID --repo="$REPO"
    echo "  ✅ VERCEL_PROJECT_ID added ($VERCEL_PROJECT_ID)"
else
    echo "⚠️  VERCEL_PROJECT_ID not found automatically"
    echo "Please enter your VERCEL_PROJECT_ID manually:"
    echo "(Find it at: https://vercel.com/$VERCEL_ORG_ID/dealership-ai-dashboard/settings)"
    read -r MANUAL_PROJECT_ID
    if [ -n "$MANUAL_PROJECT_ID" ]; then
        echo "9/9 Adding VERCEL_PROJECT_ID..."
        echo "$MANUAL_PROJECT_ID" | gh secret set VERCEL_PROJECT_ID --repo="$REPO"
        echo "  ✅ VERCEL_PROJECT_ID added ($MANUAL_PROJECT_ID)"
    else
        echo "❌ VERCEL_PROJECT_ID is required"
        exit 1
    fi
fi

echo ""
echo "========================================="
echo "✅ All Vercel Secrets Added!"
echo "========================================="
echo ""
echo "📊 Complete Secret List:"
gh secret list --repo="$REPO"
echo ""
echo "🚀 Ready to Deploy!"
echo ""
echo "Next steps:"
echo "1. Trigger deployment:"
echo "   git add ."
echo "   git commit -m '🚀 Trigger production deployment'"
echo "   git push origin main"
echo ""
echo "2. Monitor deployment:"
echo "   gh run watch"
echo "   # Or visit: https://github.com/$REPO/actions"
echo ""
echo "3. Test orchestrator:"
echo "   curl https://dealership-ai-dashboard-brian-kramer-dealershipai.vercel.app/api/orchestrator/v3/status | jq"
echo ""
