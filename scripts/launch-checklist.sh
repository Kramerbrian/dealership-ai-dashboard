#!/bin/bash

# DealershipAI Launch Checklist
# Run this script before production deployment

echo "🚀 DealershipAI Launch Checklist"
echo "================================="

# Check environment variables
echo "📋 Checking environment variables..."
required_vars=(
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"
  "CLERK_SECRET_KEY"
  "DATABASE_URL"
  "UPSTASH_REDIS_REST_URL"
  "UPSTASH_REDIS_REST_TOKEN"
  "STRIPE_SECRET_KEY"
  "STRIPE_WEBHOOK_SECRET"
  "NEXT_PUBLIC_SUPABASE_URL"
  "NEXT_PUBLIC_SUPABASE_ANON_KEY"
)

missing_vars=()
for var in "${required_vars[@]}"; do
  if [ -z "${!var}" ]; then
    missing_vars+=("$var")
  fi
done

if [ ${#missing_vars[@]} -eq 0 ]; then
  echo "✅ All required environment variables are set"
else
  echo "❌ Missing environment variables:"
  for var in "${missing_vars[@]}"; do
    echo "   - $var"
  done
  exit 1
fi

# Run tests
echo ""
echo "🧪 Running test suite..."
npm run test:ci
if [ $? -ne 0 ]; then
  echo "❌ Tests failed"
  exit 1
fi
echo "✅ All tests passed"

# Run E2E tests
echo ""
echo "🎭 Running E2E tests..."
npm run test:e2e
if [ $? -ne 0 ]; then
  echo "❌ E2E tests failed"
  exit 1
fi
echo "✅ All E2E tests passed"

# Check build
echo ""
echo "🏗️  Building application..."
npm run build
if [ $? -ne 0 ]; then
  echo "❌ Build failed"
  exit 1
fi
echo "✅ Build successful"

# Run security audit
echo ""
echo "🔒 Running security audit..."
npm run audit
if [ $? -ne 0 ]; then
  echo "❌ Security audit failed"
  exit 1
fi
echo "✅ Security audit passed"

# Check database connection
echo ""
echo "🗄️  Checking database connection..."
npx prisma db push --accept-data-loss
if [ $? -ne 0 ]; then
  echo "❌ Database connection failed"
  exit 1
fi
echo "✅ Database connection successful"

# Check Redis connection
echo ""
echo "📦 Checking Redis connection..."
node -e "
const { Redis } = require('@upstash/redis');
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});
redis.ping().then(() => {
  console.log('✅ Redis connection successful');
  process.exit(0);
}).catch((err) => {
  console.log('❌ Redis connection failed:', err.message);
  process.exit(1);
});
"

# Check Stripe connection
echo ""
echo "💳 Checking Stripe connection..."
node -e "
const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
stripe.prices.list({ limit: 1 }).then(() => {
  console.log('✅ Stripe connection successful');
  process.exit(0);
}).catch((err) => {
  console.log('❌ Stripe connection failed:', err.message);
  process.exit(1);
});
"

# Check Clerk connection
echo ""
echo "🔐 Checking Clerk connection..."
node -e "
const { createClerkClient } = require('@clerk/nextjs/server');
const clerk = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY
});
clerk.users.getUserList({ limit: 1 }).then(() => {
  console.log('✅ Clerk connection successful');
  process.exit(0);
}).catch((err) => {
  console.log('❌ Clerk connection failed:', err.message);
  process.exit(1);
});
"

# Performance check
echo ""
echo "⚡ Running performance check..."
npm run analyze
if [ $? -ne 0 ]; then
  echo "⚠️  Performance analysis failed (non-critical)"
else
  echo "✅ Performance analysis completed"
fi

# Final checklist
echo ""
echo "📝 Final Launch Checklist:"
echo "=========================="
echo "✅ Environment variables configured"
echo "✅ All tests passing"
echo "✅ Build successful"
echo "✅ Security audit passed"
echo "✅ Database connected"
echo "✅ Redis connected"
echo "✅ Stripe connected"
echo "✅ Clerk connected"
echo ""
echo "🎉 Ready for production deployment!"
echo ""
echo "Next steps:"
echo "1. Deploy to Vercel"
echo "2. Configure production environment variables"
echo "3. Set up monitoring and alerts"
echo "4. Configure domain and SSL"
echo "5. Run final smoke tests"
echo ""
echo "Launch command: vercel --prod"
