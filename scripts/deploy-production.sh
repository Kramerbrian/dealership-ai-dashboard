#!/bin/bash
# Production Deployment Script

set -e

echo "🚀 Starting production deployment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
  echo "❌ Error: package.json not found. Are you in the project root?"
  exit 1
fi

# Build the project
echo "📦 Building project..."
npm run build

if [ $? -ne 0 ]; then
  echo "❌ Build failed. Please fix errors before deploying."
  exit 1
fi

echo "✅ Build successful!"

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
  echo "📦 Installing Vercel CLI..."
  npm install -g vercel
fi

# Deploy to production
echo "🚀 Deploying to production..."
vercel --prod

echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Verify deployment in Vercel dashboard"
echo "2. Test production URL"
echo "3. Check function logs for any errors"
echo "4. Verify environment variables are set"
