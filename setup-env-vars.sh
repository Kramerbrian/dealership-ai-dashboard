#!/bin/bash

# Supabase Environment Variables Setup Script
# Run this after rotating your Supabase keys

echo "🔐 Supabase Environment Variables Setup"
echo "========================================"
echo ""
echo "⚠️  IMPORTANT: You must have already rotated your Supabase service_role key!"
echo "    Go to: https://supabase.com/dashboard/project/gzlgfghpkbqlhgfozjkb/settings/api"
echo ""
echo "This script will help you add the required environment variables to Vercel."
echo ""

# Confirm before proceeding
read -p "Have you rotated the service_role key? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo "❌ Please rotate the key first, then run this script again."
    exit 1
fi

echo ""
echo "📝 Adding SUPABASE_URL..."
echo "Value: https://gzlgfghpkbqlhgfozjkb.supabase.co"
echo "https://gzlgfghpkbqlhgfozjkb.supabase.co" | vercel env add SUPABASE_URL production

echo ""
echo "📝 Adding SUPABASE_ANON_KEY..."
echo "Please paste your anon key (from Supabase dashboard):"
vercel env add SUPABASE_ANON_KEY production

echo ""
echo "📝 Adding SUPABASE_SERVICE_KEY..."
echo "⚠️  CRITICAL: Paste your NEW service_role key (not the old one!):"
vercel env add SUPABASE_SERVICE_KEY production

echo ""
echo "✅ Environment variables added successfully!"
echo ""
echo "🚀 Next step: Redeploy your application"
echo "   Run: vercel --prod"
echo ""
