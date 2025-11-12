#!/bin/bash

# Configure Vercel Environment Variables for Production
# This script sets all required Supabase environment variables

set -e

echo "🚀 Configuring Vercel Environment Variables"
echo "============================================"
echo ""

# Supabase Configuration
SUPABASE_URL="https://vxrdvkhkombwlhjvtsmw.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4cmR2a2hrb21id2xoanZ0c213Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0NjgwMDQsImV4cCI6MjA3MTA0NDAwNH0.5GEWgoolAs5l1zd0ftOBG7MfYZ20sKuxcR-w93VeF7s"
SUPABASE_SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4cmR2a2hrb21id2xoanZ0c213Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTQ2ODAwNCwiZXhwIjoyMDcxMDQ0MDA0fQ.lLQNZjVAWQ_DeObUYMzXL4cQ81_R6MnDzYPlqIIxoR0"
DATABASE_URL="postgresql://postgres.vxrdvkhkombwlhjvtsmw:Autonation2077\$@aws-0-us-east-1.pooler.supabase.com:6543/postgres"

# Get Vercel token from config
VERCEL_TOKEN=$(npx vercel whoami -t 2>&1 | grep -o 'Token:.*' | cut -d' ' -f2 || echo "")

if [ -z "$VERCEL_TOKEN" ]; then
  echo "⚠️  Vercel token not found. Using manual configuration method."
  echo ""
  echo "Please run these commands manually:"
  echo ""
  echo "echo '$SUPABASE_URL' | npx vercel env add NEXT_PUBLIC_SUPABASE_URL production"
  echo "echo '$SUPABASE_ANON_KEY' | npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production"
  echo "echo '$SUPABASE_SERVICE_KEY' | npx vercel env add SUPABASE_SERVICE_ROLE_KEY production"
  echo "echo '$DATABASE_URL' | npx vercel env add DATABASE_URL production"
  exit 1
fi

# Function to add environment variable
add_env_var() {
  local name=$1
  local value=$2
  local env_type=${3:-production}

  echo "Adding $name to $env_type..."
  echo "$value" | npx vercel env add "$name" "$env_type" 2>&1 || {
    echo "⚠️  Failed to add $name (may already exist)"
  }
}

# Add all environment variables
echo "📝 Adding NEXT_PUBLIC_SUPABASE_URL..."
add_env_var "NEXT_PUBLIC_SUPABASE_URL" "$SUPABASE_URL"

echo ""
echo "📝 Adding NEXT_PUBLIC_SUPABASE_ANON_KEY..."
add_env_var "NEXT_PUBLIC_SUPABASE_ANON_KEY" "$SUPABASE_ANON_KEY"

echo ""
echo "📝 Adding SUPABASE_SERVICE_ROLE_KEY..."
add_env_var "SUPABASE_SERVICE_ROLE_KEY" "$SUPABASE_SERVICE_KEY"

echo ""
echo "📝 Adding DATABASE_URL..."
add_env_var "DATABASE_URL" "$DATABASE_URL"

echo ""
echo "✅ Environment variables configured!"
echo ""
echo "🚀 Deploying to production..."
npx vercel --prod --yes

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🔍 Verify deployment:"
echo "  - Check Vercel dashboard: https://vercel.com/brian-kramer-dealershipai/dealership-ai-dashboard"
echo "  - Test health endpoint: curl https://dealershipai.com/api/health"
echo ""
