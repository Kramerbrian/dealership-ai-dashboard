# Vercel Environment Variables Sync Guide

**Quick guide to sync environment variables from `.env.local` and Supabase to Vercel**

---

## 🚀 Quick Start

### Option 1: Automated Script (Recommended)

```bash
# Run the sync script
./scripts/set-vercel-env-from-supabase.sh
```

This script will:
- ✅ Set Supabase URL and Anon Key (from MCP)
- ✅ Read Clerk keys from `.env.local` if present
- ✅ Set variables for Production, Preview, and Development

### Option 2: Manual Vercel CLI

```bash
# Set Supabase variables
vercel env add NEXT_PUBLIC_SUPABASE_URL production
# Paste: https://gzlgfghpkbqlhgfozjkb.supabase.co

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
# Paste: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6bGdmZ2hwa2JxbGhnZm96amtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzOTg1MDQsImV4cCI6MjA3MDk3NDUwNH0.0X_zVfNH9K5FBDcMl_O7yeXJYwuWvGLALwjIe5JRlqg
```

---

## 📋 Required Variables

### Critical (Must Set)

1. **NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY**
   - Get from: Clerk Dashboard → API Keys
   - Format: `pk_live_...` or `pk_test_...`
   - Set for: Production, Preview, Development

2. **CLERK_SECRET_KEY**
   - Get from: Clerk Dashboard → API Keys
   - Format: `sk_live_...` or `sk_test_...`
   - Set for: Production, Preview (NOT Development for security)

3. **NEXT_PUBLIC_SUPABASE_URL**
   - Value: `https://gzlgfghpkbqlhgfozjkb.supabase.co`
   - Set for: Production, Preview, Development

4. **NEXT_PUBLIC_SUPABASE_ANON_KEY**
   - Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (from Supabase MCP)
   - Set for: Production, Preview, Development

5. **SUPABASE_SERVICE_ROLE_KEY**
   - Get from: Supabase Dashboard → Settings → API → service_role key
   - ⚠️ **Must set manually** (sensitive, not available via API)
   - Set for: Production, Preview (NOT Development)

---

## 🔧 Using Vercel CLI

### Install Vercel CLI

```bash
npm install -g vercel
```

### Login

```bash
vercel login
```

### Set Environment Variables

```bash
# Format: vercel env add VARIABLE_NAME ENVIRONMENT
# Then paste the value when prompted

# Example:
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production
# Paste your key when prompted
```

### Set for Multiple Environments

```bash
# Production
vercel env add VARIABLE_NAME production

# Preview
vercel env add VARIABLE_NAME preview

# Development
vercel env add VARIABLE_NAME development
```

---

## 📊 Current Supabase Values (from MCP)

- **URL**: `https://gzlgfghpkbqlhgfozjkb.supabase.co`
- **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6bGdmZ2hwa2JxbGhnZm96amtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzOTg1MDQsImV4cCI6MjA3MDk3NDUwNH0.0X_zVfNH9K5FBDcMl_O7yeXJYwuWvGLALwjIe5JRlqg`

**Service Role Key**: Must be retrieved manually from Supabase Dashboard

---

## ✅ Verification

After setting variables:

1. **Check in Vercel Dashboard**:
   - Go to: https://vercel.com/brian-kramers-projects/dealership-ai-dashboard/settings/environment-variables
   - Verify all variables are set

2. **Redeploy**:
   ```bash
   vercel --prod
   ```

3. **Test Sign-In Page**:
   - Visit: https://dash.dealershipai.com/sign-in
   - Should show Clerk sign-in form (not "Loading...")

---

## 🚨 Troubleshooting

### "Variable already exists"
- Use `--force` flag: `vercel env add VARIABLE_NAME production --force`

### "Not logged in"
- Run: `vercel login`

### "Project not linked"
- Run: `vercel link`

### Sign-in still shows "Loading..."
- Check browser console for errors
- Verify `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is set
- Check Clerk Dashboard for allowed origins

---

**Status**: Ready to sync  
**Script**: `./scripts/set-vercel-env-from-supabase.sh`

