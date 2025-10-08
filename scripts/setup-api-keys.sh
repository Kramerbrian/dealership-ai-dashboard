#!/bin/bash

# DealershipAI API Keys Setup Script
# This script helps you configure all the necessary API keys for the dashboard

set -e

echo "🚀 DealershipAI API Keys Setup"
echo "================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    print_info "Creating .env.local file from template..."
    cp env-template.txt .env.local
    print_status ".env.local created"
else
    print_warning ".env.local already exists. Backing up to .env.local.backup"
    cp .env.local .env.local.backup
fi

echo ""
echo "📋 API Keys Configuration Guide"
echo "================================"
echo ""

# Google Services
echo "🔵 GOOGLE SERVICES (Free tiers available)"
echo "----------------------------------------"
echo "1. Google Analytics Data API:"
echo "   • Go to: https://console.cloud.google.com"
echo "   • Enable: Google Analytics Data API"
echo "   • Create OAuth 2.0 credentials"
echo "   • Cost: Free (up to 200K requests/day)"
echo ""

echo "2. Google Business Profile API:"
echo "   • Go to: https://developers.google.com/my-business"
echo "   • Enable: My Business Business Information API"
echo "   • Cost: Free"
echo ""

echo "3. PageSpeed Insights API:"
echo "   • Go to: https://developers.google.com/speed/docs/insights/v5/get-started"
echo "   • Get API key from Google Cloud Console"
echo "   • Cost: Free (25K requests/day)"
echo ""

# SEO Tools
echo "🟡 SEO TOOLS (Paid)"
echo "-------------------"
echo "4. SEMrush API:"
echo "   • Go to: https://www.semrush.com/api-documentation/"
echo "   • Plans: \$99+/month"
echo "   • Alternative: Use Google Search Console (free)"
echo ""

echo "5. Ahrefs API (Alternative):"
echo "   • Go to: https://ahrefs.com/api"
echo "   • Plans: \$179+/month"
echo ""

# Review Platforms
echo "🟢 REVIEW PLATFORMS"
echo "-------------------"
echo "6. Yelp Fusion API:"
echo "   • Go to: https://www.yelp.com/developers"
echo "   • Cost: Free (5000 requests/day)"
echo ""

echo "7. Trustpilot API:"
echo "   • Go to: https://developers.trustpilot.com"
echo "   • Cost: Custom pricing"
echo ""

# AI Services
echo "🤖 AI SERVICES"
echo "--------------"
echo "8. OpenAI API:"
echo "   • Go to: https://platform.openai.com"
echo "   • Cost: Pay-per-use (~\$0.03 per 1K tokens)"
echo ""

echo "9. Anthropic API (Alternative):"
echo "   • Go to: https://console.anthropic.com"
echo "   • Cost: Pay-per-use"
echo ""

echo ""
echo "⚙️  CONFIGURATION STEPS"
echo "======================="
echo ""

# Interactive setup
read -p "Do you want to configure API keys interactively? (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    print_info "Starting interactive configuration..."
    echo ""
    
    # Google OAuth
    echo "🔵 Google OAuth Configuration"
    echo "-----------------------------"
    read -p "Enter Google Client ID: " GOOGLE_CLIENT_ID
    read -p "Enter Google Client Secret: " GOOGLE_CLIENT_SECRET
    read -p "Enter Google Analytics Property ID (optional): " GOOGLE_ANALYTICS_PROPERTY_ID
    read -p "Enter PageSpeed API Key: " PAGESPEED_API_KEY
    
    # SEO Tools
    echo ""
    echo "🟡 SEO Tools Configuration"
    echo "-------------------------"
    read -p "Enter SEMrush API Key (optional): " SEMRUSH_API_KEY
    read -p "Enter Ahrefs API Key (optional): " AHREFS_API_KEY
    
    # Review Platforms
    echo ""
    echo "🟢 Review Platforms Configuration"
    echo "--------------------------------"
    read -p "Enter Yelp API Key: " YELP_API_KEY
    read -p "Enter Yelp Business ID (optional): " YELP_BUSINESS_ID
    
    # AI Services
    echo ""
    echo "🤖 AI Services Configuration"
    echo "---------------------------"
    read -p "Enter OpenAI API Key: " OPENAI_API_KEY
    read -p "Enter Anthropic API Key (optional): " ANTHROPIC_API_KEY
    
    # Update .env.local
    print_info "Updating .env.local with your API keys..."
    
    # Use sed to update the .env.local file
    if [ ! -z "$GOOGLE_CLIENT_ID" ]; then
        sed -i.bak "s/your_google_client_id_here/$GOOGLE_CLIENT_ID/" .env.local
    fi
    
    if [ ! -z "$GOOGLE_CLIENT_SECRET" ]; then
        sed -i.bak "s/your_google_client_secret_here/$GOOGLE_CLIENT_SECRET/" .env.local
    fi
    
    if [ ! -z "$GOOGLE_ANALYTICS_PROPERTY_ID" ]; then
        sed -i.bak "s/123456789/$GOOGLE_ANALYTICS_PROPERTY_ID/" .env.local
    fi
    
    if [ ! -z "$PAGESPEED_API_KEY" ]; then
        sed -i.bak "s/your_pagespeed_api_key_here/$PAGESPEED_API_KEY/" .env.local
    fi
    
    if [ ! -z "$SEMRUSH_API_KEY" ]; then
        sed -i.bak "s/your_semrush_api_key_here/$SEMRUSH_API_KEY/" .env.local
    fi
    
    if [ ! -z "$AHREFS_API_KEY" ]; then
        sed -i.bak "s/your_ahrefs_api_key_here/$AHREFS_API_KEY/" .env.local
    fi
    
    if [ ! -z "$YELP_API_KEY" ]; then
        sed -i.bak "s/your_yelp_api_key_here/$YELP_API_KEY/" .env.local
    fi
    
    if [ ! -z "$YELP_BUSINESS_ID" ]; then
        sed -i.bak "s/your_yelp_business_id_here/$YELP_BUSINESS_ID/" .env.local
    fi
    
    if [ ! -z "$OPENAI_API_KEY" ]; then
        sed -i.bak "s/sk-your_openai_key_here/$OPENAI_API_KEY/" .env.local
    fi
    
    if [ ! -z "$ANTHROPIC_API_KEY" ]; then
        sed -i.bak "s/sk-ant-your_anthropic_key_here/$ANTHROPIC_API_KEY/" .env.local
    fi
    
    # Clean up backup files
    rm -f .env.local.bak
    
    print_status "API keys configured successfully!"
    
else
    print_info "Skipping interactive configuration."
    print_info "Please edit .env.local manually with your API keys."
fi

echo ""
echo "📊 COST ESTIMATES (Medium Dealership)"
echo "====================================="
echo "Service              Requests/Day    Cost/Month"
echo "-------------------------------------------------"
echo "Google Analytics     100             Free"
echo "PageSpeed            50              Free"
echo "Google Business      200             Free"
echo "SEMrush              100             \$99-199"
echo "Yelp                 50              Free"
echo "OpenAI (GPT-4)       20              ~\$15"
echo "-------------------------------------------------"
echo "Total:                               \$114-214/month"
echo ""

echo "💡 COST REDUCTION STRATEGIES"
echo "============================"
echo "• Aggressive Caching: Cache API responses for 5-15 minutes"
echo "• Smart Refresh: Only refresh visible tabs"
echo "• Free Alternatives: Use Google Search Console instead of SEMrush"
echo "• Batch API calls: Combine multiple requests"
echo ""

echo "🔧 NEXT STEPS"
echo "============="
echo "1. Start the development server: npm run dev"
echo "2. Open http://localhost:3000"
echo "3. Connect Google Services using the OAuth button"
echo "4. Run the API Integration Test Suite"
echo "5. Configure your dealership data"
echo ""

echo "🛡️  SECURITY NOTES"
echo "=================="
echo "• NEVER commit .env.local to version control"
echo "• Use environment variables in production"
echo "• Implement rate limiting"
echo "• Monitor API usage and costs"
echo "• Use HTTPS everywhere"
echo ""

print_status "Setup complete! Your DealershipAI dashboard is ready to use."
echo ""
echo "For support, visit: https://github.com/dealershipai/dashboard"
echo "Documentation: https://docs.dealershipai.com"
