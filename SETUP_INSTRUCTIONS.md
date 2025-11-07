# Setup Instructions - Run in Your Terminal

## ✅ Prerequisites Check

Your system is ready:
- ✅ Vercel CLI installed and logged in
- ✅ Supabase CLI installed and logged in

## 🚀 Next Steps

Since the setup scripts require interactive input, **run these commands in your terminal**:

### Option 1: Run All Steps (Recommended)

```bash
./scripts/setup-all.sh
```

This will guide you through all steps interactively.

---

### Option 2: Run Steps Individually

#### Step 1: Environment Variables
```bash
./scripts/setup-env.sh
```

You'll need:
- **Clerk keys**: https://dashboard.clerk.com → Your App → API Keys
- **Supabase keys**: https://supabase.com/dashboard → Your Project → Settings → API
- **Upstash Redis**: https://console.upstash.com → Your Database → REST API
- **Production domain**: e.g., `https://dash.dealershipai.com`

#### Step 2: Supabase Migrations
```bash
./scripts/setup-supabase.sh
```

This will:
- Link to your Supabase project (if not already)
- Apply database migrations

#### Step 3: Clerk Dashboard (Manual)
1. Go to https://dashboard.clerk.com
2. Select your application
3. **Settings → Domains** → Add your production domain
4. **Settings → Paths** → Verify redirect URLs

#### Step 4: Deploy
```bash
./scripts/deploy.sh
```

This will:
- Verify all prerequisites
- Build the project
- Deploy to Vercel production

---

## 📊 Quick Status Check

After setup, verify everything works:

```bash
# Check environment variables
vercel env ls production

# Check Supabase project
supabase projects list

# Health check (after deployment)
curl https://your-domain.com/api/health
```

---

## 🎯 Estimated Time

- **Step 1 (Env Vars)**: 5-10 minutes
- **Step 2 (Migrations)**: 2-5 minutes  
- **Step 3 (Clerk)**: 3 minutes (manual)
- **Step 4 (Deploy)**: 5 minutes
- **Total**: ~15-25 minutes

---

## 💡 Tips

1. **Have accounts ready** before starting:
   - Clerk account
   - Supabase account
   - Upstash account

2. **Copy keys as you go** - The scripts will prompt for each one

3. **Test incrementally** - After each step, verify it worked

4. **Check logs** - If something fails, check the script output

---

## 🆘 Need Help?

- See `docs/CLI_SETUP_GUIDE.md` for detailed guide
- See `docs/QUICK_START.md` for step-by-step instructions
- Check script output for specific error messages
