#!/bin/bash

# Vercel Deployment Setup Script
# For deployment: https://vercel.com/brian-kramers-projects/dealership-ai-dashboard/HRquUb6CYEdBjyZe2SkcjyYnEqV9

set -e

PASSWORD="Autonation2077$"
TEAM="brian-kramers-projects"
PROJECT="dealership-ai-dashboard"
DEPLOYMENT_ID="HRquUb6CYEdBjyZe2SkcjyYnEqV9"

echo "🚀 Vercel Deployment Setup"
echo "=========================="
echo ""
echo "Deployment: $DEPLOYMENT_ID"
echo "Project: $PROJECT"
echo "Team: $TEAM"
echo ""

# Check if project is linked
if [ ! -f .vercel/project.json ]; then
  echo "📋 Step 1: Linking project"
  echo "   Team: $TEAM"
  echo "   Project: $PROJECT"
  echo ""
  echo "⚠️  This requires interactive selection"
  echo "   Run: npx vercel link"
  echo "   Select: $TEAM / $PROJECT"
  echo ""
  exit 1
fi

echo "✅ Project linked"
echo ""

# Add environment variables
echo "📋 Step 2: Adding environment variables"
echo ""

echo "Adding SUPABASE_DB_PASSWORD..."
echo "$PASSWORD" | npx vercel env add SUPABASE_DB_PASSWORD production --scope=$TEAM 2>&1 | grep -v "Vercel CLI" || true
echo "$PASSWORD" | npx vercel env add SUPABASE_DB_PASSWORD preview --scope=$TEAM 2>&1 | grep -v "Vercel CLI" || true
echo "$PASSWORD" | npx vercel env add SUPABASE_DB_PASSWORD development --scope=$TEAM 2>&1 | grep -v "Vercel CLI" || true

echo ""
echo "Adding DATABASE_PASSWORD..."
echo "$PASSWORD" | npx vercel env add DATABASE_PASSWORD production --scope=$TEAM 2>&1 | grep -v "Vercel CLI" || true
echo "$PASSWORD" | npx vercel env add DATABASE_PASSWORD preview --scope=$TEAM 2>&1 | grep -v "Vercel CLI" || true
echo "$PASSWORD" | npx vercel env add DATABASE_PASSWORD development --scope=$TEAM 2>&1 | grep -v "Vercel CLI" || true

echo ""
echo "✅ Environment variables added!"
echo ""

# Verify
echo "📋 Step 3: Verifying variables"
echo ""
npx vercel env ls --scope=$TEAM 2>&1 | grep -E "SUPABASE_DB_PASSWORD|DATABASE_PASSWORD" | head -6

echo ""
echo "📋 Step 4: Deployment Info"
echo ""
echo "Deployment URL: https://vercel.com/$TEAM/$PROJECT/$DEPLOYMENT_ID"
echo ""
echo "To redeploy:"
echo "  npx vercel --prod --scope=$TEAM"

