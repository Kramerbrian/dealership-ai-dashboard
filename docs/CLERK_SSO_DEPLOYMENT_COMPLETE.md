# Clerk SSO Deployment - Implementation Guide

## 📋 What This Implements

Complete deployment setup for:
- **dealershipai.com** (landing page - public)
- **dash.dealershipai.com** (dashboard - protected)
- **Clerk SSO** across both domains using `.dealershipai.com` cookie domain

## 🎯 Two Approaches

### Option A: Monorepo Split (Recommended for Scale)

**Structure:**
```
apps/
├── landing/          # Separate Next.js app
└── dashboard/        # Separate Next.js app
```

**Pros:**
- Independent scaling
- Separate deployments
- Clear separation of concerns

**Cons:**
- More complex setup
- Need to duplicate shared code
- Two Vercel projects to manage

### Option B: Single App with Domain Routing (Current)

**Structure:**
```
app/
├── page.tsx          # Landing (public)
├── (dashboard)/      # Dashboard (protected)
└── middleware.ts     # Domain-based routing
```

**Pros:**
- Simpler setup
- Shared API routes
- Single deployment

**Cons:**
- Can't scale independently
- Shared build process

## 🚀 Quick Start (Option B - Keep Current Structure)

Since you already have domain-aware middleware, you can deploy with minimal changes:

### 1. Configure Clerk Cookie Domain

1. Go to: https://dashboard.clerk.dev
2. Settings → Domain & Cookies
3. Set **Cookie Domain:** `.dealershipai.com`
4. Add **Allowed Origins:**
   - `https://dealershipai.com`
   - `https://dash.dealershipai.com`

### 2. Single Vercel Project (Current Setup)

Your current `vercel.json` already supports this. Just:
1. Add domains in Vercel dashboard
2. Configure DNS
3. Deploy

### 3. Test SSO

```bash
# Sign in on landing
curl -I https://dealershipai.com/sign-in

# Should be signed in on dashboard
curl -I https://dash.dealershipai.com
```

## 📝 Files Created

1. **`docs/DEPLOYMENT_PLAN_CLERK_SSO.md`** - Complete deployment guide
2. **`scripts/setup-monorepo.sh`** - Monorepo setup script
3. **`scripts/create-vercel-projects.sh`** - Vercel project creation script

## ✅ Next Steps

**If using Option A (Monorepo):**
1. Run: `./scripts/setup-monorepo.sh`
2. Move files to appropriate apps
3. Create package.json files
4. Run: `./scripts/create-vercel-projects.sh`
5. Configure DNS

**If using Option B (Current):**
1. Configure Clerk cookie domain
2. Add domains in Vercel
3. Configure DNS
4. Deploy

## 🔗 Resources

- **Clerk SSO Docs:** https://clerk.com/docs/authentication/sso
- **Vercel Multi-Project:** https://vercel.com/docs/projects
- **Deployment Plan:** `docs/DEPLOYMENT_PLAN_CLERK_SSO.md`

