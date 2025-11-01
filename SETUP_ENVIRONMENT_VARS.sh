#!/bin/bash

# DealershipAI - Automated Environment Setup
# This script helps you set up all environment variables for production

echo "🚀 DealershipAI - Automated Environment Setup"
echo "============================================="
echo ""
echo "This script will guide you through setting up all environment variables"
echo "for a complete SaaS deployment."
echo ""
echo "📋 Current Production URL:"
echo "https://dealership-ai-dashboard-brian-kramer-dealershipai.vercel.app"
echo ""
echo "🌐 Vercel Environment Variables:"
echo "https://vercel.com/brian-kramer-dealershipai/dealership-ai-dashboard/settings/environment-variables"
echo ""

# Function to add environment variable via CLI
add_env_var() {
    local key=$1
    local description=$2
    local example=$3
    
    echo ""
    echo "📝 Adding: $key"
    echo "Description: $description"
    echo "Example: $example"
    echo ""
    
    read -p "Do you want to add this variable now? (y/n): " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Enter the value for $key:"
        npx vercel env add "$key" production
        echo "✅ Added $key"
    else
        echo "⏭️ Skipped $key"
    fi
}

echo ""
echo "🔑 PHASE 1: Authentication (Clerk)"
echo "===================================="
echo "Get your keys from: https://dashboard.clerk.com"
echo ""

add_env_var "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" "Clerk publishable key for frontend" "pk_test_xxxxxxxxxxxxxxxxxxxxx"
add_env_var "CLERK_SECRET_KEY" "Clerk secret key for backend" "sk_test_xxxxxxxxxxxxxxxxxxxxx"
add_env_var "NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL" "Redirect URL after sign in" "https://dealershipai.com/dashboard"
add_env_var "NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL" "Redirect URL after sign up" "https://dealershipai.com/dashboard"

echo ""
echo "🗄️ PHASE 2: Database (Supabase)"
echo "==============================="
echo "Get your database URL from: https://app.supabase.com"
echo ""

add_env_var "DATABASE_URL" "Supabase PostgreSQL connection string" "postgresql://postgres.xxx:[PASSWORD]@aws-0-us-east-1.xxx.supabase.co:6543/postgres?pgbouncer=true"
add_env_var "DIRECT_URL" "Direct Supabase connection for migrations" "postgresql://postgres.xxx:[PASSWORD]@aws-0-us-east-1.xxx.supabase.co:5432/postgres"

echo ""
echo "⚡ PHASE 3: Caching (Upstash Redis)"
echo "===================================="
echo "Get your credentials from: https://console.upstash.com"
echo ""

add_env_var "UPSTASH_REDIS_REST_URL" "Upstash Redis REST API URL" "https://xxx.upstash.io"
add_env_var "UPSTASH_REDIS_REST_TOKEN" "Upstash Redis authentication token" "your_token_here"

echo ""
echo "💳 PHASE 4: Payments (Stripe)"
echo "============================="
echo "Get your keys from: https://dashboard.stripe.com"
echo ""

add_env_var "STRIPE_PUBLISHABLE_KEY" "Stripe publishable key" "pk_live_xxxxxxxxxxxxxxxxxxxxx"
add_env_var "STRIPE_SECRET_KEY" "Stripe secret key" "sk_live_xxxxxxxxxxxxxxxxxxxxx"
add_env_var "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY" "Stripe publishable key for frontend" "pk_live_xxxxxxxxxxxxxxxxxxxxx"
add_env_var "STRIPE_WEBHOOK_SECRET" "Stripe webhook signing secret" "whsec_xxxxxxxxxxxxxxxxxxxxx"
add_env_var "STRIPE_PRO_PRICE_ID" "Stripe Pro tier price ID" "price_xxxxxxxxxxxxxxxxxxxxx"
add_env_var "STRIPE_ENTERPRISE_PRICE_ID" "Stripe Enterprise tier price ID" "price_xxxxxxxxxxxxxxxxxxxxx"

echo ""
echo "📊 PHASE 5: Analytics (Optional)"
echo "================================="
echo ""

add_env_var "NEXT_PUBLIC_GA_ID" "Google Analytics measurement ID" "G-XXXXXXXXX"
add_env_var "SENTRY_DSN" "Sentry error tracking DSN" "https://xxx@xxx.ingest.sentry.io/xxx"
add_env_var "NEXT_PUBLIC_POSTHOG_KEY" "PostHog analytics key" "phc_xxxxxxxxxxxxxxxxxxxxx"
add_env_var "RESEND_API_KEY" "Resend email service API key" "re_xxxxxxxxxxxxxxxxxxxxx"

echo ""
echo "🔐 PHASE 6: Security (Optional)"
echo "================================"
echo ""

add_env_var "ENCRYPTION_KEY" "32-character hex string for credential encryption" "0123456789abcdef0123456789abcdef"
add_env_var "CRON_SECRET" "Random secret for cron webhook authentication" "random-secret-string"

echo ""
echo "🎉 Environment Setup Complete!"
echo "============================="
echo ""
echo "Next steps:"
echo "1. Redeploy: npx vercel --prod"
echo "2. Test authentication: Visit your URL and sign up"
echo "3. Set up database schema: npx prisma db push"
echo "4. Configure Stripe webhooks"
echo "5. Test payment flow"
echo ""
echo "📚 Full documentation:"
echo "- FULL_SAAS_SETUP_GUIDE.md"
echo "- PRODUCTION_SETUP_GUIDE.md"
echo "- QUICK_SETUP_CHECKLIST.md"
echo ""

