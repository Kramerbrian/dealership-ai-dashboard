#!/bin/bash

# Check Redis Environment Variables
# Helps verify if Redis is configured for background jobs

echo "🔍 Checking Redis Configuration..."
echo ""

# Check local .env file
if [ -f .env ]; then
  echo "📁 Local .env file found"
  
  # Check for Upstash format (preferred)
  if grep -q "UPSTASH_REDIS_REST_URL" .env; then
    echo "✅ UPSTASH_REDIS_REST_URL found in .env"
    URL=$(grep "UPSTASH_REDIS_REST_URL" .env | cut -d '=' -f2- | tr -d '"' | tr -d "'" | tr -d ' ')
    if [ "$URL" != "your_redis_url_here" ] && [ ! -z "$URL" ]; then
      echo "   Value: ${URL:0:40}..." # Show first 40 chars
      echo "   ✅ Ready to copy to Vercel!"
    else
      echo "   ⚠️  Placeholder value detected - needs real URL"
    fi
  elif grep -q "REDIS_URL" .env; then
    echo "⚠️  Found REDIS_URL (not UPSTASH_REDIS_REST_URL)"
    URL=$(grep "^REDIS_URL" .env | cut -d '=' -f2- | tr -d '"' | tr -d "'" | tr -d ' ')
    if [ "$URL" != "your_redis_url_here" ] && [ ! -z "$URL" ]; then
      echo "   Value: ${URL:0:40}..."
      echo "   📝 Note: Rename to UPSTASH_REDIS_REST_URL for Vercel"
    else
      echo "   ⚠️  Placeholder value detected"
    fi
  else
    echo "❌ UPSTASH_REDIS_REST_URL not found in .env"
  fi
  
  if grep -q "UPSTASH_REDIS_REST_TOKEN" .env; then
    echo "✅ UPSTASH_REDIS_REST_TOKEN found in .env"
    TOKEN=$(grep "UPSTASH_REDIS_REST_TOKEN" .env | cut -d '=' -f2- | tr -d '"' | tr -d "'" | tr -d ' ')
    if [ "$TOKEN" != "your_redis_token_here" ] && [ ! -z "$TOKEN" ]; then
      echo "   Value: ${TOKEN:0:25}..." # Show first 25 chars
      echo "   ✅ Ready to copy to Vercel!"
    else
      echo "   ⚠️  Placeholder value detected - needs real token"
    fi
  elif grep -q "^REDIS_TOKEN" .env; then
    echo "⚠️  Found REDIS_TOKEN (not UPSTASH_REDIS_REST_TOKEN)"
    TOKEN=$(grep "^REDIS_TOKEN" .env | cut -d '=' -f2- | tr -d '"' | tr -d "'" | tr -d ' ')
    if [ "$TOKEN" != "your_redis_token_here" ] && [ ! -z "$TOKEN" ]; then
      echo "   Value: ${TOKEN:0:25}..."
      echo "   📝 Note: Rename to UPSTASH_REDIS_REST_TOKEN for Vercel"
    else
      echo "   ⚠️  Placeholder value detected"
    fi
  else
    echo "❌ UPSTASH_REDIS_REST_TOKEN not found in .env"
  fi
else
  echo "⚠️  .env file not found"
fi

echo ""
echo "📋 Vercel Environment Variables Needed:"
echo ""
echo "Add these to Vercel Dashboard → Settings → Environment Variables:"
echo ""
echo "UPSTASH_REDIS_REST_URL=<your-redis-url>"
echo "UPSTASH_REDIS_REST_TOKEN=<your-redis-token>"
echo ""
echo "📝 To extract from .env and add to Vercel:"
echo "   1. Run: npm run export:vercel-env"
echo "   2. Copy the Redis variables"
echo "   3. Add to Vercel Dashboard"
echo ""
echo "🔗 Quick Links:"
echo "   - Vercel Env Vars: https://vercel.com/YOUR_PROJECT/settings/environment-variables"
echo "   - Upstash Console: https://console.upstash.com/"
echo ""

