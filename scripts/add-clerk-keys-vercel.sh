#!/bin/bash
# Add Clerk keys to Vercel using correct CLI syntax
# Usage: ./scripts/add-clerk-keys-vercel.sh

set -e

PUBLISHABLE_KEY="pk_live_Y2xlcmsuZGVhbGVyc2hpcGFpLmNvbSQ"
SECRET_KEY="sk_live_46lFcR07X8wbGi0k6nXBVTYUXaE5djeCsoqyuyiubl"

echo "🔐 Adding Clerk keys to Vercel..."
echo ""

# For Vercel CLI, we need to use echo to pipe the value
# Format: vercel env add <name> <target> <gitbranch>

echo "Adding NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY to production..."
echo "$PUBLISHABLE_KEY" | vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production

echo "Adding NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY to preview..."
echo "$PUBLISHABLE_KEY" | vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY preview

echo "Adding NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY to development..."
echo "$PUBLISHABLE_KEY" | vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY development

echo ""
echo "Adding CLERK_SECRET_KEY to production..."
echo "$SECRET_KEY" | vercel env add CLERK_SECRET_KEY production

echo "Adding CLERK_SECRET_KEY to preview..."
echo "$SECRET_KEY" | vercel env add CLERK_SECRET_KEY preview

echo "Adding CLERK_SECRET_KEY to development..."
echo "$SECRET_KEY" | vercel env add CLERK_SECRET_KEY development

echo ""
echo "✅ Done! Verify with: vercel env ls"

