#!/bin/bash

# DealershipAI Google APIs Setup Script
# This script helps you set up Google Analytics 4, Search Console, and PageSpeed Insights

echo "🚀 DealershipAI Google APIs Setup"
echo "=================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}📋 Prerequisites:${NC}"
echo "1. Google account with access to Google Cloud Console"
echo "2. Domain you want to analyze (e.g., dealershipai.com)"
echo "3. Vercel CLI installed and logged in"
echo ""

read -p "Press Enter to continue..."

echo -e "${YELLOW}🔧 Step 1: Google Analytics 4 Setup${NC}"
echo "=================================="
echo ""
echo "1. Go to: https://analytics.google.com/"
echo "2. Create a new GA4 property for your domain"
echo "3. Note your Property ID (format: 123456789)"
echo ""

read -p "Enter your GA4 Property ID: " GA4_PROPERTY_ID

if [ -z "$GA4_PROPERTY_ID" ]; then
    echo -e "${RED}❌ Property ID is required${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}🔧 Step 2: Google Cloud Console Setup${NC}"
echo "====================================="
echo ""
echo "1. Go to: https://console.cloud.google.com/"
echo "2. Create a new project or select existing one"
echo "3. Enable these APIs:"
echo "   - Google Analytics Data API"
echo "   - Google Search Console API"
echo "   - PageSpeed Insights API"
echo ""

read -p "Press Enter after enabling the APIs..."

echo ""
echo -e "${YELLOW}🔧 Step 3: Service Account Setup${NC}"
echo "================================="
echo ""
echo "1. Go to: IAM & Admin → Service Accounts"
echo "2. Click 'Create Service Account'"
echo "3. Name: 'dealershipai-analytics'"
echo "4. Description: 'Service account for DealershipAI analytics'"
echo "5. Click 'Create and Continue'"
echo "6. Grant these roles:"
echo "   - Viewer (for basic access)"
echo "7. Click 'Done'"
echo "8. Click on the created service account"
echo "9. Go to 'Keys' tab"
echo "10. Click 'Add Key' → 'Create new key' → 'JSON'"
echo "11. Download the JSON file"
echo ""

read -p "Press Enter after creating the service account and downloading the JSON file..."

echo ""
echo -e "${YELLOW}🔧 Step 4: Grant Permissions${NC}"
echo "============================="
echo ""
echo "1. Google Search Console:"
echo "   - Go to: https://search.google.com/search-console/"
echo "   - Add your domain as a property"
echo "   - Go to Settings → Users and permissions"
echo "   - Add your service account email with 'Full' access"
echo ""
echo "2. Google Analytics:"
echo "   - Go to: https://analytics.google.com/"
echo "   - Select your property"
echo "   - Go to Admin → Property → Property access management"
echo "   - Add your service account email with 'Viewer' role"
echo ""

read -p "Press Enter after granting permissions..."

echo ""
echo -e "${YELLOW}🔧 Step 5: PageSpeed Insights API Key${NC}"
echo "====================================="
echo ""
echo "1. Go to: https://console.cloud.google.com/apis/credentials"
echo "2. Click 'Create Credentials' → 'API Key'"
echo "3. Copy the API key"
echo "4. (Optional) Restrict the key to PageSpeed Insights API"
echo ""

read -p "Enter your PageSpeed Insights API Key: " PAGESPEED_API_KEY

if [ -z "$PAGESPEED_API_KEY" ]; then
    echo -e "${RED}❌ API Key is required${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}🔧 Step 6: Service Account Credentials${NC}"
echo "====================================="
echo ""
echo "Please paste the contents of your service account JSON file:"
echo "(Copy the entire JSON content and paste it here, then press Ctrl+D)"
echo ""

# Read multiline input
SERVICE_ACCOUNT_JSON=""
while IFS= read -r line; do
    SERVICE_ACCOUNT_JSON+="$line"$'\n'
done

if [ -z "$SERVICE_ACCOUNT_JSON" ]; then
    echo -e "${RED}❌ Service account JSON is required${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ All credentials collected!${NC}"
echo ""

# Add environment variables to Vercel
echo -e "${YELLOW}🔧 Step 7: Adding Environment Variables to Vercel${NC}"
echo "=================================================="
echo ""

echo "Adding GA4_PROPERTY_ID..."
echo "$GA4_PROPERTY_ID" | vercel env add GA4_PROPERTY_ID production

echo ""
echo "Adding GOOGLE_ANALYTICS_CREDENTIALS..."
echo "$SERVICE_ACCOUNT_JSON" | vercel env add GOOGLE_ANALYTICS_CREDENTIALS production

echo ""
echo "Adding PAGESPEED_INSIGHTS_API_KEY..."
echo "$PAGESPEED_API_KEY" | vercel env add PAGESPEED_INSIGHTS_API_KEY production

echo ""
echo -e "${GREEN}✅ Environment variables added to Vercel!${NC}"
echo ""

# Redeploy
echo -e "${YELLOW}🔧 Step 8: Redeploying with New Environment Variables${NC}"
echo "======================================================="
echo ""

echo "Redeploying to production..."
vercel --prod

echo ""
echo -e "${GREEN}🎉 Google APIs Setup Complete!${NC}"
echo "=================================="
echo ""
echo -e "${BLUE}📊 What's Now Available:${NC}"
echo "✅ Real Google Analytics 4 data"
echo "✅ Real Google Search Console data"
echo "✅ Real PageSpeed Insights data"
echo "✅ Calculated SEO, AEO, GEO scores"
echo ""
echo -e "${BLUE}🧪 Test Your Setup:${NC}"
echo "Run: node test-real-data.js"
echo ""
echo -e "${BLUE}🔗 Your Dashboard:${NC}"
echo "https://dealershipai-dashboard-a1ysrowu0-brian-kramers-projects.vercel.app"
echo ""
echo -e "${GREEN}🚀 Your DealershipAI dashboard now provides real, actionable insights!${NC}"
