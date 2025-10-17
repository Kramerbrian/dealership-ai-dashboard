#!/bin/bash

# Performance Budget Monitor - Quick Install Script
# This script installs dependencies and sets up the Performance Budget Monitor

set -e  # Exit on error

echo "🚀 Performance Budget Monitor - Installation"
echo "============================================"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
  echo "❌ Error: package.json not found"
  echo "Please run this script from your project root directory"
  exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
  echo "❌ Error: Node.js is not installed"
  echo "Please install Node.js from https://nodejs.org/"
  exit 1
fi

echo "✓ Found package.json"
echo "✓ Node.js version: $(node --version)"
echo ""

# Detect package manager
if [ -f "package-lock.json" ]; then
  PKG_MANAGER="npm"
  INSTALL_CMD="npm install"
elif [ -f "yarn.lock" ]; then
  PKG_MANAGER="yarn"
  INSTALL_CMD="yarn add"
elif [ -f "pnpm-lock.yaml" ]; then
  PKG_MANAGER="pnpm"
  INSTALL_CMD="pnpm add"
else
  PKG_MANAGER="npm"
  INSTALL_CMD="npm install"
fi

echo "📦 Detected package manager: $PKG_MANAGER"
echo ""

# Step 1: Install core dependencies
echo "Step 1/4: Installing core dependencies..."
echo "  - web-vitals@^4.2.4"
echo "  - swr@^2.2.5"
echo ""

$INSTALL_CMD web-vitals swr

echo "✓ Core dependencies installed"
echo ""

# Step 2: Optional dependencies
echo "Step 2/4: Optional dependencies"
echo ""

read -p "Install Vercel Analytics? (recommended) [y/N]: " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo "  Installing @vercel/analytics..."
  $INSTALL_CMD @vercel/analytics
  echo "✓ Vercel Analytics installed"
else
  echo "  Skipped Vercel Analytics"
fi
echo ""

read -p "Install Sentry Performance? [y/N]: " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo "  Installing @sentry/nextjs..."
  $INSTALL_CMD @sentry/nextjs
  echo "✓ Sentry installed"
else
  echo "  Skipped Sentry"
fi
echo ""

read -p "Install Redis client for caching? [y/N]: " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo "  Installing ioredis..."
  $INSTALL_CMD ioredis
  echo "✓ Redis client installed"
else
  echo "  Skipped Redis"
fi
echo ""

# Step 3: Verify files exist
echo "Step 3/4: Verifying files..."
echo ""

FILES=(
  "app/api/web-vitals/route.ts"
  "app/api/perf-fix/route.ts"
  "components/PerformanceBudgetMonitor.tsx"
  "components/PerfFixExecutor.tsx"
  "components/IntelligencePanel.tsx"
  "lib/web-vitals.ts"
)

MISSING_FILES=()

for FILE in "${FILES[@]}"; do
  if [ -f "$FILE" ]; then
    echo "  ✓ $FILE"
  else
    echo "  ✗ $FILE (missing)"
    MISSING_FILES+=("$FILE")
  fi
done

echo ""

if [ ${#MISSING_FILES[@]} -gt 0 ]; then
  echo "⚠️  Warning: Some files are missing"
  echo "Please ensure all component files are present"
  echo ""
else
  echo "✓ All files present"
  echo ""
fi

# Step 4: Instructions
echo "Step 4/4: Next steps"
echo ""
echo "✅ Installation complete!"
echo ""
echo "📝 To complete setup:"
echo ""
echo "1. Add Web Vitals tracking to your app/layout.tsx:"
echo ""
echo "   'use client';"
echo "   import { useEffect } from 'react';"
echo "   import { reportWebVitals } from '@/lib/web-vitals';"
echo ""
echo "   export default function RootLayout({ children }) {"
echo "     useEffect(() => {"
echo "       reportWebVitals();"
echo "     }, []);"
echo ""
echo "     return <html><body>{children}</body></html>;"
echo "   }"
echo ""
echo "2. Add IntelligencePanel to your dashboard:"
echo ""
echo "   import IntelligencePanel from '@/components/IntelligencePanel';"
echo ""
echo "   <div className=\"grid lg:grid-cols-[1fr_360px] gap-6\">"
echo "     <main>{/* Your content */}</main>"
echo "     <IntelligencePanel mode=\"full\" />"
echo "   </div>"
echo ""
echo "3. Start your dev server:"
echo ""
echo "   $PKG_MANAGER run dev"
echo ""
echo "4. Visit your dashboard and check the Performance panel"
echo ""
echo "📚 Documentation:"
echo "   - PERFORMANCE-BUDGET-INTEGRATION.md  (full guide)"
echo "   - PERFORMANCE-EXAMPLE.tsx            (code examples)"
echo "   - PERFORMANCE-DEPENDENCIES.md        (dependency info)"
echo "   - PERFORMANCE-ARCHITECTURE.md        (system design)"
echo ""
echo "🎉 Ready to ship!"
echo ""

# Optional: Create a reminder file
cat > PERFORMANCE-SETUP-TODO.md << 'EOF'
# Performance Budget Monitor - Setup Checklist

## Installation
- [x] Install dependencies (web-vitals, swr)
- [ ] Install optional dependencies (Vercel Analytics, Sentry, Redis)

## Integration
- [ ] Add Web Vitals tracking to app/layout.tsx
- [ ] Add IntelligencePanel to dashboard page
- [ ] Test components render correctly
- [ ] Verify API routes work

## Testing
- [ ] Run dev server and check for errors
- [ ] Navigate pages to generate Web Vitals
- [ ] Open dashboard and view Performance panel
- [ ] Test dry-run playbook execution
- [ ] Execute one playbook and verify

## Production
- [ ] Connect to real RUM service (Vercel Analytics/GA4)
- [ ] Set up database storage for metrics
- [ ] Configure alert webhooks (Slack/email)
- [ ] Enable API authentication
- [ ] Add rate limiting
- [ ] Set up monitoring dashboards

## Documentation
- [ ] Read PERFORMANCE-BUDGET-INTEGRATION.md
- [ ] Review PERFORMANCE-EXAMPLE.tsx
- [ ] Understand PERFORMANCE-ARCHITECTURE.md

---

**Delete this file when setup is complete**
EOF

echo "📄 Created PERFORMANCE-SETUP-TODO.md for tracking progress"
echo ""
echo "Happy coding! 🚀"
