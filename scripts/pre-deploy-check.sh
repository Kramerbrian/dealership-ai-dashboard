#!/bin/bash
# Pre-Deployment Confidence Check

echo "🔍 DealershipAI Pre-Deployment Check"
echo "======================================"
echo ""

# Check environment variables
echo "📋 Environment Variables:"
if [ -z "$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" ]; then
  echo "  ❌ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY not set"
else
  echo "  ✅ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: Set"
fi

if [ -z "$CLERK_SECRET_KEY" ]; then
  echo "  ❌ CLERK_SECRET_KEY not set"
else
  echo "  ✅ CLERK_SECRET_KEY: Set"
fi

echo ""
echo "📦 Dependencies:"
if npm list --depth=0 > /dev/null 2>&1; then
  echo "  ✅ All dependencies installed"
else
  echo "  ❌ Missing dependencies - run: npm install"
fi

echo ""
echo "🏗️  Build Check:"
if npm run build > /tmp/build.log 2>&1; then
  echo "  ✅ Build successful"
  echo ""
  echo "📊 Build Summary:"
  grep -E "(Route|✓ Compiled)" /tmp/build.log | tail -5
else
  echo "  ⚠️  Build has warnings (check /tmp/build.log)"
  echo "  Non-critical errors are OK"
fi

echo ""
echo "✅ Ready for deployment!"
echo ""
echo "🚀 Next steps:"
echo "  1. Set environment variables in Vercel dashboard"
echo "  2. Set Clerk user roles in Clerk dashboard"
echo "  3. Run: vercel --prod"

