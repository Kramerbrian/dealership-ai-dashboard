# Quick Environment Variables Sync

**Fast way to set Vercel environment variables from Supabase and .env.local**

---

## 🚀 Quick Method (Recommended)

### Step 1: Run Interactive Script

```bash
./scripts/sync-env-to-vercel-interactive.sh
```

This will:
- ✅ Set `NEXT_PUBLIC_SUPABASE_URL` (from MCP)
- ✅ Set `NEXT_PUBLIC_SUPABASE_ANON_KEY` (from MCP)
- ⚠️ Prompt you to set Clerk keys manually

---

## 📋 Manual Method (If Script Doesn't Work)

### 1. Set Supabase Variables

```bash
# Supabase URL
vercel env add NEXT_PUBLIC_SUPABASE_URL production
# Paste: https://gzlgfghpkbqlhgfozjkb.supabase.co

# Supabase Anon Key
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
# Paste: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6bGdmZ2hwa2JxbGhnZm96amtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzOTg1MDQsImV4cCI6MjA3MDk3NDUwNH0.0X_zVfNH9K5FBDcMl_O7yeXJYwuWvGLALwjIe5JRlqg
```

### 2. Set Supabase Service Role Key (Manual)

```bash
vercel env add SUPABASE_SERVICE_ROLE_KEY production
# Get from: Supabase Dashboard → Settings → API → service_role key
# Paste when prompted
```

### 3. Set Clerk Keys (If in .env.local)

```bash
# Read from .env.local
grep "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" .env.local
grep "CLERK_SECRET_KEY" .env.local

# Then set in Vercel
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production
# Paste the value from .env.local

vercel env add CLERK_SECRET_KEY production
# Paste the value from .env.local
```

---

## ✅ Verify

1. **Check Vercel Dashboard**:
   https://vercel.com/brian-kramers-projects/dealership-ai-dashboard/settings/environment-variables

2. **Redeploy**:
   ```bash
   vercel --prod
   ```

3. **Test Sign-In**:
   https://dash.dealershipai.com/sign-in
   - Should show Clerk form (not "Loading...")

---

## 📊 Current Values

**Supabase (from MCP)**:
- URL: `https://gzlgfghpkbqlhgfozjkb.supabase.co`
- Anon Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (full key in script)

**Clerk**:
- Check `.env.local` or Clerk Dashboard

---

**Status**: Ready to sync  
**Time**: ~5 minutes

