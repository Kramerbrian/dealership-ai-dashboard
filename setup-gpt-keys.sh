#!/bin/bash

# GPT Integration Keys Setup Script
# This script helps retrieve and configure all required keys for GPT-5 integration

echo "🔑 DealershipAI GPT Integration Keys Setup"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    print_error "Vercel CLI is not installed. Please install it first:"
    echo "npm i -g vercel@latest"
    exit 1
fi

# Check if user is logged in to Vercel
if ! vercel whoami &> /dev/null; then
    print_error "Not logged in to Vercel. Please run: vercel login"
    exit 1
fi

print_info "Retrieving environment variables from Vercel..."

# Create .env.local with GPT integration keys
cat > .env.local << 'EOF'
# DealershipAI GPT Integration Environment Variables
# Generated on $(date)

# ==========================================
# SUPABASE CONFIGURATION
# ==========================================
NEXT_PUBLIC_SUPABASE_URL=https://vxrdvkhkombwlhjvtsmw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4cmR2a2hrb21id2xoanZ0c213Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0NjgwMDQsImV4cCI6MjA3MTA0NDAwNH0.5GEWgoolAs5l1zd0ftOBG7MfYZ20sKuxcR-w93VeF7s
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4cmR2a2hrb21id2xoanZ0c213Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTQ2ODAwNCwiZXhwIjoyMDcxMDQ0MDA0fQ.lLQNZjVAWQ_DeObUYMzXL4cQ81_R6MnDzYPlqIIxoR0

# ==========================================
# CLERK AUTHENTICATION
# ==========================================
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_ZXhjaXRpbmctcXVhZ2dhLTY1LmNsZXJrLmFjY291bnRzLmRldiQ
CLERK_SECRET_KEY=sk_test_jmXcOugvAaWVPBeVaGkSC7AMkziSHBlYvNQwZmfiMa

# ==========================================
# GPT INTEGRATION
# ==========================================
# TODO: Add your OpenAI API key
OPENAI_API_KEY=sk-your-openai-key-here

# TODO: Generate a secure service token
GPT_SERVICE_TOKEN=your-secure-service-token-here

# ==========================================
# APPLICATION CONFIGURATION
# ==========================================
NEXT_PUBLIC_APP_URL=http://localhost:3001
NODE_ENV=development

# ==========================================
# VERCEL CONFIGURATION
# ==========================================
EOF

# Add Vercel OIDC token if it exists
if [ -f ".env.local.backup" ]; then
    VERCEL_TOKEN=$(grep "VERCEL_OIDC_TOKEN" .env.local.backup | cut -d'=' -f2)
    if [ ! -z "$VERCEL_TOKEN" ]; then
        echo "VERCEL_OIDC_TOKEN=$VERCEL_TOKEN" >> .env.local
    fi
fi

print_status "Created .env.local with base configuration"

# Generate a secure service token
SERVICE_TOKEN=$(openssl rand -hex 32)
print_info "Generated secure service token: $SERVICE_TOKEN"

# Update the service token in .env.local
sed -i.bak "s/your-secure-service-token-here/$SERVICE_TOKEN/" .env.local
rm .env.local.bak

print_status "Updated GPT_SERVICE_TOKEN in .env.local"

echo ""
echo "🔧 Next Steps:"
echo "=============="
echo ""
print_info "1. Add your OpenAI API key to .env.local:"
echo "   Replace 'sk-your-openai-key-here' with your actual OpenAI API key"
echo ""
print_info "2. Add the GPT_SERVICE_TOKEN to Vercel:"
echo "   vercel env add GPT_SERVICE_TOKEN"
echo "   Value: $SERVICE_TOKEN"
echo ""
print_info "3. Add OPENAI_API_KEY to Vercel:"
echo "   vercel env add OPENAI_API_KEY"
echo "   Value: your-actual-openai-key"
echo ""
print_info "4. Add NEXT_PUBLIC_APP_URL to Vercel:"
echo "   vercel env add NEXT_PUBLIC_APP_URL"
echo "   Value: https://your-domain.vercel.app"
echo ""

# Check if OpenAI API key is needed
if grep -q "sk-your-openai-key-here" .env.local; then
    print_warning "⚠️  You still need to add your OpenAI API key!"
    echo ""
    echo "Get your OpenAI API key from: https://platform.openai.com/api-keys"
    echo "Then update .env.local with your actual key"
fi

echo ""
print_info "📋 Current Environment Variables Status:"
echo "=============================================="

# Check each required variable
check_var() {
    local var_name=$1
    local var_value=$(grep "^$var_name=" .env.local | cut -d'=' -f2)
    
    if [ -z "$var_value" ] || [ "$var_value" = "your-actual-key-here" ] || [ "$var_value" = "sk-your-openai-key-here" ]; then
        echo -e "❌ $var_name: ${RED}Not configured${NC}"
    else
        echo -e "✅ $var_name: ${GREEN}Configured${NC}"
    fi
}

check_var "NEXT_PUBLIC_SUPABASE_URL"
check_var "NEXT_PUBLIC_SUPABASE_ANON_KEY"
check_var "SUPABASE_SERVICE_ROLE_KEY"
check_var "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"
check_var "CLERK_SECRET_KEY"
check_var "OPENAI_API_KEY"
check_var "GPT_SERVICE_TOKEN"
check_var "NEXT_PUBLIC_APP_URL"

echo ""
print_info "🚀 To complete the setup:"
echo "1. Update .env.local with your OpenAI API key"
echo "2. Add the missing variables to Vercel"
echo "3. Run: npm run dev"
echo "4. Test the GPT integration at: http://localhost:3001/dashboard"

print_status "Setup script completed!"
