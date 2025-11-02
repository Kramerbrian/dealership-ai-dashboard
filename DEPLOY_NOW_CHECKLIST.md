# 🚀 DEPLOY NOW - Checklist

## ✅ Everything is ready! Just follow these steps:

### 1. Environment Variables (Required)
Copy to `.env.local` and Vercel:

```bash
# Clerk (Get from: https://dashboard.clerk.com)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Database (Get from Supabase Dashboard)
DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres

# Stripe (Get from: https://dashboard.stripe.com)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Install & Setup
```bash
npm install
npx prisma generate
npx prisma db push
```

### 3. Test Locally
```bash
npm run dev
```

Visit: http://localhost:3000

### 4. Deploy to Vercel
```bash
# Install Vercel CLI (if needed)
npm i -g vercel

# Deploy
vercel

# Add all env vars in Vercel dashboard
# Then deploy to production
vercel --prod
```

### 5. Configure Webhooks
After deployment, update webhook URLs:

**Clerk Webhook** → `https://your-domain.com/api/clerk/webhook`
- Events: `user.created`, `user.updated`

**Stripe Webhook** → `https://your-domain.com/api/stripe/webhook`
- Events: `checkout.session.completed`, `customer.subscription.updated`

---

## 🎯 Test These Flows

1. ✅ Landing page loads (`/`)
2. ✅ Sign up button works (`/sign-up`)
3. ✅ Clerk authentication works
4. ✅ Onboarding flow completes (`/onboarding`)
5. ✅ Dashboard accessible (`/dashboard`)
6. ✅ Protected routes require auth

---

## 📦 What's Included

- ✅ Landing/Marketing Page
- ✅ Clerk SSO (fully configured)
- ✅ Onboarding Flow (4 steps)
- ✅ Intelligence Dashboard
- ✅ API Routes (protected)
- ✅ Database Schema (Prisma)

---

## 🐛 Troubleshooting

**"Clerk not working"** → Check env vars match exactly (no spaces)

**"Database error"** → Verify `DATABASE_URL` in Supabase

**"Onboarding redirects"** → Ensure `session_id` query param exists

---

**That's it! You're ready to deploy.** 🎉

