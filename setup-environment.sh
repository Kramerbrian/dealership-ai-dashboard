#!/bin/bash

# DealershipAI Environment Setup Script
# This script helps you configure all necessary environment variables

echo "🚀 DealershipAI Environment Setup"
echo "================================="
echo ""

# Check if .env.local exists
if [ -f ".env.local" ]; then
    echo "📁 Found existing .env.local file"
    echo "📋 Current environment variables:"
    echo ""
    grep -E "^(OPENAI_|SUPABASE_|NEXT_PUBLIC_)" .env.local 2>/dev/null || echo "   No OpenAI/Supabase variables found"
    echo ""
    read -p "Do you want to update the existing .env.local file? (y/n): " update_existing
else
    update_existing="y"
fi

if [ "$update_existing" = "y" ]; then
    echo ""
    echo "🔧 Setting up environment variables..."
    echo ""
    
    # Create backup if file exists
    if [ -f ".env.local" ]; then
        cp .env.local .env.local.backup
        echo "💾 Created backup: .env.local.backup"
    fi
    
    # Start with Vercel token if it exists
    VERCEL_TOKEN=""
    if [ -f ".env.local" ]; then
        VERCEL_TOKEN=$(grep "VERCEL_OIDC_TOKEN" .env.local | cut -d'=' -f2-)
    fi
    
    # Create new .env.local
    cat > .env.local << EOF
# DealershipAI Environment Configuration
# Created: $(date)
# This file contains all necessary environment variables for local development

# ===========================================
# OpenAI Configuration
# ===========================================
# Get your API key from: https://platform.openai.com/api-keys
OPENAI_API_KEY=your_openai_api_key_here

# Get your Assistant ID from: https://platform.openai.com/assistants
# After creating the assistant as described in OPENAI_SUPABASE_SETUP_GUIDE.md
OPENAI_ASSISTANT_ID=asst_your_assistant_id_here

# OpenAI Model Configuration
OPENAI_MODEL=gpt-4-turbo-preview

# ===========================================
# Supabase Configuration
# ===========================================
# Get these from your Supabase project dashboard: Settings → API
SUPABASE_URL=your_supabase_project_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Optional: Service role key for admin operations
# SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# ===========================================
# Application Configuration
# ===========================================
# Application URL (for local development)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Environment
NODE_ENV=development

# ===========================================
# Optional: Redis Configuration (for caching)
# ===========================================
# REDIS_URL=your_redis_url_here

# ===========================================
# Optional: Clerk Authentication
# ===========================================
# NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
# CLERK_SECRET_KEY=your_clerk_secret_key

# ===========================================
# Vercel Configuration
# ===========================================
EOF

    # Add Vercel token if it exists
    if [ -n "$VERCEL_TOKEN" ]; then
        echo "VERCEL_OIDC_TOKEN=$VERCEL_TOKEN" >> .env.local
    else
        echo "# VERCEL_OIDC_TOKEN=your_vercel_token_here" >> .env.local
    fi
    
    echo ""
    echo "✅ Created .env.local file with template values"
    echo ""
    echo "📝 Next steps:"
    echo "1. Edit .env.local and replace the placeholder values:"
    echo "   - your_openai_api_key_here"
    echo "   - your_supabase_project_url_here" 
    echo "   - your_supabase_anon_key_here"
    echo "   - asst_your_assistant_id_here"
    echo ""
    echo "2. Run the Supabase migration:"
    echo "   - Go to https://supabase.com/dashboard"
    echo "   - Open SQL Editor"
    echo "   - Copy contents of supabase/migrations/20250110000000_add_aiv_tables.sql"
    echo "   - Run the migration"
    echo ""
    echo "3. Create OpenAI Assistant:"
    echo "   - Go to https://platform.openai.com/assistants"
    echo "   - Create new assistant with the instructions from OPENAI_SUPABASE_SETUP_GUIDE.md"
    echo "   - Copy the Assistant ID to .env.local"
    echo ""
    echo "4. Restart development server:"
    echo "   npm run dev"
    echo ""
else
    echo "⏭️  Skipping .env.local update"
fi

echo ""
echo "🔍 Current environment status:"
echo "=============================="

# Check for required variables
check_var() {
    if grep -q "^$1=" .env.local 2>/dev/null; then
        value=$(grep "^$1=" .env.local | cut -d'=' -f2-)
        if [[ "$value" == *"your_"* ]] || [[ "$value" == *"here" ]]; then
            echo "❌ $1: Not configured (placeholder value)"
        else
            echo "✅ $1: Configured"
        fi
    else
        echo "❌ $1: Missing"
    fi
}

check_var "OPENAI_API_KEY"
check_var "OPENAI_ASSISTANT_ID"
check_var "SUPABASE_URL"
check_var "SUPABASE_ANON_KEY"

echo ""
echo "🧪 Test your configuration:"
echo "=========================="
echo "After updating .env.local, run:"
echo "  ./scripts/verify-setup.sh"
echo ""
echo "Or test individual endpoints:"
echo "  curl -X POST http://localhost:3000/api/gpt-proxy -H 'Content-Type: application/json' -d '{\"prompt\":\"test\"}'"
echo "  curl http://localhost:3000/api/aiv-metrics?dealerId=demo-dealer"
echo ""
echo "📚 For detailed instructions, see: OPENAI_SUPABASE_SETUP_GUIDE.md"
echo ""
echo "🎉 Setup complete! Happy coding!"
