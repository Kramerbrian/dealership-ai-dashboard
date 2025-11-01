#!/bin/bash
echo "Checking DNS propagation for dash.dealershipai.com..."
echo ""
echo "CNAME check:"
dig dash.dealershipai.com CNAME +short
echo ""
echo "A records (should be empty or Vercel IPs):"
dig dash.dealershipai.com A +short
echo ""
echo "Full DNS query:"
dig dash.dealershipai.com ANY +noall +answer
