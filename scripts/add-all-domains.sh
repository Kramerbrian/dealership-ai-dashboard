#!/bin/bash

echo "🌐 Adding All Domains to Vercel"
echo "================================"
echo ""

# Check if verification TXT record exists first
echo "Checking TXT verification record..."
TXT_RECORD=$(dig +short TXT _vercel.dealershipai.com)

if [ -z "$TXT_RECORD" ]; then
  echo "❌ ERROR: No TXT verification record found!"
  echo ""
  echo "You must add the TXT record first. Run:"
  echo "  ./scripts/check-domain-verification.sh"
  echo ""
  exit 1
fi

echo "✅ TXT record found: $TXT_RECORD"
echo ""

# Add primary domain
echo "1️⃣ Adding primary domain: dealershipai.com"
echo "   Running: npx vercel domains add dealershipai.com"
echo ""
npx vercel domains add dealershipai.com
echo ""

# Wait a moment
sleep 2

# Add www redirect
echo "2️⃣ Adding WWW domain: www.dealershipai.com"
echo "   Running: npx vercel domains add www.dealershipai.com"
echo "   Note: You'll need to configure redirect in dashboard"
echo ""
npx vercel domains add www.dealershipai.com
echo ""

# Wait a moment
sleep 2

# Add dashboard subdomain
echo "3️⃣ Adding dashboard subdomain: dash.dealershipai.com"
echo "   Running: npx vercel domains add dash.dealershipai.com"
echo ""
npx vercel domains add dash.dealershipai.com
echo ""

echo "================================"
echo ""
echo "✅ Domain addition complete!"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Check domain status:"
echo "   npx vercel domains ls"
echo ""
echo "2. Configure WWW redirect in dashboard:"
echo "   https://vercel.com/brian-kramers-projects/dealership-ai-dashboard/settings/domains"
echo ""
echo "3. Wait for SSL certificates (1-5 minutes per domain)"
echo ""
echo "4. Test all domains:"
echo "   curl -I https://dealershipai.com"
echo "   curl -I https://www.dealershipai.com"
echo "   curl -I https://dash.dealershipai.com"
echo ""
echo "================================"
