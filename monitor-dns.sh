#!/bin/bash
echo "Monitoring DNS for dash.dealershipai.com..."
echo "Press Ctrl+C to stop"
echo ""
while true; do
  echo "=== $(date '+%H:%M:%S') ==="
  CNAME=$(dig dash.dealershipai.com CNAME +short)
  if [ -n "$CNAME" ]; then
    echo "✅ CNAME FOUND: $CNAME"
    echo "🎉 DNS is configured! You can now add to Vercel:"
    echo "   npx vercel domains add dash.dealershipai.com"
    break
  else
    echo "⏳ CNAME not found yet... (A records: $(dig dash.dealershipai.com A +short | head -1))"
  fi
  sleep 60
done
