# 🚀 DealershipAI Enterprise - Command Reference

Quick reference for all deployment commands.

---

## 📦 Setup & Configuration

```bash
# Navigate to project
cd /Users/briankramer/dealership-ai-dashboard/dealershipai-enterprise

# Generate NextAuth secret
openssl rand -base64 32

# List environment variables
vercel env ls

# Add environment variable
vercel env add VARIABLE_NAME

# Pull environment variables to local
vercel env pull .env.local

# Remove environment variable
vercel env rm VARIABLE_NAME
```

---

## 🚢 Deployment

```bash
# Deploy to production
vercel --prod

# Deploy to preview
vercel

# Check deployment status
vercel ls

# View specific deployment
vercel inspect DEPLOYMENT_URL

# View logs
vercel logs

# View logs with filters
vercel logs --follow
vercel logs --since 1h
```

---

## 🧪 Testing

```bash
# Run verification script
./verify-deployment.sh

# Test health endpoint
curl https://dealershipai-enterprise-a839dxdvw-brian-kramers-projects.vercel.app/api/health

# Test with formatted JSON
curl https://dealershipai-enterprise-a839dxdvw-brian-kramers-projects.vercel.app/api/health | jq

# Test specific endpoint
curl -X GET https://dealershipai-enterprise-a839dxdvw-brian-kramers-projects.vercel.app/api/scores

# Test POST endpoint
curl -X POST https://dealershipai-enterprise-a839dxdvw-brian-kramers-projects.vercel.app/api/auth/demo/token \
  -H "Content-Type: application/json" \
  -d '{"grant_type":"authorization_code"}'
```

---

## 💳 Stripe

```bash
# Install Stripe CLI (if needed)
brew install stripe/stripe-cli/stripe

# Login to Stripe
stripe login

# Listen to webhooks (for testing)
stripe listen --forward-to https://dealershipai-enterprise-a839dxdvw-brian-kramers-projects.vercel.app/api/webhooks/stripe

# Trigger test events
stripe trigger checkout.session.completed
stripe trigger customer.subscription.created
stripe trigger invoice.payment_succeeded

# View webhook logs
stripe logs tail
```

---

## 🗄️ Database

```bash
# Test PostgreSQL connection (if using direct connection)
psql $DATABASE_URL -c "SELECT 1;"

# Run migrations (if using Prisma/Knex)
cd /Users/briankramer/dealership-ai-dashboard/dealershipai-enterprise
npm run db:migrate

# Seed database
npm run db:seed

# Check database status
npm run db:status
```

---

## 🔍 Monitoring

```bash
# View real-time logs
vercel logs --follow

# View logs from last hour
vercel logs --since 1h

# View logs from specific deployment
vercel logs DEPLOYMENT_URL

# Check build logs
vercel inspect DEPLOYMENT_URL --logs

# Monitor resource usage
vercel inspect DEPLOYMENT_URL
```

---

## 🌐 Domain Management

```bash
# List domains
vercel domains ls

# Add domain
vercel domains add dashboard.dealershipai.com

# Remove domain
vercel domains rm dashboard.dealershipai.com

# Inspect domain
vercel domains inspect dashboard.dealershipai.com
```

---

## 🔧 Local Development

```bash
# Navigate to project
cd /Users/briankramer/dealership-ai-dashboard/dealershipai-enterprise

# Install dependencies
npm install

# Pull environment variables
vercel env pull .env.local

# Run development server
npm run dev

# Build for production
npm run build

# Start production server locally
npm run start

# Run tests
npm test

# Type checking
npm run type-check

# Linting
npm run lint
```

---

## 📊 Analytics & Performance

```bash
# View analytics
open https://vercel.com/brian-kramers-projects/dealershipai-enterprise/analytics

# View speed insights
open https://vercel.com/brian-kramers-projects/dealershipai-enterprise/speed-insights

# Check bundle size
cd /Users/briankramer/dealership-ai-dashboard/dealershipai-enterprise
npm run build
# Look for "First Load JS" in output
```

---

## 🔐 Security

```bash
# Generate secure random string (for secrets)
openssl rand -base64 32

# Generate UUID
uuidgen

# Check SSL certificate
openssl s_client -connect dealershipai-enterprise-a839dxdvw-brian-kramers-projects.vercel.app:443

# Check security headers
curl -I https://dealershipai-enterprise-a839dxdvw-brian-kramers-projects.vercel.app
```

---

## 🎯 Quick Actions

### Disable Deployment Protection
```bash
# Via browser
open https://vercel.com/brian-kramers-projects/dealershipai-enterprise/settings/deployment-protection
```

### Access Project Settings
```bash
# Environment variables
open https://vercel.com/brian-kramers-projects/dealershipai-enterprise/settings/environment-variables

# Deployment protection
open https://vercel.com/brian-kramers-projects/dealershipai-enterprise/settings/deployment-protection

# Domains
open https://vercel.com/brian-kramers-projects/dealershipai-enterprise/settings/domains

# General settings
open https://vercel.com/brian-kramers-projects/dealershipai-enterprise/settings
```

### View Dashboards
```bash
# Vercel dashboard
open https://vercel.com/brian-kramers-projects/dealershipai-enterprise

# Deployments
open https://vercel.com/brian-kramers-projects/dealershipai-enterprise/deployments

# Logs
open https://vercel.com/brian-kramers-projects/dealershipai-enterprise/logs

# Production site
open https://dealershipai-enterprise-a839dxdvw-brian-kramers-projects.vercel.app
```

---

## 🐛 Debugging

```bash
# Check DNS
host dealershipai-enterprise-a839dxdvw-brian-kramers-projects.vercel.app

# Test connectivity
ping dealershipai-enterprise-a839dxdvw-brian-kramers-projects.vercel.app

# Check response time
time curl https://dealershipai-enterprise-a839dxdvw-brian-kramers-projects.vercel.app

# View headers
curl -I https://dealershipai-enterprise-a839dxdvw-brian-kramers-projects.vercel.app

# Verbose curl
curl -v https://dealershipai-enterprise-a839dxdvw-brian-kramers-projects.vercel.app/api/health

# Check CORS
curl -H "Origin: https://example.com" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -X OPTIONS \
  https://dealershipai-enterprise-a839dxdvw-brian-kramers-projects.vercel.app/api/scores
```

---

## 📝 Git Operations

```bash
# Status
git status

# Add changes
git add .

# Commit
git commit -m "Description of changes"

# Push (triggers auto-deployment if connected)
git push origin main

# View recent commits
git log --oneline -10

# Create branch
git checkout -b feature/new-feature

# Switch branch
git checkout main
```

---

## 🔄 Rollback

```bash
# List deployments
vercel ls

# Promote previous deployment to production
vercel promote DEPLOYMENT_URL

# Or via Vercel dashboard
open https://vercel.com/brian-kramers-projects/dealershipai-enterprise/deployments
# Click "..." on previous deployment → "Promote to Production"
```

---

## 📚 Documentation

```bash
# View quick start
cat QUICK-START.md

# View setup checklist
cat SETUP-CHECKLIST.md

# View detailed guide
cat DEPLOYMENT-SETUP-GUIDE.md

# View this file
cat COMMANDS.md

# Search documentation
grep -r "keyword" *.md
```

---

## 💡 Helpful Aliases

Add to your `~/.zshrc` or `~/.bashrc`:

```bash
# Quick navigation
alias dai='cd /Users/briankramer/dealership-ai-dashboard/dealershipai-enterprise'

# Quick deployment
alias dai-deploy='cd /Users/briankramer/dealership-ai-dashboard/dealershipai-enterprise && vercel --prod'

# Quick test
alias dai-test='cd /Users/briankramer/dealership-ai-dashboard && ./verify-deployment.sh'

# Quick logs
alias dai-logs='cd /Users/briankramer/dealership-ai-dashboard/dealershipai-enterprise && vercel logs --follow'

# Open dashboard
alias dai-dash='open https://dealershipai-enterprise-a839dxdvw-brian-kramers-projects.vercel.app'

# Open Vercel project
alias dai-vercel='open https://vercel.com/brian-kramers-projects/dealershipai-enterprise'
```

After adding, reload: `source ~/.zshrc`

---

## 🎯 One-Liners

```bash
# Check if site is up
curl -I https://dealershipai-enterprise-a839dxdvw-brian-kramers-projects.vercel.app 2>&1 | head -1

# Get deployment URL from Vercel
vercel ls | grep dealershipai-enterprise | head -1

# Count environment variables
vercel env ls 2>&1 | grep -c "="

# Test all API endpoints quickly
for endpoint in health scores billing/info ai/test; do
  echo -n "Testing /$endpoint... "
  curl -s -o /dev/null -w "%{http_code}\n" https://dealershipai-enterprise-a839dxdvw-brian-kramers-projects.vercel.app/api/$endpoint
done
```

---

**Pro Tip:** Bookmark this file for quick reference! 🔖

**Current Project:** `/Users/briankramer/dealership-ai-dashboard/dealershipai-enterprise`
**Production URL:** https://dealershipai-enterprise-a839dxdvw-brian-kramers-projects.vercel.app
