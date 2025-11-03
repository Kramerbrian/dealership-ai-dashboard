#!/bin/bash

# Production Setup Script
# This script helps set up the production environment

set -e

echo "🚀 DealershipAI Production Setup"
echo "=================================="
echo ""

# Check if .env.production exists
if [ ! -f .env.production ]; then
  echo "📝 Creating .env.production from template..."
  cp .env.production.example .env.production
  echo "✅ Created .env.production"
  echo "⚠️  Please fill in all required values in .env.production"
  echo ""
else
  echo "✅ .env.production already exists"
  echo ""
fi

# Generate Prisma Client
echo "🔧 Generating Prisma Client..."
npx prisma generate
echo "✅ Prisma Client generated"
echo ""

# Check database connection
echo "🔍 Checking database connection..."
if npx prisma db push --dry-run > /dev/null 2>&1; then
  echo "✅ Database connection verified"
else
  echo "⚠️  Database connection failed. Please check your DATABASE_URL"
fi
echo ""

# Build the application
echo "🏗️  Building production bundle..."
npm run build
echo ""

if [ $? -eq 0 ]; then
  echo "✅ Build completed successfully!"
  echo ""
  echo "📋 Next steps:"
  echo "  1. Review .env.production and fill in all required values"
  echo "  2. Run database migrations: npm run db:migrate"
  echo "  3. Test production build: npm run start"
  echo "  4. Deploy to your hosting platform"
else
  echo "❌ Build failed. Please fix errors before deploying."
  exit 1
fi

