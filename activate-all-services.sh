#!/bin/bash
# Full Service Activation Script for DealershipAI
# This script adds all required environment variables to Vercel

set -e

echo "🚀 DealershipAI - Full Service Activation"
echo "=========================================="
echo ""

# Supabase Configuration
echo "📦 Adding Supabase environment variables..."
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4cmR2a2hrb21id2xoanZ0c213Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0NjgwMDQsImV4cCI6MjA3MTA0NDAwNH0.5GEWgoolAs5l1zd0ftOBG7MfYZ20sKuxcR-w93VeF7s" | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
echo "https://vxrdvkhkombwlhjvtsmw.supabase.co" | vercel env add NEXT_PUBLIC_SUPABASE_URL production
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4cmR2a2hrb21id2xoanZ0c213Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTQ2ODAwNCwiZXhwIjoyMDcxMDQ0MDA0fQ.lLQNZjVAWQ_DeObUYMzXL4cQ81_R6MnDzYPlqIIxoR0" | vercel env add SUPABASE_SERVICE_ROLE_KEY production

echo "✅ Supabase configured!"
echo ""

# Clerk Configuration URLs
echo "🔐 Adding Clerk URL configuration..."
echo "/sign-in" | vercel env add NEXT_PUBLIC_CLERK_SIGN_IN_URL production
echo "/sign-up" | vercel env add NEXT_PUBLIC_CLERK_SIGN_UP_URL production
echo "/dashboard" | vercel env add NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL production
echo "/dashboard" | vercel env add NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL production

echo "✅ Clerk URLs configured!"
echo ""

echo "=========================================="
echo "✅ All environment variables added!"
echo ""
echo "⚠️  IMPORTANT: You still need to add Clerk API keys manually:"
echo "   1. Go to https://dashboard.clerk.com/"
echo "   2. Get your Publishable Key (pk_live_...)"
echo "   3. Get your Secret Key (sk_live_...)"
echo "   4. Run these commands:"
echo ""
echo "   vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production"
echo "   vercel env add CLERK_SECRET_KEY production"
echo ""
echo "🚀 Ready for deployment after Clerk keys are added!"
