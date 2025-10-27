#!/bin/bash

# DealershipAI Roadmap Setup Script
# Follows the 12-week implementation plan

echo "🚀 DealershipAI Roadmap Setup"
echo "=============================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

echo "✅ Project directory confirmed"

# 1. Install additional dependencies
echo "📦 Installing additional dependencies..."

npm install @tanstack/react-query @reduxjs/toolkit react-redux zustand
npm install axios date-fns zod
npm install @testing-library/jest-dom @testing-library/react @testing-library/user-event
npm install jest jest-environment-jsdom babel-jest

echo "✅ Dependencies installed"

# 2. Set up environment variables template
echo "🔧 Creating environment variables template..."

cat > .env.example << 'EOF'
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/dealershipai"

# Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

# Redis
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."

# Stripe
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# AI APIs
OPENAI_API_KEY="sk-..."
ANTHROPIC_API_KEY="sk-ant-..."
PERPLEXITY_API_KEY="pplx-..."

# Google APIs
GOOGLE_MY_BUSINESS_API_KEY="..."
GOOGLE_PLACES_API_KEY="..."
GOOGLE_SEARCH_CONSOLE_KEY="..."

# Review APIs
DEALERRATER_API_KEY="..."
CARS_API_KEY="..."
YELP_API_KEY="..."

# Other
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="http://localhost:3000"
EOF

echo "✅ Environment template created"

# 3. Create database setup script
echo "🗄️ Creating database setup script..."

cat > scripts/setup-database.sh << 'EOF'
#!/bin/bash

echo "Setting up DealershipAI database..."

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed initial data
npx prisma db seed

echo "✅ Database setup complete"
EOF

chmod +x scripts/setup-database.sh

echo "✅ Database setup script created"

# 4. Create testing setup
echo "🧪 Setting up testing framework..."

cat > jest.config.js << 'EOF'
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testEnvironment: 'jest-environment-jsdom',
}

module.exports = createJestConfig(customJestConfig)
EOF

cat > jest.setup.js << 'EOF'
import '@testing-library/jest-dom'
EOF

echo "✅ Testing framework configured"

# 5. Create development scripts
echo "⚙️ Creating development scripts..."

cat > scripts/dev-setup.sh << 'EOF'
#!/bin/bash

echo "🚀 DealershipAI Development Setup"
echo "================================="

# Start Redis (if using local)
# redis-server &

# Start database
# docker-compose up -d

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# Start development server
npm run dev
EOF

chmod +x scripts/dev-setup.sh

echo "✅ Development scripts created"

# 6. Create deployment script
echo "🚀 Creating deployment script..."

cat > scripts/deploy.sh << 'EOF'
#!/bin/bash

echo "🚀 Deploying DealershipAI to Vercel"
echo "===================================="

# Build the application
npm run build

# Deploy to Vercel
vercel deploy --prod

echo "✅ Deployment complete"
EOF

chmod +x scripts/deploy.sh

echo "✅ Deployment script created"

# 7. Create README for roadmap
echo "📚 Creating roadmap documentation..."

cat > ROADMAP_IMPLEMENTATION.md << 'EOF'
# DealershipAI Implementation Roadmap

## 🎯 12-Week Production Plan

### Week 1-2: Foundation ✅
- [x] Database schema (15 tables)
- [x] Authentication (Clerk)
- [x] Redis caching
- [x] Core libraries

### Week 3-4: QAI Algorithm ✅
- [x] PIQR calculation
- [x] HRP calculation  
- [x] VAI calculation
- [x] OCI calculation
- [x] Master QAI algorithm

### Week 5-6: Dashboard UI
- [ ] Component system
- [ ] Executive summary tab
- [ ] 5 pillars deep dive
- [ ] Competitive intelligence
- [ ] Quick wins
- [ ] Mystery shop (Enterprise)

### Week 7-8: Tier System
- [ ] Feature gating
- [ ] Stripe integration
- [ ] Session tracking
- [ ] Upgrade prompts

### Week 9-10: Actions & Automation
- [ ] Pro features (schema generation, review drafting)
- [ ] Enterprise features (auto-inject, auto-respond)
- [ ] Mystery shop automation

### Week 11: PLG & Landing
- [ ] Landing page
- [ ] Free report page
- [ ] Onboarding flow
- [ ] Email sequences

### Week 12: Launch Prep
- [ ] Testing suite
- [ ] Performance optimization
- [ ] Security audit
- [ ] Production deployment

## 🚀 Quick Start

1. **Environment Setup**
   ```bash
   cp .env.example .env.local
   # Fill in your API keys
   ```

2. **Database Setup**
   ```bash
   ./scripts/setup-database.sh
   ```

3. **Development**
   ```bash
   ./scripts/dev-setup.sh
   ```

4. **Deploy**
   ```bash
   ./scripts/deploy.sh
   ```

## 📊 Success Metrics

### Week 12 Targets
- [ ] 10 beta customers
- [ ] $0 MRR (all free tier)
- [ ] 90%+ uptime
- [ ] < 200ms API response time

### Month 6 Targets
- [ ] 100 paying customers
- [ ] $30K+ MRR
- [ ] 15% Free → Pro conversion
- [ ] < 5% churn rate

## 🔧 Essential Commands

```bash
# Development
npm run dev

# Database
npx prisma studio
npx prisma db push
npx prisma generate

# Testing
npm run test
npm run test:coverage

# Build & Deploy
npm run build
vercel deploy --prod
```

## 📚 Resources

- **Database Schema**: `prisma/schema-complete.prisma`
- **QAI Algorithm**: `lib/qai/`
- **Tier Management**: `lib/tier-manager.ts`
- **Growth Engine**: `lib/growth/`
- **Components**: `components/`

---

**Ready to build the future of dealership marketing! 🚀**
EOF

echo "✅ Roadmap documentation created"

# 8. Update package.json scripts
echo "📝 Updating package.json scripts..."

# Add new scripts to package.json
npm pkg set scripts.setup="bash scripts/setup-database.sh"
npm pkg set scripts.dev-setup="bash scripts/dev-setup.sh"
npm pkg set scripts.deploy="bash scripts/deploy.sh"
npm pkg set scripts.test:watch="jest --watch"
npm pkg set scripts.test:coverage="jest --coverage"

echo "✅ Package.json updated"

# 9. Create directory structure
echo "📁 Creating directory structure..."

mkdir -p lib/integrations
mkdir -p lib/email
mkdir -p components/dashboard
mkdir -p components/ui
mkdir -p app/api/qai
mkdir -p app/api/stripe
mkdir -p app/api/actions
mkdir -p scripts
mkdir -p __tests__

echo "✅ Directory structure created"

# 10. Final setup instructions
echo ""
echo "🎉 DealershipAI Roadmap Setup Complete!"
echo "========================================"
echo ""
echo "Next steps:"
echo "1. Copy .env.example to .env.local and fill in your API keys"
echo "2. Run: ./scripts/setup-database.sh"
echo "3. Run: npm run dev"
echo ""
echo "📚 Documentation: ROADMAP_IMPLEMENTATION.md"
echo "🗄️ Database: prisma/schema-complete.prisma"
echo "🧮 Algorithm: lib/qai/"
echo "🎨 Components: components/"
echo ""
echo "Ready to build the future of dealership marketing! 🚀"
