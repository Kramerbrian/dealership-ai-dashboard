# CLI Setup Guide - Complete Activation

## 🚀 Quick Start

Run the master setup script:

```bash
./scripts/setup-all.sh
```

This will guide you through all steps interactively.

---

## 📋 Individual Scripts

### 1. Environment Variables Setup

```bash
./scripts/setup-env.sh
```

**What it does:**
- Checks Vercel CLI installation
- Prompts for all required environment variables
- Sets them in Vercel production environment
- Handles secrets securely

**Required accounts:**
- [Clerk Dashboard](https://dashboard.clerk.com) - For auth keys
- [Supabase Dashboard](https://supabase.com/dashboard) - For database keys
- [Upstash Console](https://console.upstash.com) - For Redis keys

---

### 2. Supabase Migrations

```bash
./scripts/setup-supabase.sh
```

**What it does:**
- Checks Supabase CLI installation
- Links to your Supabase project (if not already)
- Applies all migrations from `supabase/migrations/`
- Verifies migration success

**Prerequisites:**
- Supabase CLI installed: `brew install supabase/tap/supabase` or `npm install -g supabase`
- Supabase account and project created

**Alternative (if no CLI):**
Apply migrations manually via Supabase Dashboard → SQL Editor

---

### 3. Deployment

```bash
./scripts/deploy.sh
```

**What it does:**
- Pre-flight checks (Vercel CLI, env vars, build)
- Verifies all requirements are met
- Deploys to Vercel production
- Provides test instructions

**Prerequisites:**
- All environment variables set
- Supabase migrations applied
- Clerk dashboard configured

---

## 🔧 Manual Steps

### Clerk Dashboard Configuration

Even with CLI scripts, Clerk requires manual dashboard configuration:

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application
3. **Settings → Domains**
   - Add your production domain (e.g., `dash.dealershipai.com`)
4. **Settings → Paths**
   - Verify redirect URLs:
     - After sign in: `/dashboard`
     - After sign up: `/dashboard`

---

## 📊 Script Flow

```
setup-all.sh (Master)
├── setup-env.sh (Environment Variables)
│   └── Prompts for Clerk, Supabase, Upstash keys
│   └── Sets in Vercel via CLI
├── setup-supabase.sh (Migrations)
│   └── Links Supabase project
│   └── Applies migrations via CLI
├── [Manual] Clerk Dashboard Config
│   └── Add domain
│   └── Verify redirects
└── deploy.sh (Deployment)
    └── Pre-flight checks
    └── Build verification
    └── Deploy to production
```

---

## 🧪 Testing After Setup

### 1. Health Check
```bash
curl https://your-domain.com/api/health
```

Should return:
```json
{
  "ok": true,
  "qstash": "configured",
  "redis": "configured",
  "supabase": "configured",
  "version": "..."
}
```

### 2. Sign Up Flow
1. Visit `https://your-domain.com/sign-up`
2. Create account
3. Should redirect to `/dashboard`

### 3. Dashboard Features
- ✅ View pulses (mock data)
- ✅ Click pulse → Fix drawer opens
- ✅ Click "Apply Fix" → Receipt appears
- ✅ Hover AIV chip → Sparkline shows

---

## 🚨 Troubleshooting

### "Vercel CLI not found"
```bash
npm install -g vercel
```

### "Supabase CLI not found"
```bash
# macOS
brew install supabase/tap/supabase

# Or via npm
npm install -g supabase
```

### "Not logged into Vercel"
```bash
vercel login
```

### "Not logged into Supabase"
```bash
supabase login
```

### "Environment variable not found"
- Run `./scripts/setup-env.sh` again
- Or set manually in Vercel Dashboard

### "Migration failed"
- Check Supabase project is linked: `supabase projects list`
- Link manually: `supabase link --project-ref YOUR_PROJECT_REF`
- Or apply migrations via Supabase Dashboard SQL Editor

---

## ⏱️ Estimated Time

- **Environment Variables**: 5-10 minutes (depends on account setup)
- **Supabase Migrations**: 2-5 minutes
- **Clerk Configuration**: 3 minutes (manual)
- **Deployment**: 5 minutes
- **Total**: ~15-25 minutes

---

## ✅ Success Checklist

After running all scripts, verify:

- [ ] All environment variables set in Vercel
- [ ] Supabase migrations applied (check in Dashboard)
- [ ] Clerk domain added and redirects configured
- [ ] Deployment successful (check Vercel Dashboard)
- [ ] Health endpoint returns `ok: true`
- [ ] Can sign up and access dashboard
- [ ] Pulses display (mock data)
- [ ] Fix drawer works
- [ ] Impact Ledger shows receipts
- [ ] AIV sparkline displays

---

## 🎉 You're Live!

Once all checks pass, your dashboard is **demo-ready** with:
- ✅ Full authentication
- ✅ Working fix APIs
- ✅ Real-time polling
- ✅ AIV trends
- ✅ Mock data (fully functional)

**Next:** Wire real data sources incrementally as needed.

