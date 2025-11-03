#!/bin/bash

# Production Verification Script
# Runs all checks to ensure production readiness

set -e

echo "🔍 Production Readiness Verification"
echo "===================================="
echo ""

ERRORS=0
WARNINGS=0

# Check 1: Environment variables
echo "1️⃣  Checking environment variables..."
if [ -f .env.production ]; then
  echo "   ✅ .env.production exists"
  
  REQUIRED_VARS=(
    "DATABASE_URL"
    "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"
    "CLERK_SECRET_KEY"
    "NEXTAUTH_SECRET"
  )
  
  MISSING_VARS=()
  for var in "${REQUIRED_VARS[@]}"; do
    if ! grep -q "^${var}=" .env.production 2>/dev/null; then
      MISSING_VARS+=("$var")
    fi
  done
  
  if [ ${#MISSING_VARS[@]} -eq 0 ]; then
    echo "   ✅ All required variables present"
  else
    echo "   ⚠️  Missing variables: ${MISSING_VARS[*]}"
    ((WARNINGS++))
  fi
else
  echo "   ❌ .env.production not found"
  ((ERRORS++))
fi
echo ""

# Check 2: Database connection
echo "2️⃣  Checking database connection..."
if npx prisma db push --dry-run > /dev/null 2>&1; then
  echo "   ✅ Database connection successful"
else
  echo "   ❌ Database connection failed"
  ((ERRORS++))
fi
echo ""

# Check 3: Build
echo "3️⃣  Checking production build..."
if npm run build > /tmp/build.log 2>&1; then
  echo "   ✅ Build completed successfully"
else
  echo "   ❌ Build failed. Check /tmp/build.log for details"
  ((ERRORS++))
fi
echo ""

# Check 4: Type checking
echo "4️⃣  Checking TypeScript types..."
if npm run type-check > /tmp/typecheck.log 2>&1; then
  echo "   ✅ Type checking passed"
else
  echo "   ⚠️  Type errors found (non-blocking). Check /tmp/typecheck.log"
  ((WARNINGS++))
fi
echo ""

# Check 5: Dependencies
echo "5️⃣  Checking dependencies..."
if [ -f package-lock.json ]; then
  echo "   ✅ Dependencies locked"
else
  echo "   ⚠️  No package-lock.json found"
  ((WARNINGS++))
fi
echo ""

# Summary
echo "===================================="
echo "📊 Summary:"
echo "   Errors: $ERRORS"
echo "   Warnings: $WARNINGS"
echo ""

if [ $ERRORS -eq 0 ]; then
  echo "✅ Ready for production deployment!"
  exit 0
else
  echo "❌ Please fix errors before deploying"
  exit 1
fi

