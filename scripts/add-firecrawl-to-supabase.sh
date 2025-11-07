#!/bin/bash

# Add Firecrawl API Key to Supabase
# This script helps you add the Firecrawl API key to your Supabase project

set -e

API_KEY="fc-a2bb1140792448de9513a97e60ff43fa"
PROJECT_REF="${SUPABASE_PROJECT_REF:-gzlgfghpkbqlhgfozjkb}"

echo "🔥 Adding Firecrawl API Key to Supabase"
echo "======================================"
echo ""
echo "Project Reference: $PROJECT_REF"
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found"
    echo ""
    echo "Install it with:"
    echo "  brew install supabase/tap/supabase"
    echo ""
    echo "Or use the Supabase Dashboard method below."
    exit 1
fi

echo "📋 Method 1: Using Supabase CLI"
echo "--------------------------------"
echo ""
echo "Run these commands:"
echo ""
echo "  # Login to Supabase (if not already)"
echo "  supabase login"
echo ""
echo "  # Link to your project"
echo "  supabase link --project-ref $PROJECT_REF"
echo ""
echo "  # Set the secret"
echo "  supabase secrets set FIRECRAWL_API_KEY=$API_KEY"
echo ""
echo ""

echo "📋 Method 2: Using Supabase Dashboard"
echo "--------------------------------------"
echo ""
echo "1. Go to: https://supabase.com/dashboard/project/$PROJECT_REF/settings/secrets"
echo "2. Click 'Add new secret'"
echo "3. Enter:"
echo "   Name: FIRECRAWL_API_KEY"
echo "   Value: $API_KEY"
echo "4. Click 'Save'"
echo ""
echo ""

echo "📋 Method 3: Using Supabase Management API"
echo "-------------------------------------------"
echo ""
echo "If you have a Supabase access token, you can use:"
echo ""
echo "  curl -X POST 'https://api.supabase.com/v1/projects/$PROJECT_REF/secrets' \\"
echo "    -H 'Authorization: Bearer YOUR_ACCESS_TOKEN' \\"
echo "    -H 'Content-Type: application/json' \\"
echo "    -d '{\"name\": \"FIRECRAWL_API_KEY\", \"value\": \"$API_KEY\"}'"
echo ""
echo ""

echo "✅ After adding the secret, it will be available as:"
echo "   process.env.FIRECRAWL_API_KEY"
echo ""
echo "💡 Note: Secrets are available in Edge Functions and can be accessed"
echo "   via Supabase's environment variable system."

