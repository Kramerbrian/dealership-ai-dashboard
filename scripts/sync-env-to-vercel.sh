#!/bin/bash
# Sync .env.local to Vercel Environment Variables

echo "🔄 Syncing .env.local to Vercel..."
echo ""

if [ ! -f .env.local ]; then
  echo "❌ .env.local not found"
  exit 1
fi

# Load .env.local
export $(grep -v '^#' .env.local | xargs)

# Required Clerk variables
if [ -z "$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" ] || [ -z "$CLERK_SECRET_KEY" ]; then
  echo "❌ Clerk keys not found in .env.local"
  echo "   Make sure NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY are set"
  exit 1
fi

echo "📤 Uploading to Vercel..."

# Detect vercel command (use npx if not in PATH)
VERCEL_CMD="vercel"
if ! command -v vercel &> /dev/null && command -v npx &> /dev/null; then
  VERCEL_CMD="npx vercel"
fi

# Sync all variables from .env.local
$VERCEL_CMD env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production <<< "$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" 2>/dev/null || \
  ($VERCEL_CMD env rm NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production --yes 2>/dev/null && \
   echo "$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" | $VERCEL_CMD env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production)

vercel env add CLERK_SECRET_KEY production <<< "$CLERK_SECRET_KEY" 2>/dev/null || \
  vercel env rm CLERK_SECRET_KEY production --yes 2>/dev/null && \
  vercel env add CLERK_SECRET_KEY production <<< "$CLERK_SECRET_KEY"

# Optional variables
echo ""
echo "📤 Syncing optional variables..."

if [ ! -z "$FLEET_API_BASE" ]; then
  echo "$FLEET_API_BASE" | $VERCEL_CMD env add FLEET_API_BASE production 2>/dev/null || \
    ($VERCEL_CMD env rm FLEET_API_BASE production --yes 2>/dev/null && \
     echo "$FLEET_API_BASE" | $VERCEL_CMD env add FLEET_API_BASE production)
  echo "  ✅ FLEET_API_BASE"
fi

if [ ! -z "$X_API_KEY" ]; then
  echo "$X_API_KEY" | $VERCEL_CMD env add X_API_KEY production 2>/dev/null || \
    ($VERCEL_CMD env rm X_API_KEY production --yes 2>/dev/null && \
     echo "$X_API_KEY" | $VERCEL_CMD env add X_API_KEY production)
  echo "  ✅ X_API_KEY"
fi

if [ ! -z "$DEFAULT_TENANT" ]; then
  echo "$DEFAULT_TENANT" | $VERCEL_CMD env add DEFAULT_TENANT production 2>/dev/null || \
    ($VERCEL_CMD env rm DEFAULT_TENANT production --yes 2>/dev/null && \
     echo "$DEFAULT_TENANT" | $VERCEL_CMD env add DEFAULT_TENANT production)
  echo "  ✅ DEFAULT_TENANT"
fi

if [ ! -z "$UPSTASH_REDIS_REST_URL" ]; then
  echo "$UPSTASH_REDIS_REST_URL" | $VERCEL_CMD env add UPSTASH_REDIS_REST_URL production 2>/dev/null || \
    ($VERCEL_CMD env rm UPSTASH_REDIS_REST_URL production --yes 2>/dev/null && \
     echo "$UPSTASH_REDIS_REST_URL" | $VERCEL_CMD env add UPSTASH_REDIS_REST_URL production)
  echo "  ✅ UPSTASH_REDIS_REST_URL"
fi

if [ ! -z "$UPSTASH_REDIS_REST_TOKEN" ]; then
  echo "$UPSTASH_REDIS_REST_TOKEN" | $VERCEL_CMD env add UPSTASH_REDIS_REST_TOKEN production 2>/dev/null || \
    ($VERCEL_CMD env rm UPSTASH_REDIS_REST_TOKEN production --yes 2>/dev/null && \
     echo "$UPSTASH_REDIS_REST_TOKEN" | $VERCEL_CMD env add UPSTASH_REDIS_REST_TOKEN production)
  echo "  ✅ UPSTASH_REDIS_REST_TOKEN"
fi

echo ""
echo "✅ Environment variables synced to Vercel!"
echo ""
echo "📋 Manual sync (if needed):"
echo "   vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production"
echo "   vercel env add CLERK_SECRET_KEY production"

