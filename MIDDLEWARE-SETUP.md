# 🔐 Middleware & Authentication Setup Guide

## Current Middleware Configuration

Your middleware is configured for **Clerk authentication** with multi-tenant support.

**Location:** `/middleware.ts`

---

## ✅ What's Working

1. **Graceful Degradation** (Line 17-20)
   - Middleware skips auth if Clerk is not configured
   - App will work in "demo mode" without authentication

2. **Multi-Tenant Isolation**
   - Users can only access their tenant's data
   - SuperAdmins can access all tenants

3. **Role-Based Access Control (RBAC)**
   - 4 roles: superadmin, enterprise_admin, dealership_admin, user
   - Granular permissions per role

4. **Route Protection**
   - Dashboard, admin, billing routes require authentication
   - Public routes remain accessible

---

## 🔴 What Needs Configuration

### Option 1: Configure Clerk (Recommended for Production)

**Why Clerk?**
- Full authentication solution
- Social login (Google, GitHub, etc.)
- User management UI
- Webhooks for sync
- Multi-tenant support built-in

**Steps:**

#### 1. Get Clerk Keys

1. Go to: https://dashboard.clerk.com/
2. Create account / Sign in
3. Create new application: "DealershipAI"
4. Copy the API keys:
   - **Publishable Key** (starts with `pk_`)
   - **Secret Key** (starts with `sk_`)

#### 2. Add Keys to Vercel

For **dealershipai-enterprise** project:

```bash
cd /Users/briankramer/dealership-ai-dashboard/dealershipai-enterprise

# Add Clerk keys
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
# Paste: pk_live_... (or pk_test_... for testing)

vercel env add CLERK_SECRET_KEY
# Paste: sk_live_... (or sk_test_... for testing)

# Redeploy
vercel --prod
```

Or via dashboard:
https://vercel.com/brian-kramers-projects/dealershipai-enterprise/settings/environment-variables

#### 3. Configure Clerk Settings

In Clerk Dashboard:

**A. Set Redirect URLs:**
- Sign-in URL: `/sign-in`
- Sign-up URL: `/sign-up`
- After sign-in: `/dashboard`
- After sign-up: `/dashboard`

**B. Enable Social Providers (Optional):**
- Google OAuth
- GitHub OAuth
- Microsoft, etc.

**C. Configure Organizations (for Multi-Tenant):**
- Enable Organizations feature
- Set organization settings
- Configure permissions

#### 4. Set Up Webhooks (for User Sync)

**Webhook URL:**
```
https://dealershipai-enterprise-a839dxdvw-brian-kramers-projects.vercel.app/api/webhooks/clerk
```

**Events to listen for:**
- `user.created`
- `user.updated`
- `organization.created`
- `organizationMembership.created`

**Get Webhook Secret:**
- Copy from Clerk Dashboard → Webhooks
- Add to Vercel as `CLERK_WEBHOOK_SECRET`

---

### Option 2: Use Demo/Dev Mode (Quick Testing)

**For immediate testing without setting up auth:**

The middleware automatically detects missing Clerk config and allows access.

**Current behavior with placeholder keys:**
- ✅ All routes are accessible
- ✅ No authentication required
- ✅ Perfect for testing features
- ⚠️ NOT suitable for production

**To use this mode:**
1. Keep placeholder Clerk keys in `.env`
2. Deploy as-is
3. Test all features without auth

---

### Option 3: Alternative Auth (NextAuth.js)

**If you prefer NextAuth instead of Clerk:**

The **dealershipai-enterprise** project uses NextAuth. You'd need to:

1. Switch to the enterprise project
2. Configure OAuth providers in NextAuth
3. Update middleware to use NextAuth sessions

**See:** `dealershipai-enterprise/src/app/api/auth/[...nextauth]/route.ts`

---

## 🔧 Middleware Features Explained

### User Context (Lines 4-11)

The middleware adds user context to every request:

```typescript
type UserContext = {
  userId: string;        // Clerk user ID
  tenantId: string;      // User's organization/tenant
  role: string;          // superadmin | enterprise_admin | dealership_admin | user
  accessibleTenants: string[];  // Tenants user can access
  permissions: any;      // Role-based permissions
};
```

### Protected Routes (Lines 139-149)

These routes require authentication:
- `/dashboard` - Main dashboard
- `/analytics` - Analytics views
- `/admin` - Admin panel (admin roles only)
- `/settings` - Settings pages
- `/billing` - Billing management
- `/users` - User management
- `/tenants` - Tenant management

### Role Permissions (Lines 224-296)

#### SuperAdmin
- ✅ Full access to everything
- ✅ Can manage all tenants
- ✅ Can view all billing
- ✅ Can manage all users

#### Enterprise Admin
- ✅ Full access to their enterprise
- ✅ Can manage multiple dealerships
- ✅ Can view/manage billing
- ✅ Can manage users in their tenants
- ❌ Cannot access other enterprises

#### Dealership Admin
- ✅ Full access to their dealership
- ✅ Can manage users in dealership
- ✅ Can view analytics
- ❌ Cannot manage billing
- ❌ Cannot manage other dealerships

#### User
- ✅ Can view analytics
- ✅ Can export data
- ❌ Cannot manage users
- ❌ Cannot access admin features
- ❌ Cannot view billing

---

## 🧪 Testing Authentication

### Test 1: With Clerk Disabled (Current)

```bash
# All routes should be accessible
curl https://dealershipai-enterprise-a839dxdvw-brian-kramers-projects.vercel.app/dashboard
# Expected: HTML response (not redirect)

curl https://dealershipai-enterprise-a839dxdvw-brian-kramers-projects.vercel.app/admin
# Expected: HTML response (not unauthorized)
```

### Test 2: With Clerk Enabled

```bash
# Protected routes should redirect to sign-in
curl -I https://dealershipai-enterprise-a839dxdvw-brian-kramers-projects.vercel.app/dashboard
# Expected: 302 redirect to /sign-in

# Sign-in page should be accessible
curl https://dealershipai-enterprise-a839dxdvw-brian-kramers-projects.vercel.app/sign-in
# Expected: HTML with Clerk sign-in component
```

### Test 3: API Routes with Context

```bash
# API routes receive user context in headers
curl https://dealershipai-enterprise-a839dxdvw-brian-kramers-projects.vercel.app/api/scores \
  -H "Authorization: Bearer YOUR_TOKEN"

# Check response headers for:
# x-user-id
# x-tenant-id
# x-user-role
# x-accessible-tenants
```

---

## 🚀 Recommended Setup Path

### For Production Deployment:

1. **Set up Clerk** (15 minutes)
   - Create Clerk account
   - Get API keys
   - Add to Vercel environment variables
   - Configure redirect URLs

2. **Configure Webhooks** (5 minutes)
   - Set up Clerk webhook
   - Add webhook secret to Vercel
   - Test webhook delivery

3. **Set up Database** (10 minutes)
   - Configure Supabase or PostgreSQL
   - Add connection string to Vercel
   - Run database migrations

4. **Test & Deploy** (5 minutes)
   - Redeploy with new config
   - Test sign-in flow
   - Verify user context

### For Quick Testing:

1. **Keep Current Config** (0 minutes)
   - Placeholder Clerk keys work in dev mode
   - No auth required for testing
   - All features accessible

2. **Test Features** (30 minutes)
   - Test dashboard
   - Test API endpoints
   - Test billing flow

3. **Add Auth Later** (when ready)
   - Follow production setup above

---

## 🔗 Quick Links

| Resource | URL |
|----------|-----|
| **Clerk Dashboard** | https://dashboard.clerk.com/ |
| **Clerk Documentation** | https://clerk.com/docs |
| **Middleware Code** | `/middleware.ts` |
| **Environment Variables** | https://vercel.com/brian-kramers-projects/dealershipai-enterprise/settings/environment-variables |

---

## 📝 Current Configuration

Based on your `.env` file:

```bash
# Clerk (Currently: Placeholder)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key ❌
CLERK_SECRET_KEY=sk_test_your_clerk_secret_key ❌

# This means:
# ✅ App works in dev mode (no auth required)
# ❌ Production auth not configured yet
```

---

## ✨ Summary

**Current State:**
- ✅ Middleware implemented and working
- ✅ RBAC system ready
- ✅ Multi-tenant isolation configured
- ⏳ Clerk keys need to be added for auth

**To Enable Authentication:**
1. Get Clerk keys from dashboard.clerk.com
2. Add to Vercel environment variables
3. Redeploy
4. Test sign-in flow

**To Continue Testing Without Auth:**
- No action needed
- Current setup allows all access
- Perfect for feature testing

---

**Need help?** Run: `cat QUICK-START.md`
