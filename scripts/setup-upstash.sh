#!/bin/bash

# Upstash Redis Setup Script
echo "🔴 Setting up Upstash Redis..."

# Check if user is logged in
echo "📋 Checking Upstash authentication..."
if ! npx @upstash/cli auth whoami &> /dev/null; then
  echo "❌ Not logged in to Upstash. Please run:"
  echo "   npx @upstash/cli auth login"
  echo ""
  echo "Then run this script again."
  exit 1
fi

echo "✅ Authenticated with Upstash"

# List available regions
echo ""
echo "🌍 Available regions:"
npx @upstash/cli redis list-regions

# Create Redis database
echo ""
echo "🔴 Creating Redis database..."
echo "Creating database: dealershipai-redis"
npx @upstash/cli redis create --name dealershipai-redis --region us-east-1

# List databases to get the ID
echo ""
echo "📋 Your Redis databases:"
npx @upstash/cli redis list

echo ""
echo "✅ Redis database created!"
echo ""
echo "Next steps:"
echo "1. Copy the REST URL and token from the output above"
echo "2. Update Vercel environment variables:"
echo "   npx vercel env rm UPSTASH_REDIS_REST_URL production"
echo "   npx vercel env add UPSTASH_REDIS_REST_URL production"
echo "   npx vercel env rm UPSTASH_REDIS_REST_TOKEN production"
echo "   npx vercel env add UPSTASH_REDIS_REST_TOKEN production"
echo ""
echo "3. Test the connection:"
echo "   npx @upstash/cli redis connect [database-id]"
