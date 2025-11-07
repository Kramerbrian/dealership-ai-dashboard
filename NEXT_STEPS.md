# Next Steps - Complete Activation

## ✅ Just Completed
- Supabase project linked (gzlgfghpkbqlhgfozjkb)

## 🔴 REQUIRED: Set 4 Environment Variables

**You MUST run this in YOUR terminal** (requires interactive input):

```bash
./scripts/quick-env-setup.sh
```

This will prompt you for:
1. **SUPABASE_SERVICE_ROLE** 
   - Get from: https://supabase.com/dashboard → Project gzlgfghpkbqlhgfozjkb → Settings → API → service_role key

2. **UPSTASH_REDIS_REST_URL**
   - Get from: https://console.upstash.com → Your Database → REST API → REST URL

3. **UPSTASH_REDIS_REST_TOKEN**
   - Get from: https://console.upstash.com → Your Database → REST API → REST Token

4. **PUBLIC_BASE_URL**
   - Your production domain (e.g., `https://dash.dealershipai.com`)

---

## 📋 After Setting Environment Variables

### Step 1: Run Supabase Migrations
```bash
./scripts/setup-supabase.sh
```

This will apply the database migrations to your linked project.

### Step 2: Configure Clerk Dashboard (Manual)
1. Go to https://dashboard.clerk.com
2. Select your application
3. **Settings → Domains** → Add your production domain
4. **Settings → Paths** → Verify redirect URLs

### Step 3: Deploy
```bash
./scripts/deploy.sh
```

---

## ⏱️ Time Remaining: ~10-15 minutes

Once you set the 4 environment variables in your terminal, the rest is automated!

---

## 🆘 Alternative: Set Variables Manually

If you prefer to set them one at a time:

```bash
vercel env add SUPABASE_SERVICE_ROLE production
# Paste your service_role key when prompted

vercel env add UPSTASH_REDIS_REST_URL production
# Paste your Redis REST URL when prompted

vercel env add UPSTASH_REDIS_REST_TOKEN production
# Paste your Redis REST token when prompted

vercel env add PUBLIC_BASE_URL production
# Paste your domain when prompted
```
