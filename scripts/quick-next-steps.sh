#!/bin/bash
# Quick Next Steps Checklist
# Run this script to see what needs to be done next

echo "📋 DealershipAI Next Steps Checklist"
echo "===================================="
echo ""

# Check Next.js version
echo "🔍 Next.js Status:"
CURRENT=$(grep '"next":' package.json | sed 's/.*"next": "\([^"]*\)".*/\1/')
LATEST=$(npm view next version 2>/dev/null || echo "unknown")
echo "  Current: $CURRENT"
echo "  Latest: $LATEST"
if [ "$CURRENT" != "$LATEST" ]; then
  echo "  ⚠️  Update available"
else
  echo "  ✅ Up to date"
fi
echo ""

# Check endpoint migration
echo "🔒 Endpoint Migration:"
MIGRATED=$(find app/api -name "route.ts" -exec grep -l "createAdminRoute\|createPublicRoute\|createAuthRoute" {} \; 2>/dev/null | wc -l | tr -d ' ')
TOTAL=$(find app/api -name "route.ts" 2>/dev/null | wc -l | tr -d ' ')
if [ "$TOTAL" -gt 0 ]; then
  PERCENT=$((MIGRATED * 100 / TOTAL))
  echo "  Migrated: $MIGRATED/$TOTAL ($PERCENT%)"
  if [ "$PERCENT" -lt 80 ]; then
    echo "  ⚠️  Need to migrate more endpoints"
  else
    echo "  ✅ Good progress"
  fi
else
  echo "  ⚠️  No endpoints found"
fi
echo ""

# Check environment variables
echo "🔑 Environment Variables:"
if [ -f .env.local ]; then
  echo "  ✅ .env.local exists"
else
  echo "  ⚠️  .env.local missing"
fi

MISSING=0
[ -z "$UPSTASH_REDIS_REST_URL" ] && MISSING=$((MISSING + 1))
[ -z "$SUPABASE_URL" ] && MISSING=$((MISSING + 1))
[ -z "$STRIPE_SECRET_KEY" ] && MISSING=$((MISSING + 1))

if [ "$MISSING" -gt 0 ]; then
  echo "  ⚠️  $MISSING critical env vars missing"
else
  echo "  ✅ Critical env vars set"
fi
echo ""

# Check build status
echo "🏗️  Build Status:"
if npm run build > /dev/null 2>&1; then
  echo "  ✅ Build passes"
else
  echo "  ⚠️  Build has errors"
fi
echo ""

# Summary
echo "📊 Summary:"
echo "  Infrastructure: ✅ Complete"
echo "  Security: ⚠️  In Progress (55%)"
echo "  Deployment: ⚠️  Blocked by Next.js bug"
echo "  Monitoring: ✅ Ready"
echo ""
echo "🎯 Next Actions:"
echo "  1. Resolve Next.js deployment blocker"
echo "  2. Continue endpoint migration"
echo "  3. Complete core integrations"
echo ""

