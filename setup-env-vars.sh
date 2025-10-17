#!/bin/bash

# DealershipAI Environment Variables Setup Script
# This script adds all required environment variables to Vercel

echo "🚀 Setting up DealershipAI Environment Variables in Vercel..."

# Core Ory Configuration
echo "Adding Ory configuration variables..."
vercel env add ORY_SDK_URL production <<< "https://optimistic-haslett-3r8udelhc2.projects.oryapis.com"
vercel env add NEXT_PUBLIC_ORY_SDK_URL production <<< "https://optimistic-haslett-3r8udelhc2.projects.oryapis.com"
vercel env add ORY_PROJECT_ID production <<< "360ebb8f-2337-48cd-9d25-fba49a262f9c"
vercel env add ORY_WORKSPACE_ID production <<< "83af532a-eee6-4ad8-96c4-f4802a90940a"

# JWT Configuration
echo "Adding JWT configuration..."
vercel env add JWT_SECRET production <<< "dealershipai-jwt-secret-key-2024-production"

# Ory API Keys (placeholder - you need to get these from Ory Console)
echo "Adding Ory API keys (you need to update these with real values)..."
vercel env add ORY_API_KEY production <<< "your_ory_api_key_here"
vercel env add ORY_WEBHOOK_SECRET production <<< "your_webhook_secret_here"

# Database Configuration (placeholder - update with your actual values)
echo "Adding database configuration (update with your actual values)..."
vercel env add DATABASE_URL production <<< "your_supabase_connection_string"
vercel env add SUPABASE_URL production <<< "your_supabase_url"
vercel env add SUPABASE_ANON_KEY production <<< "your_supabase_anon_key"
vercel env add SUPABASE_SERVICE_ROLE_KEY production <<< "your_supabase_service_role_key"

# Redis Cache Configuration (placeholder - update with your actual values)
echo "Adding Redis configuration (update with your actual values)..."
vercel env add UPSTASH_REDIS_REST_URL production <<< "your_redis_url"
vercel env add UPSTASH_REDIS_REST_TOKEN production <<< "your_redis_token"

echo "✅ Environment variables setup complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Go to Ory Console: https://console.ory.sh"
echo "2. Select Project: optimistic-haslett-3r8udelhc2"
echo "3. Get API Key from Settings → API Keys"
echo "4. Get Webhook Secret from Settings → Webhooks"
echo "5. Update ORY_API_KEY and ORY_WEBHOOK_SECRET in Vercel dashboard"
echo "6. Update database and Redis variables with your actual values"
echo ""
echo "🔗 Vercel Dashboard: https://vercel.com/brian-kramers-projects/dealershipai-dashboard/settings/environment-variables"