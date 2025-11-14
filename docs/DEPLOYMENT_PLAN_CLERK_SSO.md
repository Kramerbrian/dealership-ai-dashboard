# DealershipAI Deployment Plan - Clerk SSO Across Domains

**Status:** Ready to Execute  
**Domains:** `dealershipai.com` (landing) + `dash.dealershipai.com` (dashboard)  
**Auth:** Clerk SSO with shared cookies across `.dealershipai.com`

## 📋 Overview

This plan splits the current single Next.js app into two Vercel projects:
- **Landing Project:** `dealershipai.com` - Marketing site (public)
- **Dashboard Project:** `dash.dealershipai.com` - Application dashboard (protected)

Both projects share the same Clerk application for seamless SSO.

## 🏗️ Current vs. Target Structure

### Current Structure (Single App)
```
app/
├── page.tsx              # Landing page
├── (marketing)/          # Marketing routes
├── (dashboard)/          # Dashboard routes
├── dash/                 # Dashboard pages
└── api/                  # Shared API routes
```

### Target Structure (Monorepo)
```
apps/
├── landing/
│   ├── app/
│   │   ├── page.tsx      # Landing page
│   │   └── layout.tsx    # Landing layout with ClerkProvider
│   ├── middleware.ts     # Public routes only
│   └── package.json
└── dashboard/
    ├── app/
    │   ├── page.tsx      # Dashboard home
    │   └── layout.tsx    # Dashboard layout with ClerkProvider
    ├── middleware.ts     # Protected routes
    └── package.json
```

## 🚀 Step-by-Step Implementation

### Step 1: Create Monorepo Structure

```bash
# Create directories
mkdir -p apps/landing/app apps/dashboard/app packages/ui

# Move landing page
git mv app/page.tsx apps/landing/app/page.tsx
git mv app/(marketing) apps/landing/app/(marketing)

# Move dashboard
git mv app/(dashboard) apps/dashboard/app/(dashboard)
git mv app/dash apps/dashboard/app/dash

# Keep API routes in root (shared) or duplicate if needed
# For now, we'll keep them in root and both apps can access
```

### Step 2: Create Package Files

**Root `package.json`** (workspace setup):
```json
{
  "name": "dealership-ai-dashboard-monorepo",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "dev": "turbo run dev --parallel",
    "build": "turbo run build",
    "dev:landing": "cd apps/landing && npm run dev",
    "dev:dashboard": "cd apps/dashboard && npm run dev"
  },
  "devDependencies": {
    "turbo": "^1.10.0"
  }
}
```

**`apps/landing/package.json`:**
```json
{
  "name": "dealershipai-landing",
  "private": true,
  "version": "0.1.0",
  "scripts": {
    "dev": "next dev -p 3000",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "next": "^14.1.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@clerk/nextjs": "^5.0.0"
  }
}
```

**`apps/dashboard/package.json`:**
```json
{
  "name": "dealershipai-dashboard",
  "private": true,
  "version": "0.1.0",
  "scripts": {
    "dev": "next dev -p 3001",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "next": "^14.1.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@clerk/nextjs": "^5.0.0"
  }
}
```

### Step 3: Configure Clerk

**Clerk Dashboard Settings:**
1. Go to: https://dashboard.clerk.dev
2. Select your Clerk application
3. **Settings → Domain & Cookies:**
   - **Cookie Domain:** `.dealershipai.com` (with leading dot)
   - **Allowed Origins:**
     - `https://dealershipai.com`
     - `https://dash.dealershipai.com`
     - `http://localhost:3000` (dev landing)
     - `http://localhost:3001` (dev dashboard)
   - **Redirect URLs:**
     - `https://dealershipai.com/sign-in`
     - `https://dealershipai.com/sign-up`
     - `https://dash.dealershipai.com/sign-in`
     - `https://dash.dealershipai.com/sign-up`

### Step 4: Create Middleware Files

**`apps/landing/middleware.ts`:**
```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Landing page middleware - no auth required
export function middleware(request: NextRequest) {
  // All routes are public on landing
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
```

**`apps/dashboard/middleware.ts`:**
```typescript
import { authMiddleware } from '@clerk/nextjs';

export default authMiddleware({
  publicRoutes: [
    '/api/webhook',
    '/api/health',
    '/_vercel',
  ],
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
```

### Step 5: Create Layout Files

**`apps/landing/app/layout.tsx`:**
```tsx
import React from 'react';
import { ClerkProvider } from '@clerk/nextjs';

export const metadata = {
  title: 'DealershipAI — Transform Your Dealership',
  description: 'AI-powered analytics for automotive dealerships',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ClerkProvider
          publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
          domain="dealershipai.com"
        >
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
```

**`apps/dashboard/app/layout.tsx`:**
```tsx
import React from 'react';
import { ClerkProvider } from '@clerk/nextjs';

export const metadata = {
  title: 'DealershipAI — Dashboard',
  description: 'AI-powered dashboard for dealerships',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ClerkProvider
          publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
          domain="dash.dealershipai.com"
        >
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
```

### Step 6: Vercel Project Configuration

**Create two Vercel projects:**

1. **Landing Project:**
   - Name: `dealershipai-landing`
   - Root Directory: `apps/landing`
   - Framework: Next.js
   - Build Command: `npm run build` (or `cd apps/landing && npm run build`)
   - Output Directory: `.next`

2. **Dashboard Project:**
   - Name: `dealershipai-dashboard`
   - Root Directory: `apps/dashboard`
   - Framework: Next.js
   - Build Command: `npm run build` (or `cd apps/dashboard && npm run build`)
   - Output Directory: `.next`

### Step 7: Environment Variables

**Add to BOTH Vercel projects:**

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_CLERK_FRONTEND_API=clerk.dealershipai.com
CLERK_SECRET_KEY=sk_test_...
```

**Via Vercel CLI:**
```bash
# Landing project
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production --cwd apps/landing
vercel env add CLERK_SECRET_KEY production --cwd apps/landing

# Dashboard project
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production --cwd apps/dashboard
vercel env add CLERK_SECRET_KEY production --cwd apps/dashboard
```

### Step 8: DNS Configuration

**At your domain registrar:**

1. **Apex Domain (dealershipai.com):**
   - Type: `A`
   - Host: `@`
   - Value: `76.76.21.21` (Vercel IP)
   - TTL: `600`

2. **Dashboard Subdomain (dash.dealershipai.com):**
   - Type: `CNAME`
   - Host: `dash`
   - Value: `cname.vercel-dns.com`
   - TTL: `600`

**Note:** If using Cloudflare, disable proxy (DNS-only) during verification.

### Step 9: Deploy

```bash
# Deploy landing
cd apps/landing
vercel --prod --confirm

# Deploy dashboard
cd ../dashboard
vercel --prod --confirm
```

Or push to GitHub and let Vercel auto-deploy.

### Step 10: Test SSO

1. Visit `https://dealershipai.com`
2. Click "Sign In" → Complete Clerk sign-in
3. Visit `https://dash.dealershipai.com`
4. Should be automatically signed in (cookie shared via `.dealershipai.com`)

## 🔧 Alternative: Keep Single App (Simpler)

If you prefer to keep the current single-app structure:

1. **Use one Vercel project** with domain-based routing
2. **Middleware handles routing** based on hostname
3. **Clerk configured** for both domains
4. **Simpler deployment** - one project instead of two

**Pros:**
- Simpler setup
- Shared API routes
- Single deployment

**Cons:**
- Can't scale landing/dashboard independently
- Shared build process

## 📝 Files to Create

See the deployment plan JSON for exact file templates:
- `apps/landing/middleware.ts`
- `apps/dashboard/middleware.ts`
- `apps/landing/app/layout.tsx`
- `apps/dashboard/app/layout.tsx`
- `apps/landing/package.json`
- `apps/dashboard/package.json`
- Root `package.json` (workspace)

## ✅ Verification Checklist

- [ ] Monorepo structure created
- [ ] Clerk app configured with `.dealershipai.com` cookie domain
- [ ] Two Vercel projects created with correct root directories
- [ ] Environment variables added to both projects
- [ ] DNS records configured
- [ ] Both apps deployed
- [ ] SSO tested across domains

## 🐛 Troubleshooting

**SSO doesn't work:**
- Verify Clerk cookie domain is exactly `.dealershipai.com`
- Check Clerk keys match in both projects
- Verify SameSite cookie settings

**Build fails:**
- Ensure `package.json` exists in root directory
- Check build command includes `cd apps/landing` or `cd apps/dashboard`

**Domain verification fails:**
- Disable Cloudflare proxy
- Wait for DNS propagation (up to 48 hours)

