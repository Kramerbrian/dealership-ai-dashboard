#!/bin/bash

# Domain Verification Helper Script
# Helps verify dealershipai.com ownership with Vercel

set -e

DOMAIN="dealershipai.com"
TXT_RECORD_NAME="_vercel"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 Domain Verification Helper"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Domain: $DOMAIN"
echo "TXT Record: $TXT_RECORD_NAME"
echo ""

# Check if domain is already verified
echo "📋 Step 1: Check current DNS records..."
echo ""
echo "Checking for existing TXT record:"
dig TXT ${TXT_RECORD_NAME}.${DOMAIN} +short || echo "  ⚠️  No TXT record found"
echo ""

# Instructions
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📝 Instructions:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Go to Vercel Dashboard:"
echo "   https://vercel.com/dashboard"
echo ""
echo "2. Navigate to: Your Project → Settings → Domains"
echo ""
echo "3. Click 'Add Domain' and enter: $DOMAIN"
echo ""
echo "4. Vercel will provide a verification code"
echo ""
echo "5. Add this TXT record to your DNS provider:"
echo "   Type: TXT"
echo "   Name: $TXT_RECORD_NAME"
echo "   Value: [verification code from Vercel]"
echo "   TTL: 3600"
echo ""
echo "6. Wait 5-30 minutes for DNS propagation"
echo ""
echo "7. Run this script again to verify:"
echo "   ./scripts/verify-domain-ownership.sh"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if dig is available
if ! command -v dig &> /dev/null; then
    echo "⚠️  'dig' command not found. Install with:"
    echo "   macOS: brew install bind"
    echo "   Linux: sudo apt-get install dnsutils"
    echo ""
    exit 0
fi

# Verify TXT record
echo "🔍 Verifying TXT record..."
TXT_VALUE=$(dig TXT ${TXT_RECORD_NAME}.${DOMAIN} +short 2>/dev/null | tr -d '"' || echo "")

# Expected verification code
EXPECTED_CODE="vc-domain-verify=dealershipai.com,b6d0acdf14a0e0348f56"

if [ -z "$TXT_VALUE" ]; then
    echo "  ❌ TXT record not found"
    echo "  📝 Add the TXT record to your DNS provider:"
    echo "     Type: TXT"
    echo "     Name: _vercel"
    echo "     Value: $EXPECTED_CODE"
elif echo "$TXT_VALUE" | grep -q "vc-domain-verify=dealershipai.com,b6d0acdf14a0e0348f56"; then
    echo "  ✅ TXT record found and matches verification code!"
    echo "     $TXT_VALUE"
    echo ""
    echo "  ✅ Go to Vercel dashboard and click 'Verify'"
    echo "     https://vercel.com/brian-kramer-dealershipai/dealership-ai-dashboard/settings/domains"
else
    echo "  ⚠️  TXT record found but doesn't match expected code:"
    echo "     Found: $TXT_VALUE"
    echo "     Expected: $EXPECTED_CODE"
    echo ""
    echo "  📝 Update the TXT record value to match"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"


