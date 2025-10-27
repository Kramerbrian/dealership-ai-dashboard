#!/bin/bash

# DealershipAI Production Setup Script
echo "🚀 DealershipAI Production Setup"
echo "================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
  echo "❌ Not in project root directory"
  exit 1
fi

echo "✅ In project root directory"

# Check if Vercel CLI is installed
echo ""
echo "📋 Checking Vercel CLI..."
if ! command -v vercel &> /dev/null; then
  echo "Installing Vercel CLI..."
  npm install -g vercel
fi
echo "✅ Vercel CLI available"

# Check if user is logged in to Vercel
echo ""
echo "🔐 Checking Vercel authentication..."
if ! vercel whoami &> /dev/null; then
  echo "❌ Not logged in to Vercel. Please run: vercel login"
  exit 1
fi
echo "✅ Authenticated with Vercel"

# Check if Prisma is available
echo ""
echo "🗄️  Checking Prisma..."
if ! command -v prisma &> /dev/null; then
  echo "Installing Prisma CLI..."
  npm install -g prisma
fi
echo "✅ Prisma CLI available"

# Create environment variables template
echo ""
echo "📝 Creating environment variables template..."
cat > .env.production.template << 'EOF'
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...

# Database
DATABASE_URL=postgresql://username:password@host:5432/database_name

# Redis (Upstash)
UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-redis-token

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_PRO=price_...
STRIPE_PRICE_ENTERPRISE=price_...

# Optional Services
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SENTRY_DSN=https://your-sentry-dsn
NEXT_PUBLIC_GA_ID=G-...
EOF

echo "✅ Environment template created: .env.production.template"

# Create database setup script
echo ""
echo "🗄️  Creating database setup script..."
cat > scripts/setup-database.sh << 'EOF'
#!/bin/bash

echo "🗄️  Setting up database..."

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Push schema to database
echo "Pushing schema to database..."
npx prisma db push

# Optional: Seed database
echo "Seeding database..."
npm run db:seed

echo "✅ Database setup complete"
EOF

chmod +x scripts/setup-database.sh
echo "✅ Database setup script created"

# Create testing script
echo ""
echo "🧪 Creating testing script..."
cat > scripts/test-production.sh << 'EOF'
#!/bin/bash

echo "🧪 Testing production setup..."

# Test build
echo "Testing build..."
npm run build
if [ $? -ne 0 ]; then
  echo "❌ Build failed"
  exit 1
fi
echo "✅ Build successful"

# Test database connection
echo "Testing database connection..."
npx prisma db pull
if [ $? -ne 0 ]; then
  echo "❌ Database connection failed"
  exit 1
fi
echo "✅ Database connection successful"

# Test Redis connection (if configured)
if [ ! -z "$UPSTASH_REDIS_REST_URL" ]; then
  echo "Testing Redis connection..."
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
fi

echo "✅ All tests passed"
EOF

chmod +x scripts/test-production.sh
echo "✅ Testing script created"

# Create deployment script
echo ""
echo "🚀 Creating deployment script..."
cat > scripts/deploy-production.sh << 'EOF'
#!/bin/bash

echo "🚀 Deploying to production..."

# Build the project
echo "Building project..."
NODE_OPTIONS="--max-old-space-size=4096" npm run build
if [ $? -ne 0 ]; then
  echo "❌ Build failed"
  exit 1
fi

# Deploy to Vercel
echo "Deploying to Vercel..."
vercel --prod --yes
if [ $? -ne 0 ]; then
  echo "❌ Deployment failed"
  exit 1
fi

echo "✅ Deployment successful!"
echo ""
echo "Next steps:"
echo "1. Set up environment variables in Vercel dashboard"
echo "2. Configure custom domain"
echo "3. Set up external services"
echo "4. Run database migrations"
echo "5. Test the deployed application"
EOF

chmod +x scripts/deploy-production.sh
echo "✅ Deployment script created"

# Summary
echo ""
echo "📊 Production Setup Summary:"
echo "============================"
echo "✅ Vercel CLI configured"
echo "✅ Prisma CLI available"
echo "✅ Environment template created"
echo "✅ Database setup script created"
echo "✅ Testing script created"
echo "✅ Deployment script created"
echo ""
echo "Next steps:"
echo "1. Copy .env.production.template to .env.local"
echo "2. Fill in your environment variables"
echo "3. Run: ./scripts/setup-database.sh"
echo "4. Run: ./scripts/test-production.sh"
echo "5. Run: ./scripts/deploy-production.sh"
echo ""
echo "For detailed instructions, see: PRODUCTION_SETUP.md"
