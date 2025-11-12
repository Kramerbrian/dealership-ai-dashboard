#!/bin/bash
set -e

echo "🚀 DealershipAI - Complete Domain Setup"
echo "========================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "This script will help you complete the domain setup."
echo ""

# Step 1: Check if verification token is provided
echo "📋 Step 1: Get Verification Token"
echo "-----------------------------------"
echo ""
echo "1. Open this URL in your browser:"
echo "   ${YELLOW}https://vercel.com/brian-kramer-dealershipai/dealership-ai-dashboard/settings/domains${NC}"
echo ""
echo "2. Click 'Add Domain' and enter: ${YELLOW}dealershipai.com${NC}"
echo ""
echo "3. Vercel will show a verification token that looks like:"
echo "   ${YELLOW}vc-domain-verify=dealershipai.com,abc123...${NC}"
echo ""
read -p "Press Enter once you have the verification token ready..."
echo ""

# Step 2: Get the token from user
echo "📝 Step 2: Enter Verification Token"
echo "------------------------------------"
echo ""
read -p "Paste your verification token here: " VERIFY_TOKEN
echo ""

if [ -z "$VERIFY_TOKEN" ]; then
  echo "${RED}❌ Error: No token provided${NC}"
  exit 1
fi

echo "${GREEN}✅ Token received${NC}"
echo ""

# Step 3: Instructions for Squarespace
echo "🌐 Step 3: Add TXT Record to Squarespace DNS"
echo "----------------------------------------------"
echo ""
echo "Now add this TXT record in Squarespace:"
echo ""
echo "  ${GREEN}Go to:${NC} https://account.squarespace.com/domains"
echo "  ${GREEN}Click:${NC} dealershipai.com → Advanced Settings → DNS"
echo ""
echo "  ${GREEN}Add TXT Record:${NC}"
echo "    Type:  ${YELLOW}TXT${NC}"
echo "    Host:  ${YELLOW}_vercel${NC}"
echo "    Value: ${YELLOW}${VERIFY_TOKEN}${NC}"
echo "    TTL:   ${YELLOW}3600${NC} (or default)"
echo ""
read -p "Press Enter once you've added the TXT record in Squarespace..."
echo ""

# Step 4: Wait for DNS propagation
echo "⏳ Step 4: Waiting for DNS Propagation"
echo "---------------------------------------"
echo ""
echo "Checking TXT record every 30 seconds..."
echo "(This usually takes 5-15 minutes)"
echo ""

MAX_ATTEMPTS=30
ATTEMPT=0

while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
  ATTEMPT=$((ATTEMPT + 1))
  echo "Attempt $ATTEMPT/$MAX_ATTEMPTS..."
  
  TXT_RECORD=$(dig +short TXT _vercel.dealershipai.com)
  
  if [ ! -z "$TXT_RECORD" ]; then
    echo ""
    echo "${GREEN}✅ TXT record found!${NC}"
    echo "   Value: $TXT_RECORD"
    echo ""
    break
  fi
  
  if [ $ATTEMPT -lt $MAX_ATTEMPTS ]; then
    echo "   Not found yet, waiting 30 seconds..."
    sleep 30
  fi
done

if [ -z "$TXT_RECORD" ]; then
  echo ""
  echo "${YELLOW}⚠️  TXT record not detected after 15 minutes${NC}"
  echo "This doesn't mean it failed - DNS can take up to 48 hours"
  echo ""
  read -p "Do you want to continue anyway? (y/n): " CONTINUE
  if [ "$CONTINUE" != "y" ]; then
    echo "Run this script again later when DNS has propagated"
    exit 0
  fi
fi

# Step 5: Add domains via CLI
echo ""
echo "🎯 Step 5: Adding Domains to Vercel"
echo "------------------------------------"
echo ""

echo "Adding dealershipai.com..."
if npx vercel domains add dealershipai.com 2>&1; then
  echo "${GREEN}✅ dealershipai.com added${NC}"
else
  echo "${RED}❌ Failed to add dealershipai.com${NC}"
  echo "You may need to add it manually in the dashboard"
fi
echo ""

sleep 2

echo "Adding www.dealershipai.com..."
if npx vercel domains add www.dealershipai.com 2>&1; then
  echo "${GREEN}✅ www.dealershipai.com added${NC}"
else
  echo "${YELLOW}⚠️  www.dealershipai.com might need manual configuration${NC}"
fi
echo ""

sleep 2

echo "Adding dash.dealershipai.com..."
if npx vercel domains add dash.dealershipai.com 2>&1; then
  echo "${GREEN}✅ dash.dealershipai.com added${NC}"
else
  echo "${YELLOW}⚠️  dash.dealershipai.com might need manual configuration${NC}"
fi
echo ""

# Step 6: Check domain status
echo ""
echo "📊 Step 6: Current Domain Status"
echo "---------------------------------"
echo ""
npx vercel domains ls
echo ""

# Step 7: Wait for SSL
echo ""
echo "🔐 Step 7: SSL Certificates"
echo "---------------------------"
echo ""
echo "Vercel is now provisioning SSL certificates..."
echo "This takes 1-5 minutes per domain"
echo ""
read -p "Press Enter to check certificate status..."
echo ""

npx vercel certs ls 2>&1 || echo "Certificate info will be available shortly"
echo ""

# Step 8: Instructions for WWW redirect
echo ""
echo "🔄 Step 8: Configure WWW Redirect"
echo "----------------------------------"
echo ""
echo "To set up the WWW redirect:"
echo ""
echo "1. Go to: ${YELLOW}https://vercel.com/brian-kramer-dealershipai/dealership-ai-dashboard/settings/domains${NC}"
echo "2. Find ${YELLOW}www.dealershipai.com${NC}"
echo "3. Click 'Edit' or gear icon"
echo "4. Select 'Redirect to another domain'"
echo "5. Enter: ${YELLOW}dealershipai.com${NC}"
echo "6. Check 'Permanent (308)'"
echo "7. Save"
echo ""
read -p "Press Enter once you've configured the redirect..."
echo ""

# Step 9: Test everything
echo ""
echo "✅ Step 9: Testing Deployment"
echo "-----------------------------"
echo ""

echo "Testing dealershipai.com..."
sleep 2
if curl -sI https://dealershipai.com | head -1 | grep -q "200\|301\|302\|308"; then
  echo "${GREEN}✅ dealershipai.com is live!${NC}"
else
  echo "${YELLOW}⚠️  dealershipai.com - SSL may still be provisioning${NC}"
fi

echo ""
echo "Testing www.dealershipai.com..."
sleep 2
if curl -sI https://www.dealershipai.com | head -1 | grep -q "308"; then
  echo "${GREEN}✅ www.dealershipai.com redirecting properly!${NC}"
else
  echo "${YELLOW}⚠️  www.dealershipai.com - redirect may need configuration${NC}"
fi

echo ""
echo "Testing dash.dealershipai.com..."
sleep 2
if curl -sI https://dash.dealershipai.com | head -1 | grep -q "200\|301\|302"; then
  echo "${GREEN}✅ dash.dealershipai.com is live!${NC}"
else
  echo "${YELLOW}⚠️  dash.dealershipai.com - SSL may still be provisioning${NC}"
fi

echo ""
echo "Testing API health..."
if curl -s https://dealershipai.com/api/health | grep -q "healthy"; then
  echo "${GREEN}✅ API is healthy!${NC}"
else
  echo "${YELLOW}⚠️  API - may still be initializing${NC}"
fi

echo ""
echo "========================================"
echo ""
echo "${GREEN}🎉 Domain Setup Complete!${NC}"
echo ""
echo "Your DealershipAI platform is now live at:"
echo "  • ${GREEN}https://dealershipai.com${NC}"
echo "  • ${GREEN}https://dash.dealershipai.com${NC}"
echo ""
echo "If any domains show warnings, wait 5-10 minutes for SSL"
echo "certificates to fully provision, then test again:"
echo ""
echo "  ${YELLOW}curl -I https://dealershipai.com${NC}"
echo "  ${YELLOW}curl -I https://dash.dealershipai.com${NC}"
echo "  ${YELLOW}curl https://dealershipai.com/api/health${NC}"
echo ""
echo "========================================"
