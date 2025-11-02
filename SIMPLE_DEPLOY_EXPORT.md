# DealershipAI - Simple Deployment Export

## 🎯 What You're Building

1. **Landing/Marketing Page** (`app/page.tsx`)
2. **Clerk SSO** (Already integrated)
3. **Onboarding** (`app/onboarding/page.tsx`)
4. **Intelligence Dashboard** (`app/dashboard/page.tsx`)

---

## ✅ What Already Exists

### 1. Landing Page
- **File**: `app/page.tsx`
- **Component**: `DealershipAI17SectionPLG`
- **Status**: ✅ Ready
- **Location**: `/`

### 2. Clerk Authentication
- **Package**: `@clerk/nextjs` (v6.33.7)
- **Status**: ✅ **FULLY CONFIGURED**
- **Files**:
  - `app/layout.tsx` - ClerkProvider wrapper ✅
  - `middleware.ts` - Route protection ✅
- **Protected Routes**: `/dashboard`, `/intelligence`, `/api/ai/*`
- **Setup Needed**: Add env vars:
  ```
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
  CLERK_SECRET_KEY=sk_...
  ```

### 3. Onboarding Flow
- **File**: `app/onboarding/page.tsx`
- **Status**: ✅ Ready (4-step flow)
- **Steps**: Welcome → Goals → Setup → Team
- **Location**: `/onboarding?session_id=...`

### 4. Dashboard
- **File**: `app/dashboard/page.tsx`
- **Component**: `DealershipAIDashboardLA`
- **Status**: ✅ Ready
- **Location**: `/dashboard`

---

## 🔧 Quick Setup (5 minutes)

### Step 1: Environment Variables
Create `.env.local`:
```bash
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Database (Supabase PostgreSQL)
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# Stripe
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Database Setup
```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database
npx prisma db push
```

### Step 4: Run Dev Server
```bash
npm run dev
```

---

## 📁 Project Structure

```
dealership-ai-dashboard/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── onboarding/
│   │   └── page.tsx                # Onboarding flow
│   ├── dashboard/
│   │   └── page.tsx                # Main dashboard
│   ├── intelligence/
│   │   └── page.tsx                # Intelligence view
│   ├── api/
│   │   ├── clerk/
│   │   │   └── webhook/route.ts    # Clerk webhook handler
│   │   └── stripe/
│   │       └── webhook/route.ts    # Stripe webhook handler
│   └── layout.tsx                  # Root layout with Clerk
├── components/
│   └── dashboard/                  # Dashboard components
├── prisma/
│   └── schema.prisma               # Database schema
└── lib/
    └── utils.ts                    # Utility functions
```

---

## 🚀 Deployment Checklist

### Pre-Deploy
- [ ] Set up Clerk account → Get API keys
- [ ] Set up Supabase → Get `DATABASE_URL`
- [ ] Set up Stripe → Get API keys
- [ ] Update `.env.local` with all keys
- [ ] Run `npx prisma generate`
- [ ] Run `npx prisma db push`
- [ ] Test locally: `npm run dev`

### Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard
# Then deploy to production
vercel --prod
```

### Post-Deploy
- [ ] Configure Clerk webhook: `https://your-domain.com/api/clerk/webhook`
- [ ] Configure Stripe webhook: `https://your-domain.com/api/stripe/webhook`
- [ ] Test signup flow
- [ ] Test onboarding flow
- [ ] Test dashboard access

---

## 🔑 Key Routes

| Route | Purpose | Auth Required |
|-------|---------|---------------|
| `/` | Landing page | No |
| `/sign-in` | Clerk sign-in | No |
| `/sign-up` | Clerk sign-up | No |
| `/onboarding` | Onboarding flow | Yes |
| `/dashboard` | Main dashboard | Yes |
| `/intelligence` | Intelligence view | Yes |

---

## 📦 Core Dependencies

```json
{
  "@clerk/nextjs": "^6.33.7",      // Auth (SSO)
  "next": "^15.5.6",                // Framework
  "prisma": "^5.6.0",               // Database ORM
  "@prisma/client": "^5.6.0",       // Prisma client
  "stripe": "^19.1.0"               // Payments
}
```

---

## 🎨 What's Next?

Once deployed, you can:
1. Customize landing page (`DealershipAI17SectionPLG`)
2. Enhance onboarding steps (`app/onboarding/page.tsx`)
3. Build dashboard components (`components/dashboard/`)
4. Add more API routes (`app/api/`)

---

## 🐛 Common Issues

### Issue: Clerk auth not working
**Fix**: Check env vars are set correctly in Vercel

### Issue: Database connection fails
**Fix**: Verify `DATABASE_URL` in Supabase dashboard

### Issue: Onboarding redirects
**Fix**: Ensure `session_id` query param is passed

---

## 📞 Support

- **Clerk Docs**: https://clerk.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Prisma Docs**: https://www.prisma.io/docs

---

**Ready to deploy!** 🚀

