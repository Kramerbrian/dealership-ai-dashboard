#!/bin/bash

# Connect API Keys Script
# Uses MCPs and CLIs to configure all API keys for DealershipAI

set -e

echo "🔑 DealershipAI API Keys Configuration"
echo "========================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check for required tools
check_tool() {
    if ! command -v $1 &> /dev/null; then
        echo -e "${RED}❌ $1 not found${NC}"
        echo "   Please install: $2"
        return 1
    else
        echo -e "${GREEN}✅ $1 found${NC}"
        return 0
    fi
}

echo "Checking required tools..."
check_tool "vercel" "npm i -g vercel" || exit 1
check_tool "supabase" "brew install supabase/tap/supabase" || echo -e "${YELLOW}⚠️  Supabase CLI optional${NC}"
echo ""

# Get project info
if [ -f ".vercel/project.json" ]; then
    PROJECT_ID=$(cat .vercel/project.json | grep -o '"projectId":"[^"]*' | cut -d'"' -f4)
    ORG_ID=$(cat .vercel/project.json | grep -o '"orgId":"[^"]*' | cut -d'"' -f4)
    echo -e "${GREEN}✅ Found Vercel project: $PROJECT_ID${NC}"
else
    echo -e "${YELLOW}⚠️  No Vercel project found. Run 'vercel link' first${NC}"
fi

# Function to set Vercel env var
set_vercel_env() {
    local key=$1
    local value=$2
    local env=${3:-production}
    
    if [ -z "$PROJECT_ID" ]; then
        echo -e "${YELLOW}⚠️  Skipping $key (no project ID)${NC}"
        return
    fi
    
    echo "Setting $key for $env..."
    vercel env add "$key" "$env" <<< "$value" 2>/dev/null || \
    vercel env rm "$key" "$env" --yes 2>/dev/null && \
    vercel env add "$key" "$env" <<< "$value"
    echo -e "${GREEN}✅ Set $key${NC}"
}

# Function to prompt for API key
prompt_key() {
    local key=$1
    local description=$2
    local current_value=$(grep "^$key=" .env.local 2>/dev/null | cut -d'=' -f2 | tr -d '"' || echo "")
    
    if [ -n "$current_value" ] && [ "$current_value" != "your-$key-here" ]; then
        echo -e "${GREEN}✅ $key already set${NC}"
        read -p "Update? (y/N): " update
        if [ "$update" != "y" ]; then
            return
        fi
    fi
    
    echo ""
    echo -e "${YELLOW}📝 $description${NC}"
    read -p "Enter $key: " value
    
    if [ -n "$value" ]; then
        # Update .env.local
        if grep -q "^$key=" .env.local 2>/dev/null; then
            sed -i.bak "s|^$key=.*|$key=\"$value\"|" .env.local
        else
            echo "$key=\"$value\"" >> .env.local
        fi
        
        # Set in Vercel
        read -p "Set in Vercel? (Y/n): " set_vercel
        if [ "$set_vercel" != "n" ]; then
            set_vercel_env "$key" "$value"
        fi
        
        echo -e "${GREEN}✅ Configured $key${NC}"
    fi
}

# Create .env.local if it doesn't exist
if [ ! -f ".env.local" ]; then
    echo "Creating .env.local from env.example..."
    cp env.example .env.local
fi

echo ""
echo "=========================================="
echo "API Keys Configuration"
echo "=========================================="
echo ""

# Slack Webhook
prompt_key "TELEMETRY_WEBHOOK" "Slack webhook URL for alerts (https://hooks.slack.com/services/...)"

# Stripe Keys
echo ""
echo -e "${YELLOW}💳 Stripe Configuration${NC}"
prompt_key "STRIPE_SECRET_KEY" "Stripe Secret Key (sk_live_... or sk_test_...)"
prompt_key "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY" "Stripe Publishable Key (pk_live_... or pk_test_...)"
prompt_key "STRIPE_WEBHOOK_SECRET" "Stripe Webhook Secret (whsec_...)"

# Cron Secret
echo ""
echo -e "${YELLOW}⏰ Cron Configuration${NC}"
if ! grep -q "^CRON_SECRET=" .env.local 2>/dev/null || grep -q "^CRON_SECRET=.*your.*" .env.local 2>/dev/null; then
    CRON_SECRET=$(openssl rand -hex 32)
    echo "CRON_SECRET=\"$CRON_SECRET\"" >> .env.local
    echo -e "${GREEN}✅ Generated CRON_SECRET${NC}"
    set_vercel_env "CRON_SECRET" "$CRON_SECRET"
fi

# Sentry
echo ""
echo -e "${YELLOW}🐛 Sentry Configuration${NC}"
prompt_key "SENTRY_DSN" "Sentry DSN for error tracking"

# Model Registry
echo ""
echo -e "${YELLOW}🤖 Model Registry${NC}"
if ! grep -q "^MODEL_REGISTRY_VERSION=" .env.local 2>/dev/null; then
    echo "MODEL_REGISTRY_VERSION=\"1.0.0\"" >> .env.local
    echo -e "${GREEN}✅ Set MODEL_REGISTRY_VERSION${NC}"
fi

# API URL
if ! grep -q "^NEXT_PUBLIC_API_URL=" .env.local 2>/dev/null; then
    echo "NEXT_PUBLIC_API_URL=\"https://dash.dealershipai.com\"" >> .env.local
    echo -e "${GREEN}✅ Set NEXT_PUBLIC_API_URL${NC}"
fi

echo ""
echo "=========================================="
echo -e "${GREEN}✅ Configuration Complete!${NC}"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Review .env.local"
echo "2. Test API connections"
echo "3. Deploy to Vercel: vercel --prod"
echo ""

