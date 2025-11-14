#!/bin/bash
# Quick test script for Copilot Theme System

echo "🧪 Copilot Theme System - Quick Test"
echo "===================================="
echo ""

# Test 1: Automated script
echo "1️⃣ Running automated test script..."
npx tsx scripts/test-copilot-theme.ts
echo ""

# Test 2: Check dev server
echo "2️⃣ Checking dev server..."
if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
  echo "   ✅ Dev server is running"
  echo "   📍 Test page: http://localhost:3000/test/copilot-theme"
else
  echo "   ⚠️  Dev server not running. Start with: npm run dev"
fi
echo ""

# Test 3: Supabase CLI
echo "3️⃣ Checking Supabase CLI..."
if command -v supabase &> /dev/null; then
  VERSION=$(supabase --version | head -1)
  echo "   ✅ Supabase CLI installed: $VERSION"
  
  if supabase status &> /dev/null; then
    echo "   ✅ Linked to a Supabase project"
    supabase status 2>&1 | grep -E "(API URL|DB URL)" | head -2
  else
    echo "   ⚠️  Not linked to a project. Run: supabase link"
  fi
else
  echo "   ⚠️  Supabase CLI not installed"
fi
echo ""

echo "✅ Quick test complete!"
echo ""
echo "Next steps:"
echo "  • Visit http://localhost:3000/test/copilot-theme for interactive testing"
echo "  • Check /dash to see Copilot in the dashboard"
echo "  • Review docs/COPILOT_THEME_TESTING.md for full guide"

