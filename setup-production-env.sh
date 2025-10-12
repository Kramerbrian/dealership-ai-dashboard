#!/bin/bash

# DealershipAI v2.0 - Production Environment Setup
# This script helps you set up all required environment variables

echo "🚀 DealershipAI v2.0 - Production Environment Setup"
echo "=================================================="

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "📝 Creating .env.local from template..."
    cp env.production.template .env.local
    echo "✅ Created .env.local"
else
    echo "📝 .env.local already exists"
fi

echo ""
echo "🔧 Required Environment Variables:"
echo "=================================="

# Database Configuration
echo "1. DATABASE CONFIGURATION:"
echo "   - DATABASE_URL (PostgreSQL connection string)"
echo "   - SUPABASE_URL (Your Supabase project URL)"
echo "   - SUPABASE_ANON_KEY (Supabase anonymous key)"
echo "   - SUPABASE_SERVICE_ROLE_KEY (Supabase service role key)"

echo ""
echo "2. REDIS CONFIGURATION:"
echo "   - REDIS_URL (Upstash Redis connection string)"
echo "   - REDIS_TOKEN (Upstash Redis token)"

echo ""
echo "3. JWT AUTHENTICATION:"
echo "   - JWT_SECRET (32+ character secret key)"

echo ""
echo "4. STRIPE PAYMENT PROCESSING:"
echo "   - STRIPE_SECRET_KEY (Live secret key)"
echo "   - STRIPE_PUBLISHABLE_KEY (Live publishable key)"
echo "   - STRIPE_WEBHOOK_SECRET (Webhook endpoint secret)"
echo "   - STRIPE_PRICE_ID_PRO_MONTHLY (Pro plan price ID)"
echo "   - STRIPE_PRICE_ID_ENTERPRISE_MONTHLY (Enterprise plan price ID)"

echo ""
echo "5. AI API KEYS:"
echo "   - OPENAI_API_KEY (OpenAI API key)"
echo "   - ANTHROPIC_API_KEY (Anthropic API key)"
echo "   - PERPLEXITY_API_KEY (Perplexity API key)"
echo "   - GEMINI_API_KEY (Google Gemini API key)"

echo ""
echo "6. APPLICATION CONFIGURATION:"
echo "   - NEXT_PUBLIC_APP_URL (Your Vercel app URL)"
echo "   - NEXTAUTH_SECRET (NextAuth secret)"

echo ""
echo "📋 Next Steps:"
echo "=============="
echo "1. Edit .env.local and fill in your actual values"
echo "2. Run: vercel env add [VARIABLE_NAME] [VALUE] for each variable"
echo "3. Or use: vercel env pull .env.local to sync from Vercel"
echo "4. Test locally: npm run dev"
echo "5. Deploy: vercel deploy --prod"

echo ""
echo "🔗 Quick Links:"
echo "==============="
echo "• Supabase: https://supabase.com/dashboard"
echo "• Upstash Redis: https://console.upstash.com/"
echo "• Stripe Dashboard: https://dashboard.stripe.com/"
echo "• OpenAI: https://platform.openai.com/api-keys"
echo "• Anthropic: https://console.anthropic.com/"
echo "• Perplexity: https://www.perplexity.ai/settings/api"
echo "• Google AI: https://aistudio.google.com/app/apikey"

echo ""
echo "✅ Environment setup guide complete!"
echo "Edit .env.local with your actual values and run 'vercel env push' to sync to Vercel."
