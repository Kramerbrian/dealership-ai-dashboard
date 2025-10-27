# 🚀 DealershipAI Quick Setup Guide

## Current Status ✅
- **Platform:** https://dealership-ai-dashboard-fmx4xghdz-brian-kramer-dealershipai.vercel.app
- **Environment Variables:** All configured in Vercel
- **Ready for:** Stripe CLI, Upstash Redis, PostgreSQL

## 🔧 Manual Installation Steps

### 1. Stripe CLI Installation

**Option A: Direct Download**
1. Go to [stripe.com/docs/stripe-cli](https://stripe.com/docs/stripe-cli)
2. Click "Download Stripe CLI"
3. Select macOS and download the `.tar.gz` file
4. Extract: `tar -xzf stripe_*.tar.gz`
5. Install: `sudo mv stripe /usr/local/bin/`
6. Test: `stripe --version`

**Option B: Using Homebrew**
```bash
# Install Homebrew first (if not installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Stripe CLI
brew install stripe/stripe-cli/stripe
```

### 2. Upstash Redis Setup

```bash
# Login to Upstash
npx @upstash/cli auth login

# Create Redis database
npx @upstash/cli redis create --name dealershipai-redis --region us-east-1

# Get connection details
npx @upstash/cli redis list
```

### 3. PostgreSQL Database Setup

**Choose one option:**

#### Option A: Vercel Postgres (Recommended)
1. Go to [vercel.com/storage](https://vercel.com/storage)
2. Create new Postgres database
3. Copy connection string
4. Update `DATABASE_URL` in Vercel

#### Option B: Supabase
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Get connection string from Settings → Database
4. Update `DATABASE_URL` in Vercel

#### Option C: Railway
1. Go to [railway.app](https://railway.app)
2. Create new PostgreSQL service
3. Copy connection string
4. Update `DATABASE_URL` in Vercel

### 4. Update Environment Variables

After setting up external services:

```bash
# Update Redis credentials
npx vercel env rm UPSTASH_REDIS_REST_URL production
npx vercel env add UPSTASH_REDIS_REST_URL production

npx vercel env rm UPSTASH_REDIS_REST_TOKEN production
npx vercel env add UPSTASH_REDIS_REST_TOKEN production

# Update database URL
npx vercel env rm DATABASE_URL production
npx vercel env add DATABASE_URL production

# Update Stripe credentials (if needed)
npx vercel env rm STRIPE_SECRET_KEY production
npx vercel env add STRIPE_SECRET_KEY production
```

### 5. Final Deployment

```bash
# Redeploy with real credentials
npx vercel --prod

# Test the platform
curl https://your-domain.com/api/qai/calculate
```

## 🧪 Testing Commands

### Test Stripe CLI
```bash
stripe --version
stripe login
stripe config --list
```

### Test Upstash Redis
```bash
npx @upstash/cli auth whoami
npx @upstash/cli redis list
```

### Test Database
```bash
npx prisma db pull
npx prisma studio
```

## 📊 Production Checklist

- [ ] Stripe CLI installed and logged in
- [ ] Upstash Redis database created
- [ ] PostgreSQL database set up
- [ ] Environment variables updated with real credentials
- [ ] Platform redeployed
- [ ] All features tested

## 🎯 Ready to Launch!

Once all services are connected:
1. **Test the platform** with real data
2. **Set up custom domain** (dealershipai.com)
3. **Start acquiring customers**
4. **Monitor performance**

Your DealershipAI platform will be fully operational! 🚀

## 📞 Support

If you encounter issues:
1. Check the detailed setup guides in the project
2. Verify all environment variables are set
3. Test each service individually
4. Redeploy after making changes

**The platform is 99% ready - just need to connect the external services!** 🎉
