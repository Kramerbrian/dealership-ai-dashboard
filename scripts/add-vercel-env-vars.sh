#!/bin/bash

# Script to add Supabase database password to Vercel
# Run this after setting up Vercel CLI: npm i -g vercel

echo "🔐 Adding Supabase Database Password to Vercel"
echo ""
echo "Environment variables to add:"
echo "  SUPABASE_DB_PASSWORD=Autonation2077$"
echo "  DATABASE_PASSWORD=Autonation2077$"
echo ""
echo "📋 Manual Steps (Recommended):"
echo "  1. Visit: https://vercel.com/YOUR_PROJECT/settings/environment-variables"
echo "  2. Add the following variables:"
echo "     - SUPABASE_DB_PASSWORD = Autonation2077$"
echo "     - DATABASE_PASSWORD = Autonation2077$"
echo "  3. Select environments: Production, Preview, Development"
echo "  4. Save"
echo ""
echo "🚀 Or use Vercel CLI:"
echo "  vercel env add SUPABASE_DB_PASSWORD production"
echo "  vercel env add DATABASE_PASSWORD production"
echo ""
echo "✅ After adding, redeploy:"
echo "  vercel --prod"

