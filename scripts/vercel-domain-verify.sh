#!/bin/bash

# Vercel Domain Verification Script
# Uses Vercel CLI to verify domain ownership

set -e

DOMAIN="dealershipai.com"
PROJECT_NAME="dealership-ai-dashboard"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 Vercel Domain Verification"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Domain: $DOMAIN"
echo "Project: $PROJECT_NAME"
echo ""

# Check if Vercel CLI is available
if ! command -v vercel &> /dev/null && ! command -v npx &> /dev/null; then
    echo "❌ Vercel CLI not found"
    echo "   Install with: npm install -g vercel"
    echo "   Or use: npx vercel"
    exit 1
fi

# Check if logged in
echo "📋 Step 1: Checking Vercel authentication..."
if npx vercel whoami &> /dev/null; then
    USER=$(npx vercel whoami 2>/dev/null | head -1)
    echo "   ✅ Logged in as: $USER"
else
    echo "   ❌ Not logged in"
    echo "   Run: npx vercel login"
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Step 2: Attempting to add domain..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Try to add domain - this will show verification instructions if needed
echo "Attempting to add domain to Vercel..."
echo ""

# Capture output - try adding to team first, then to project
OUTPUT=$(npx vercel domains add "$DOMAIN" 2>&1 || true)

# If that fails, try with project
if echo "$OUTPUT" | grep -qi "expects\|argument"; then
    OUTPUT=$(npx vercel domains add "$DOMAIN" "$PROJECT_NAME" 2>&1 || true)
fi

# Check if we got verification instructions
if echo "$OUTPUT" | grep -qi "verification\|TXT\|_vercel"; then
    echo "✅ Verification instructions found:"
    echo ""
    echo "$OUTPUT" | grep -A 10 -i "verification\|TXT\|_vercel" || echo "$OUTPUT"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📝 Next Steps:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "1. Copy the TXT record value from above"
    echo "2. Add TXT record to your DNS provider:"
    echo "   Type: TXT"
    echo "   Name: _vercel"
    echo "   Value: [from Vercel output above]"
    echo ""
    echo "3. Wait 5-30 minutes for DNS propagation"
    echo ""
    echo "4. Run this script again to verify:"
    echo "   ./scripts/vercel-domain-verify.sh"
    echo ""
elif echo "$OUTPUT" | grep -qi "403\|not authorized\|linked to another"; then
    echo "⚠️  Domain is linked to another account"
    echo ""
    echo "Vercel CLI output:"
    echo "$OUTPUT"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🔧 Solution: Use Vercel Dashboard"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "The CLI cannot get verification codes for domains"
    echo "linked to other accounts. Use the dashboard instead:"
    echo ""
    echo "1. Go to: https://vercel.com/dashboard"
    echo "2. Navigate to: Settings → Domains"
    echo "3. Click 'Add Domain' → Enter: $DOMAIN"
    echo "4. Vercel will show verification instructions"
    echo "5. Add the TXT record to your DNS"
    echo ""
elif echo "$OUTPUT" | grep -qi "already exists\|already added"; then
    echo "✅ Domain already added to your account!"
    echo ""
    echo "Checking domain status..."
    npx vercel domains inspect "$DOMAIN" 2>&1 || echo "   Domain is configured"
else
    echo "Output from Vercel CLI:"
    echo "$OUTPUT"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

