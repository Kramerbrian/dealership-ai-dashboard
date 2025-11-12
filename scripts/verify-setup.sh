#!/bin/bash

# Quick verification script after adding SUPABASE_SERVICE_KEY

echo "🔍 Verifying Environment Setup"
echo "================================"
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
  echo "❌ .env.local not found"
  exit 1
fi

# Check required vars
echo "Checking required variables..."
echo ""

HAS_URL=$(grep -c "^SUPABASE_URL=" .env.local 2>/dev/null || echo "0")
HAS_KEY=$(grep -c "^SUPABASE_SERVICE_KEY=" .env.local 2>/dev/null || echo "0")

if [ "$HAS_URL" -gt 0 ]; then
  echo "✅ SUPABASE_URL is set"
else
  echo "❌ SUPABASE_URL is missing"
fi

if [ "$HAS_KEY" -gt 0 ]; then
  echo "✅ SUPABASE_SERVICE_KEY is set"
  KEY_LENGTH=$(grep "^SUPABASE_SERVICE_KEY=" .env.local | cut -d'=' -f2 | tr -d ' ' | wc -c)
  if [ "$KEY_LENGTH" -lt 50 ]; then
    echo "   ⚠️  Key seems short - make sure you copied the full service_role key"
  else
    echo "   ✅ Key length looks good"
  fi
else
  echo "❌ SUPABASE_SERVICE_KEY is missing"
  echo ""
  echo "   Add it to .env.local:"
  echo "   SUPABASE_SERVICE_KEY=your_service_role_key_here"
fi

echo ""
echo "Next steps:"
echo "1. If SUPABASE_SERVICE_KEY was just added, restart dev server:"
echo "   npm run dev"
echo ""
echo "2. Test the telemetry endpoint:"
echo "   curl -X POST http://localhost:3000/api/telemetry \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"type\":\"test\",\"payload\":{\"test\":true},\"ts\":1234567890}'"
echo ""
echo "3. Check admin setup:"
echo "   curl http://localhost:3000/api/admin/setup"
