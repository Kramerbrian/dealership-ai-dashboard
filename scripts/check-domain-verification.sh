#!/bin/bash

echo "🔍 Domain Verification Checker"
echo "================================"
echo ""

echo "📋 Current DNS Configuration:"
echo ""

echo "1️⃣ Checking nameservers for dealershipai.com..."
NS_RECORDS=$(dig +short NS dealershipai.com | tr '\n' ' ')
if [[ $NS_RECORDS == *"vercel-dns.com"* ]]; then
  echo "   ✅ Nameservers: $NS_RECORDS"
else
  echo "   ⚠️  Nameservers: $NS_RECORDS"
  echo "   Expected: ns1.vercel-dns.com, ns2.vercel-dns.com"
fi
echo ""

echo "2️⃣ Checking TXT verification record..."
TXT_RECORD=$(dig +short TXT _vercel.dealershipai.com)
if [ -z "$TXT_RECORD" ]; then
  echo "   ❌ No TXT record found at _vercel.dealershipai.com"
  echo "   Action needed: Add TXT record in Squarespace DNS"
else
  echo "   ✅ TXT record found: $TXT_RECORD"
fi
echo ""

echo "3️⃣ Checking subdomain CNAME..."
CNAME_RECORD=$(dig +short dash.dealershipai.com)
if [[ $CNAME_RECORD == *"vercel-dns.com"* ]]; then
  echo "   ✅ dash.dealershipai.com CNAME: $CNAME_RECORD"
else
  echo "   ⚠️  dash.dealershipai.com: $CNAME_RECORD"
fi
echo ""

echo "4️⃣ Checking domain resolution..."
A_RECORD=$(dig +short dealershipai.com A | head -1)
if [ -z "$A_RECORD" ]; then
  echo "   ⏳ dealershipai.com not resolving yet"
else
  echo "   ✅ dealershipai.com resolves to: $A_RECORD"
fi
echo ""

echo "================================"
echo ""

if [ -z "$TXT_RECORD" ]; then
  echo "📝 Next Steps:"
  echo ""
  echo "1. Get verification value from Vercel:"
  echo "   https://vercel.com/brian-kramers-projects/dealership-ai-dashboard/settings/domains"
  echo ""
  echo "2. Add TXT record in Squarespace DNS:"
  echo "   - Host: _vercel"
  echo "   - Type: TXT"
  echo "   - Value: (the verification string from Vercel)"
  echo ""
  echo "3. Run this script again in 5-10 minutes to check propagation"
  echo ""
else
  echo "✅ TXT record is live! Try adding the domain in Vercel now."
  echo ""
  echo "Run: npx vercel domains add dealershipai.com"
  echo ""
fi

echo "================================"
