#!/bin/bash

# add-all-domains.sh
# Script to add all three DealershipAI domains to Vercel

echo "🌐 Adding all three domains to Vercel project..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Add main.dealershipai.com
echo -e "${BLUE}Adding main.dealershipai.com...${NC}"
vercel domains add main.dealershipai.com
echo ""

# Add marketing.dealershipai.com
echo -e "${BLUE}Adding marketing.dealershipai.com...${NC}"
vercel domains add marketing.dealershipai.com
echo ""

# Add dash.dealershipai.com
echo -e "${BLUE}Adding dash.dealershipai.com...${NC}"
vercel domains add dash.dealershipai.com
echo ""

echo -e "${GREEN}✅ All domains added to Vercel!${NC}"
echo ""
echo "📋 Next steps:"
echo "1. Go to your domain registrar"
echo "2. Add these 3 CNAME records:"
echo ""
echo "   Name: main"
echo "   Value: cname.vercel-dns.com"
echo ""
echo "   Name: marketing"
echo "   Value: cname.vercel-dns.com"
echo ""
echo "   Name: dash"
echo "   Value: cname.vercel-dns.com"
echo ""
echo "3. Wait 5-60 minutes for DNS propagation"
echo ""
echo "🔍 Check status with:"
echo "   vercel domains ls"
echo ""
echo "🧪 Test propagation at:"
echo "   https://dnschecker.org"
