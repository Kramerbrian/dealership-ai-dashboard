# 🚀 Full-Stack Launch Guide

## ✅ Current Setup Status

### ✅ Installed & Configured:
- ✅ **Vercel CLI** - Logged in as `kramer177-auto`
- ✅ **Vercel Project** - Linked (`prj_n5a2az9ZjfIyAtv6izWeSb5vvVQH`)
- ✅ **Supabase CLI** - Installed
- ✅ **Upstash CLI** - Installed
- ✅ **.env file** - Found

### ⚠️ Needs Setup:
- ⚠️ **Supabase** - Not linked locally (can use remote)
- ⚠️ **Redis** - Need REST API credentials in Vercel

---

## 🚀 Quick Launch Commands

### 1. **Launch Full-Stack Helper**
```bash
npm run launch
```

**Options:**
- `1` - Start local development (Next.js + Supabase local)
- `2` - Deploy to Vercel (production)
- `3` - Check environment setup
- `4` - Sync environment variables

### 2. **Start Local Development**
```bash
# Start Next.js dev server
npm run dev

# Or with Supabase (if Docker is running)
supabase start
npm run dev
```

### 3. **Deploy to Vercel**
```bash
# Deploy to production
vercel --prod

# Or use the launch script
npm run launch
# Choose option 2
```

### 4. **Sync Environment Variables**
```bash
# Export variables from .env
npm run export:vercel-env

# View sync helper
npm run sync:env
```

---

## 🔧 Environment Setup

### Link Supabase (Optional - for local development)

```bash
# Link to remote Supabase project
supabase link --project-ref YOUR_PROJECT_REF

# Or start local Supabase (requires Docker)
supabase start
```

### Link Vercel (Already Done ✅)

```bash
# Already linked, but if needed:
vercel link
```

### Add Environment Variables to Vercel

**Method 1: Export and Copy**
```bash
npm run export:vercel-env
# Copy output and add to Vercel dashboard
```

**Method 2: Vercel CLI**
```bash
vercel env add VARIABLE_NAME
# Follow prompts to add value
```

**Method 3: Dashboard**
- Go to: https://vercel.com/YOUR_PROJECT/settings/environment-variables
- Add variables from `.env` export

---

## 📋 Required Environment Variables

### Critical (Must Have):
- `DATABASE_URL` - PostgreSQL connection string
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk auth key
- `CLERK_SECRET_KEY` - Clerk secret

### For Background Jobs:
- `UPSTASH_REDIS_REST_URL` - Redis REST API URL
- `UPSTASH_REDIS_REST_TOKEN` - Redis REST API token

### Optional (Recommended):
- `SENTRY_DSN` / `NEXT_PUBLIC_SENTRY_DSN` - Error tracking
- `LOGTAIL_TOKEN` - Structured logging

---

## 🎯 Launch Scenarios

### Scenario 1: Local Development
```bash
# 1. Start Supabase (if using local)
supabase start

# 2. Start Next.js
npm run dev

# 3. Open http://localhost:3000
```

### Scenario 2: Deploy to Vercel
```bash
# 1. Ensure all env vars are in Vercel
npm run export:vercel-env
# Add missing ones to Vercel dashboard

# 2. Deploy
vercel --prod

# Or use launch script
npm run launch
# Choose option 2
```

### Scenario 3: Check Everything
```bash
npm run launch
# Choose option 3 (Check environment setup)
```

---

## 🔍 Verification Commands

### Check Environment Variables
```bash
npm run verify:env
npm run check:redis
npm run check:sentry
```

### Check Service Status
```bash
# Vercel
vercel whoami
vercel env ls

# Supabase
supabase status

# Upstash
upstash redis list
```

---

## 🚨 Common Issues

### Issue: Supabase not running locally
**Solution**: Use remote Supabase instead, or start Docker and run `supabase start`

### Issue: Missing environment variables
**Solution**: 
1. Run `npm run export:vercel-env`
2. Add missing variables to Vercel dashboard

### Issue: Redis not working
**Solution**: 
1. Get REST API credentials: `npm run extract:redis-creds`
2. Add `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` to Vercel

---

## 📚 Quick Reference

### All Launch Commands:
```bash
npm run launch          # Interactive launch menu
npm run dev             # Start local dev server
npm run sync:env        # Sync env vars helper
npm run verify:env      # Verify environment setup
npm run check:redis     # Check Redis config
```

### Vercel Commands:
```bash
vercel --prod          # Deploy to production
vercel env ls          # List environment variables
vercel env add NAME    # Add environment variable
```

### Supabase Commands:
```bash
supabase start         # Start local Supabase
supabase status        # Check Supabase status
supabase link          # Link to remote project
```

---

## ✅ Ready to Launch!

Your setup is ready:
- ✅ Vercel CLI configured
- ✅ Vercel project linked
- ✅ All CLIs installed

**Next step**: Run `npm run launch` and choose your option!

