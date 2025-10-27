#!/bin/bash

echo "🚀 Starting 100% Production Build Process..."

# 1. Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf .next
rm -rf out
rm -rf dist

# 2. Install dependencies
echo "📦 Installing dependencies..."
npm ci --production=false

# 3. Type check
echo "🔍 Running type check..."
npm run type-check

# 4. Lint and fix
echo "🔧 Running linter..."
npm run lint:fix

# 5. Build for production
echo "🏗️ Building for production..."
NODE_ENV=production npm run build

# 6. Verify build
echo "✅ Verifying build..."
if [ -d ".next" ]; then
  echo "✅ Build successful - .next directory created"
else
  echo "❌ Build failed - .next directory not found"
  exit 1
fi

# 7. Check bundle size
echo "📊 Checking bundle size..."
if command -v npx &> /dev/null; then
  npx @next/bundle-analyzer .next/static/chunks/*.js 2>/dev/null || echo "Bundle analyzer not available"
fi

echo "🎉 Production build completed successfully!"
echo "📋 Next steps:"
echo "1. Test the build locally: npm start"
echo "2. Deploy to Vercel: vercel --prod"
echo "3. Configure production environment variables"
echo "4. Set up custom domain: dealershipai.com"
