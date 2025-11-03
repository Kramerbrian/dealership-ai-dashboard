#!/bin/bash

# Check if SENTRY_DSN is set and compare with NEXT_PUBLIC_SENTRY_DSN

echo "🔍 Sentry DSN Checker"
echo "===================="
echo ""

# Load environment variables
if [ -f .env.local ]; then
  export $(grep -v '^#' .env.local | xargs)
fi

if [ -z "$NEXT_PUBLIC_SENTRY_DSN" ]; then
  echo "❌ NEXT_PUBLIC_SENTRY_DSN not found"
  exit 1
fi

echo "Current NEXT_PUBLIC_SENTRY_DSN:"
echo "$NEXT_PUBLIC_SENTRY_DSN"
echo ""

if [ -z "$SENTRY_DSN" ]; then
  echo "⚠️  SENTRY_DSN is NOT set"
  echo ""
  echo "📝 Recommendation:"
  echo "   In most cases, you can use the SAME value for SENTRY_DSN:"
  echo ""
  echo "   SENTRY_DSN=$NEXT_PUBLIC_SENTRY_DSN"
  echo ""
  echo "   However, check Sentry dashboard to confirm:"
  echo "   https://sentry.io/organizations/dealershipai/projects/javascript-nextjs/settings/keys/"
  echo ""
else
  echo "✅ SENTRY_DSN is set:"
  echo "$SENTRY_DSN"
  echo ""
  
  if [ "$SENTRY_DSN" = "$NEXT_PUBLIC_SENTRY_DSN" ]; then
    echo "✅ DSNs match (this is fine for most setups)"
  else
    echo "⚠️  DSNs are different (verify both are correct in Sentry dashboard)"
  fi
fi

echo ""
echo "📝 To add to Vercel:"
echo "   Key: SENTRY_DSN"
echo "   Value: $NEXT_PUBLIC_SENTRY_DSN"
echo "   (Or get server-side DSN from Sentry dashboard)"
echo ""

