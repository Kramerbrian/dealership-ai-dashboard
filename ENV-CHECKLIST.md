# Environment Variables Checklist

## ✅ Completed Configuration

### Local Development (.env.local)
All environment variables are properly configured for local development:

- ✅ **Supabase Database**
  - NEXT_PUBLIC_SUPABASE_URL
  - NEXT_PUBLIC_SUPABASE_ANON_KEY
  - SUPABASE_SERVICE_ROLE_KEY

- ✅ **Ory Authentication** (Local with Tunnel)
  - ORY_SDK_URL (http://localhost:4000)
  - NEXT_PUBLIC_ORY_SDK_URL (http://localhost:4000)
  - ORY_PROJECT_ID
  - ORY_WORKSPACE_ID

- ✅ **Stripe Payments** (Test Mode)
  - STRIPE_SECRET_KEY
  - STRIPE_PUBLISHABLE_KEY
  - STRIPE_WEBHOOK_SECRET
  - STRIPE_PRICE_ID_PRO_MONTHLY
  - STRIPE_PRICE_ID_PREMIUM_MONTHLY

- ✅ **Application Configuration**
  - NEXT_PUBLIC_APP_URL
  - NODE_ENV
  - GPT_SERVICE_TOKEN

- ✅ **Enterprise SSO (SAML Jackson)**
  - DATABASE_URL
  - NEXTAUTH_URL
  - NEXTAUTH_SECRET

- ✅ **Tier Limits**
  - TIER_FREE_SESSIONS
  - TIER_PRO_SESSIONS
  - TIER_ENTERPRISE_SESSIONS
  - DEALER_CACHE_TTL
  - MARKET_CACHE_TTL_PRO
  - MARKET_CACHE_TTL_ENTERPRISE

## ⚠️ TODO: Production Deployment (Vercel)

### Critical - Must Add to Vercel

1. **Ory Authentication** (Production URLs)
   ```bash
   ORY_SDK_URL=https://optimistic-haslett-3r8udelhc2.projects.oryapis.com
   NEXT_PUBLIC_ORY_SDK_URL=https://optimistic-haslett-3r8udelhc2.projects.oryapis.com
   ORY_PROJECT_ID=360ebb8f-2337-48cd-9d25-fba49a262f9c
   ORY_WORKSPACE_ID=83af532a-eee6-4ad8-96c4-f4802a90940a
   ```

2. **Supabase** (Copy from .env.local)
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://vxrdvkhkombwlhjvtsmw.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
   ```

3. **Application URLs** (Production)
   ```bash
   NEXT_PUBLIC_APP_URL=https://dash.dealershipai.com
   NODE_ENV=production
   GPT_SERVICE_TOKEN=90140d0f3abf35948d843cb68f48bb300f3bd2828b33ec23a60313c6269137c0
   ```

4. **NextAuth** (Production)
   ```bash
   NEXTAUTH_URL=https://dash.dealershipai.com
   NEXTAUTH_SECRET=[generate new with: openssl rand -base64 32]
   ```

5. **Database URL** (For SAML Jackson)
   ```bash
   DATABASE_URL=[Get from Supabase Project Settings → Database → Connection String]
   ```

### Important - Replace Before Live Launch

6. **Stripe** (Switch to Live Mode)
   - Replace test keys with live keys from Stripe Dashboard
   - Update webhook secret with production webhook

7. **OpenAI API Key**
   ```bash
   OPENAI_API_KEY=[Your actual OpenAI API key]
   ```

### Optional - Add When Ready

8. **SEO & Data APIs**
   - GOOGLE_SEARCH_CONSOLE_API_KEY
   - GOOGLE_MY_BUSINESS_API_KEY
   - PAGESPEED_API_KEY
   - AHREFS_API_KEY
   - SEMRUSH_API_KEY
   - BIRDEYE_API_KEY

9. **Background Jobs**
   - QSTASH_TOKEN
   - QSTASH_URL
   - CRON_SECRET

10. **Tier Limits** (Copy from .env.local)
    - TIER_FREE_SESSIONS=0
    - TIER_PRO_SESSIONS=25
    - TIER_ENTERPRISE_SESSIONS=125
    - DEALER_CACHE_TTL=72
    - MARKET_CACHE_TTL_PRO=48
    - MARKET_CACHE_TTL_ENTERPRISE=24

## 🔧 Required Actions Before Deployment

### 1. Update Ory Selfservice URLs
```bash
ory patch identity-config \
  --project 360ebb8f-2337-48cd-9d25-fba49a262f9c \
  --workspace 83af532a-eee6-4ad8-96c4-f4802a90940a \
  --replace '/selfservice/flows/login/ui_url="https://dash.dealershipai.com/sign-in"' \
  --replace '/selfservice/flows/registration/ui_url="https://dash.dealershipai.com/sign-up"' \
  --replace '/selfservice/flows/recovery/ui_url="https://dash.dealershipai.com/recovery"' \
  --replace '/selfservice/flows/verification/ui_url="https://dash.dealershipai.com/verification"' \
  --replace '/selfservice/flows/settings/ui_url="https://dash.dealershipai.com/settings"' \
  --replace '/selfservice/flows/error/ui_url="https://dash.dealershipai.com/error"'
```

### 2. Add Environment Variables to Vercel
- Go to: https://vercel.com/brian-kramers-projects/dealership-ai-dashboard/settings/environment-variables
- Add all variables listed above
- Select environments: ✅ Production, ✅ Preview

### 3. Set Up Stripe Webhook
- Create webhook in Stripe Dashboard
- Point to: `https://dash.dealershipai.com/api/webhooks/stripe`
- Add webhook secret to Vercel environment variables

### 4. Get Supabase Connection String
- Go to: https://supabase.com/dashboard/project/vxrdvkhkombwlhjvtsmw/settings/database
- Copy "Connection pooling" URI (for production)
- Add as DATABASE_URL in Vercel

### 5. Generate Production NEXTAUTH_SECRET
```bash
openssl rand -base64 32
```
Add output to Vercel as NEXTAUTH_SECRET

## 📋 Files Created/Updated

### New Files
- ✅ `VERCEL-ENV-SETUP.md` - Comprehensive deployment guide
- ✅ `ENV-CHECKLIST.md` - This checklist
- ✅ `lib/jackson.ts` - SAML Jackson configuration
- ✅ `lib/ory.ts` - Ory client setup
- ✅ `pages/api/auth/[...nextauth].ts` - NextAuth handler
- ✅ `pages/api/oauth/authorize.ts` - OAuth authorization
- ✅ `pages/api/oauth/saml.ts` - SAML response handler
- ✅ `pages/api/oauth/token.ts` - OAuth token endpoint
- ✅ `pages/api/oauth/userinfo.ts` - User info endpoint

### Updated Files
- ✅ `.env.local` - Complete local development configuration
- ✅ `package.json` - Added next-auth and @boxyhq/saml-jackson

### Files to Clean Up
- ⚠️ `.env` - Contains old Clerk credentials (should be removed)
- ⚠️ `.env.production` - Mostly empty placeholders

## 🔐 Security Reminders

### Never Commit to Git
- ✅ `.env.local` (already gitignored)
- ✅ `.env.production` (already gitignored)
- ⚠️ `.env` (tracked in repo - clean up and remove)

### Service Role Keys
- Use SUPABASE_SERVICE_ROLE_KEY only server-side
- Never expose in client-side code
- Bypasses all Row Level Security policies

### API Keys
- Store all API keys in Vercel environment variables
- Use NEXT_PUBLIC_ prefix ONLY for public data
- Rotate keys periodically

## 📚 Documentation References

- **Main Guide:** [VERCEL-ENV-SETUP.md](./VERCEL-ENV-SETUP.md)
- **Session Summary:** [SESSION-SUMMARY.md](./SESSION-SUMMARY.md)
- **Social Login:** [SOCIAL-LOGIN-SETUP.md](./SOCIAL-LOGIN-SETUP.md)
- **Ory Config:** [identity-config.yaml](./identity-config.yaml)

## 🎯 Next Steps

1. ✅ Local environment configured
2. ⏳ Add environment variables to Vercel (IN PROGRESS)
3. ⏳ Update Ory URLs for production
4. ⏳ Test deployment on Vercel preview
5. ⏳ Switch Stripe to live mode
6. ⏳ Add production OpenAI key
7. ⏳ Configure Stripe webhook
8. ⏳ Set up monitoring and error tracking

## Quick Commands

### Start Local Development
```bash
# Terminal 1: Start Ory Tunnel
ory tunnel --project 360ebb8f-2337-48cd-9d25-fba49a262f9c http://localhost:3000

# Terminal 2: Start Next.js
npm run dev
```

### Deploy to Vercel
```bash
vercel --prod
```

### Add Environment Variable via CLI
```bash
vercel env add VARIABLE_NAME production
```

### List All Environment Variables
```bash
vercel env ls
```
