# 🚀 Deployment Action Plan - Do This Now

## ⚠️ CRITICAL FIX FIRST

The deployment is **blocked** because Vercel has the wrong root directory configured.

### Step 1: Fix Root Directory (2 minutes)

1. Go to: https://vercel.com/brian-kramer-dealershipai/dealership-ai-dashboard/settings (ALREADY OPEN)
2. Scroll to **"Build & Development Settings"** section
3. Find **"Root Directory"** field
4. Click **"Edit"** next to Root Directory
5. Change from: `~/dealership-ai-dashboard/apps/web/apps/web`
6. Change to: `.` (just a single dot)
7. Click **"Save"**

---

## Step 2: Add Environment Variables (10 minutes)

Go to: https://vercel.com/brian-kramer-dealershipai/dealership-ai-dashboard/settings/environment-variables

### Method A: Use the Web Interface (Recommended)

Open: **ADD-TO-VERCEL-NOW.txt** (ALREADY OPEN)

For each variable (1-13):
1. Click **"Add New"** in Vercel
2. Copy the **Name** from the file (e.g., `ORY_SDK_URL`)
3. Copy the **Value** below it
4. Select: ✅ **Production** ✅ **Preview**
5. Click **"Save"**

### Critical Variables to Add (13 total):

```
1. ORY_SDK_URL
2. NEXT_PUBLIC_ORY_SDK_URL
3. ORY_PROJECT_ID
4. ORY_WORKSPACE_ID
5. NEXT_PUBLIC_SUPABASE_URL
6. NEXT_PUBLIC_SUPABASE_ANON_KEY
7. SUPABASE_SERVICE_ROLE_KEY
8. NEXT_PUBLIC_APP_URL
9. NODE_ENV
10. GPT_SERVICE_TOKEN
11. NEXTAUTH_URL
12. NEXTAUTH_SECRET
13. DATABASE_URL ← Get from Supabase (see below)
```

### Getting DATABASE_URL from Supabase:

1. Open: https://supabase.com/dashboard/project/vxrdvkhkombwlhjvtsmw/settings/database (ALREADY OPEN)
2. Scroll to **"Connection string"** section
3. Click the **"Transaction pooler"** tab
4. Click **"Copy"** button
5. Paste into Vercel as `DATABASE_URL`

The connection string looks like:
```
postgresql://postgres.vxrdvkhkombwlhjvtsmw:[password]@aws-0-us-west-1.pooler.supabase.com:6543/postgres
```

---

## Step 3: Deploy to Production (2 minutes)

After fixing root directory and adding variables:

```bash
vercel --prod
```

---

## Alternative: Add Variables via CLI

If you prefer command line, run these one at a time:

```bash
# Ory Auth
echo "https://optimistic-haslett-3r8udelhc2.projects.oryapis.com" | vercel env add ORY_SDK_URL production
echo "https://optimistic-haslett-3r8udelhc2.projects.oryapis.com" | vercel env add NEXT_PUBLIC_ORY_SDK_URL production
echo "360ebb8f-2337-48cd-9d25-fba49a262f9c" | vercel env add ORY_PROJECT_ID production
echo "83af532a-eee6-4ad8-96c4-f4802a90940a" | vercel env add ORY_WORKSPACE_ID production

# Supabase
echo "https://vxrdvkhkombwlhjvtsmw.supabase.co" | vercel env add NEXT_PUBLIC_SUPABASE_URL production
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4cmR2a2hrb21id2xoanZ0c213Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0NjgwMDQsImV4cCI6MjA3MTA0NDAwNH0.5GEWgoolAs5l1zd0ftOBG7MfYZ20sKuxcR-w93VeF7s" | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4cmR2a2hrb21id2xoanZ0c213Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTQ2ODAwNCwiZXhwIjoyMDcxMDQ0MDA0fQ.lLQNZjVAWQ_DeObUYMzXL4cQ81_R6MnDzYPlqIIxoR0" | vercel env add SUPABASE_SERVICE_ROLE_KEY production

# Application
echo "https://dash.dealershipai.com" | vercel env add NEXT_PUBLIC_APP_URL production
echo "production" | vercel env add NODE_ENV production
echo "90140d0f3abf35948d843cb68f48bb300f3bd2828b33ec23a60313c6269137c0" | vercel env add GPT_SERVICE_TOKEN production

# NextAuth
echo "https://dash.dealershipai.com" | vercel env add NEXTAUTH_URL production
echo "TVUtfzsVhO8ONGlq9W7wegT0wyI49VR/U2uHKgVxR1o=" | vercel env add NEXTAUTH_SECRET production
```

**Note:** Repeat each command with `preview` instead of `production` for preview environment.

---

## Checklist

- [ ] Fix Vercel root directory to `.`
- [ ] Add all 13 critical environment variables
- [ ] Get DATABASE_URL from Supabase
- [ ] Run `vercel --prod` to deploy
- [ ] Verify deployment at https://dash.dealershipai.com

---

## What's Already Done ✅

- ✅ All environment variables documented
- ✅ Ory production URLs configured
- ✅ NEXTAUTH_SECRET generated
- ✅ All files created and ready
- ✅ Background processes cleaned up

---

## Files Available

- **ADD-TO-VERCEL-NOW.txt** - All variables with values (OPEN)
- **VERCEL-ENV-SETUP.md** - Complete guide
- **ENV-CHECKLIST.md** - Quick reference
- **.env.local** - Local development config

---

## Need Help?

- Vercel Settings: https://vercel.com/brian-kramer-dealershipai/dealership-ai-dashboard/settings
- Supabase DB: https://supabase.com/dashboard/project/vxrdvkhkombwlhjvtsmw/settings/database
- Ory Console: https://console.ory.sh/projects/360ebb8f-2337-48cd-9d25-fba49a262f9c

---

**Start with Step 1 (Fix Root Directory) - it's blocking everything else!**
