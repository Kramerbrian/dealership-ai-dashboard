# Add Environment Variables to Vercel via CLI

## Quick Start

### Option 1: Automated Script (Recommended)

```bash
# Run interactive script
./scripts/add-vercel-env-interactive.sh
```

This script will:
- ✅ Check if Vercel CLI is installed
- ✅ Check if you're logged in
- ✅ Load values from `.env.local` if available
- ✅ Prompt you for missing values
- ✅ Add variables to all environments (production, preview, development)

### Option 2: Manual CLI Commands

```bash
# Make sure you're logged in
vercel login

# Add each variable (replace with actual values)
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production preview development
vercel env add CLERK_SECRET_KEY production preview development
vercel env add SUPABASE_URL production preview development
vercel env add SUPABASE_SERVICE_ROLE_KEY production preview development
vercel env add NEXT_PUBLIC_SUPABASE_URL production preview development
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production preview development
vercel env add ANTHROPIC_API_KEY production preview development

# Optional (but recommended)
vercel env add NEXT_PUBLIC_SENTRY_DSN production preview development
vercel env add SENTRY_DSN production preview development
vercel env add UPSTASH_REDIS_REST_URL production preview development
vercel env add UPSTASH_REDIS_REST_TOKEN production preview development
```

### Option 3: Bulk Add from .env.local

```bash
# If you have all values in .env.local
./scripts/add-vercel-env.sh
```

---

## Required Variables

These are **required** for the app to work:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_... or pk_test_...
CLERK_SECRET_KEY=sk_live_... or sk_test_...
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxx
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
ANTHROPIC_API_KEY=sk-ant-api03-...
```

## Optional Variables (Recommended)

These enable full production features:

```bash
# Error Tracking (get from sentry.io)
NEXT_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/xxx
SENTRY_DSN=https://xxx@sentry.io/xxx

# Rate Limiting (get from upstash.com)
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx

# Analytics
NEXT_PUBLIC_GA=G-XXX
```

---

## Useful Vercel CLI Commands

### List all environment variables
```bash
vercel env ls
```

### View a specific variable
```bash
vercel env pull .env.vercel
cat .env.vercel | grep VARIABLE_NAME
```

### Remove a variable
```bash
vercel env rm VARIABLE_NAME
```

### Add to specific environments only
```bash
# Production only
vercel env add VARIABLE_NAME production

# Production and preview
vercel env add VARIABLE_NAME production preview
```

### Update an existing variable
```bash
# Remove and re-add
vercel env rm VARIABLE_NAME
vercel env add VARIABLE_NAME production preview development
```

---

## Troubleshooting

### "Vercel CLI not found"
```bash
npm install -g vercel
```

### "Not logged in"
```bash
vercel login
```

### "Variable already exists"
The variable is already set. To update it, remove and re-add:
```bash
vercel env rm VARIABLE_NAME
vercel env add VARIABLE_NAME production preview development
```

### "Permission denied"
Make sure you're the project owner or have write access to the project.

---

## After Adding Variables

1. **Trigger a new deployment:**
   ```bash
   # Push to trigger deployment
   git push origin main
   
   # OR manually redeploy
   vercel --prod
   ```

2. **Verify variables are set:**
   ```bash
   vercel env ls
   ```

3. **Test in deployment:**
   - Check build logs for any missing variables
   - Test API endpoints that use the variables

---

## Security Notes

⚠️ **Never commit `.env.local` to git!**

- ✅ `.env.local` is in `.gitignore`
- ✅ Use Vercel CLI or dashboard to add secrets
- ✅ Secrets are encrypted in Vercel

---

## Quick Reference

```bash
# Login
vercel login

# Check status
vercel whoami

# List variables
vercel env ls

# Add variable
vercel env add VARIABLE_NAME production preview development

# Remove variable
vercel env rm VARIABLE_NAME

# Pull all variables (creates .env.vercel)
vercel env pull .env.vercel
```

---

**Need help?** Run `vercel --help` or `vercel env --help` for more options.

