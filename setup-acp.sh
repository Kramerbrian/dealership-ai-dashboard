#!/bin/bash

# ACP Setup Script
# This script helps you set up the Agentic Commerce Protocol integration

set -e

echo "🚀 DealershipAI - Agentic Commerce Protocol Setup"
echo "=================================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ Error: .env file not found${NC}"
    echo "Creating .env from template..."
    cp .env.example .env 2>/dev/null || touch .env
fi

echo -e "${YELLOW}📋 Checking prerequisites...${NC}"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo "Please install Node.js >= 18.0.0 from https://nodejs.org/"
    exit 1
else
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✅ Node.js ${NODE_VERSION} installed${NC}"
fi

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
else
    NPM_VERSION=$(npm -v)
    echo -e "${GREEN}✅ npm ${NPM_VERSION} installed${NC}"
fi

echo ""
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
npm install

echo ""
echo -e "${YELLOW}⚙️  Configuration Setup${NC}"
echo "========================================"
echo ""

# Function to check if env var is set
check_env_var() {
    local var_name=$1
    local var_value=$(grep "^${var_name}=" .env | cut -d '=' -f2)

    if [ -z "$var_value" ] || [ "$var_value" = "your_key_here" ] || [ "$var_value" = "sk_test_..." ]; then
        return 1
    else
        return 0
    fi
}

# Check required environment variables
REQUIRED_VARS=(
    "STRIPE_SECRET_KEY"
    "STRIPE_PUBLISHABLE_KEY"
    "SUPABASE_URL"
    "SUPABASE_ANON_KEY"
    "SUPABASE_SERVICE_KEY"
)

MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
    if check_env_var "$var"; then
        echo -e "${GREEN}✅ ${var} configured${NC}"
    else
        echo -e "${RED}❌ ${var} not configured${NC}"
        MISSING_VARS+=("$var")
    fi
done

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
    echo ""
    echo -e "${YELLOW}⚠️  Missing configuration variables:${NC}"
    for var in "${MISSING_VARS[@]}"; do
        echo "   - $var"
    done
    echo ""
    echo "Please update your .env file with the required values."
    echo "See .env.example for reference."
    echo ""
    read -p "Do you want to configure them now? (y/n) " -n 1 -r
    echo ""

    if [[ $REPLY =~ ^[Yy]$ ]]; then
        for var in "${MISSING_VARS[@]}"; do
            echo ""
            case $var in
                "STRIPE_SECRET_KEY")
                    echo "Get your Stripe secret key from: https://dashboard.stripe.com/apikeys"
                    read -p "Enter STRIPE_SECRET_KEY: " value
                    ;;
                "STRIPE_PUBLISHABLE_KEY")
                    echo "Get your Stripe publishable key from: https://dashboard.stripe.com/apikeys"
                    read -p "Enter STRIPE_PUBLISHABLE_KEY: " value
                    ;;
                "SUPABASE_URL")
                    echo "Get your Supabase URL from: https://app.supabase.com/project/_/settings/api"
                    read -p "Enter SUPABASE_URL: " value
                    ;;
                "SUPABASE_ANON_KEY")
                    echo "Get your Supabase anon key from: https://app.supabase.com/project/_/settings/api"
                    read -p "Enter SUPABASE_ANON_KEY: " value
                    ;;
                "SUPABASE_SERVICE_KEY")
                    echo "Get your Supabase service key from: https://app.supabase.com/project/_/settings/api"
                    read -p "Enter SUPABASE_SERVICE_KEY: " value
                    ;;
            esac

            if [ ! -z "$value" ]; then
                # Update or add to .env
                if grep -q "^${var}=" .env; then
                    # Update existing
                    sed -i.bak "s|^${var}=.*|${var}=${value}|" .env
                else
                    # Add new
                    echo "${var}=${value}" >> .env
                fi
                echo -e "${GREEN}✅ ${var} saved${NC}"
            fi
        done

        # Clean up backup files
        rm -f .env.bak
    fi
fi

echo ""
echo -e "${YELLOW}🗄️  Database Setup${NC}"
echo "========================================"
echo ""
echo "You need to run the SQL schema files in your Supabase SQL Editor:"
echo ""
echo "1. Go to: https://app.supabase.com/project/_/sql/new"
echo "2. Run the following files in order:"
echo ""
echo -e "   ${GREEN}a)${NC} lib/acp-database-schema.sql"
echo -e "   ${GREEN}b)${NC} lib/acp-monitoring-schema.sql"
echo ""
read -p "Press Enter when you've completed the database setup..."

echo ""
echo -e "${YELLOW}💳 Stripe Product Setup${NC}"
echo "========================================"
echo ""
echo "You need to create products in Stripe Dashboard:"
echo ""
echo "1. Go to: https://dashboard.stripe.com/products"
echo "2. Create two products:"
echo ""
echo "   Product 1: DealershipAI Pro Tier"
echo "   - Price: \$599/month"
echo "   - Billing: Recurring monthly"
echo ""
echo "   Product 2: DealershipAI Premium+ Tier"
echo "   - Price: \$999/month"
echo "   - Billing: Recurring monthly"
echo ""
echo "3. Copy the Price IDs and add them to your .env:"
echo "   STRIPE_PRICE_ID_PRO_MONTHLY=price_..."
echo "   STRIPE_PRICE_ID_PREMIUM_MONTHLY=price_..."
echo ""
read -p "Press Enter when you've created the Stripe products..."

echo ""
echo -e "${YELLOW}🔧 Frontend Configuration${NC}"
echo "========================================"
echo ""
echo "Update the Stripe publishable key in acp-chat-interface.html:"
echo ""

if check_env_var "STRIPE_PUBLISHABLE_KEY"; then
    STRIPE_PK=$(grep "^STRIPE_PUBLISHABLE_KEY=" .env | cut -d '=' -f2)
    echo "Replace line 316 with:"
    echo -e "${GREEN}const stripe = Stripe('${STRIPE_PK}');${NC}"
    echo ""

    # Try to automatically update the file
    if [ -f "acp-chat-interface.html" ]; then
        sed -i.bak "s|const stripe = Stripe('pk_test_YOUR_PUBLISHABLE_KEY');|const stripe = Stripe('${STRIPE_PK}');|" acp-chat-interface.html
        rm -f acp-chat-interface.html.bak
        echo -e "${GREEN}✅ Automatically updated acp-chat-interface.html${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Configure STRIPE_PUBLISHABLE_KEY first${NC}"
fi

echo ""
echo -e "${YELLOW}🧪 Running Tests${NC}"
echo "========================================"
echo ""
echo "Testing server startup..."

# Test that api-server.js exists
if [ ! -f "api-server.js" ]; then
    echo -e "${RED}❌ api-server.js not found${NC}"
    exit 1
fi

# Check if required API files exist
REQUIRED_FILES=(
    "api/acp-checkout.js"
    "lib/acp-monitoring.js"
    "lib/stripe.js"
    "lib/supabase.js"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ ${file} exists${NC}"
    else
        echo -e "${RED}❌ ${file} missing${NC}"
        exit 1
    fi
done

echo ""
echo -e "${GREEN}🎉 Setup Complete!${NC}"
echo "========================================"
echo ""
echo "Next steps:"
echo ""
echo "1. Start the development server:"
echo -e "   ${GREEN}npm run dev${NC}"
echo ""
echo "2. Access the conversational shopping interface:"
echo -e "   ${GREEN}http://localhost:3001/acp-chat-interface.html${NC}"
echo ""
echo "3. Test the API endpoints:"
echo -e "   ${GREEN}curl -X POST http://localhost:3001/api/acp-checkout/checkout_sessions \\${NC}"
echo -e "   ${GREEN}  -H 'Content-Type: application/json' \\${NC}"
echo -e "   ${GREEN}  -d '{\"buyer\":{\"email\":\"test@example.com\"},\"items\":[{\"product_id\":\"pro\",\"quantity\":1}]}'${NC}"
echo ""
echo "4. Read the full documentation:"
echo -e "   ${GREEN}ACP_IMPLEMENTATION_GUIDE.md${NC}"
echo ""
echo "For support, visit: https://github.com/dealershipai/support"
echo ""

# Ask if user wants to start the server
read -p "Would you like to start the development server now? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo -e "${GREEN}🚀 Starting server...${NC}"
    echo ""
    npm run dev || node api-server.js
fi
