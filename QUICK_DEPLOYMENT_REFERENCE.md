# 🚀 Quick Deployment Reference Card

## 📋 Your Browser Tabs Are Now Open:

1. **GitHub PR Creation**
   https://github.com/Kramerbrian/dealership-ai-dashboard/compare/main...phase3-clean
   → Click "Create pull request" → Review → Merge

2. **Supabase SQL Editor**
   https://supabase.com/dashboard/project/gzlgfghpkbqlhgfozjkb/sql/new
   → **Migration SQL is in your clipboard!** → Paste → Run

3. **Stripe Webhooks**
   https://dashboard.stripe.com/webhooks
   → Add endpoint: `https://dealershipai.com/api/stripe/webhook`
   → Events: checkout.session.completed, customer.subscription.*

4. **Clerk Dashboard**
   https://dashboard.clerk.com/
   → Webhooks → Add: `https://dealershipai.com/api/webhooks/clerk`
   → Events: user.created, user.deleted

5. **Vercel Environment Variables**
   https://vercel.com/brian-kramers-projects/dealership-ai-dashboard/settings/environment-variables
   → Add missing variables (see checklist below)

---

## ✅ 30-Second Deployment Checklist

### In Supabase (Tab 2)
- [x] SQL in clipboard
- [ ] Paste into SQL editor
- [ ] Click "Run"
- [ ] Verify: 5 tables + 3 functions created

### In GitHub (Tab 1)
- [ ] Review PR
- [ ] Merge to main
- [ ] Wait for Vercel auto-deploy

### In Stripe (Tab 3)
- [ ] Add webhook endpoint
- [ ] Select 5 subscription events
- [ ] Copy webhook secret
- [ ] Add to Vercel env vars

### In Clerk (Tab 4)
- [ ] Add webhook endpoint
- [ ] Select user events
- [ ] Copy webhook secret
- [ ] Add to Vercel env vars

### In Vercel (Tab 5)
- [ ] Add STRIPE_SECRET_KEY
- [ ] Add STRIPE_PRICE_ID
- [ ] Add STRIPE_WEBHOOK_SECRET
- [ ] Add NEXT_PUBLIC_SUPABASE_URL
- [ ] Add SUPABASE_SERVICE_ROLE_KEY
- [ ] Add CLERK_PUBLISHABLE_KEY
- [ ] Add CLERK_WEBHOOK_SECRET
- [ ] (Optional) Add ACP_WEBHOOK_SECRET

---

## 🎯 Expected Timeline

**Total Time: ~10 minutes**

- Supabase migration: 30 seconds
- GitHub PR merge: 1 minute
- Stripe webhook config: 2 minutes
- Clerk webhook config: 2 minutes
- Vercel env vars: 3 minutes
- Auto-deployment: 2 minutes
- Verification: 1 minute

---

## ✨ After Deployment

**Test the integration:**
```bash
# Health check
curl https://dealershipai.com/api/health

# PLG metrics
curl https://dealershipai.com/api/plg/metrics

# Create test user in Clerk → Verify tenant created in Supabase
```

**Monitor:**
- Supabase Tables: `tenants`, `orders`, `events`
- PLG Dashboard: `https://dealershipai.com/api/plg/metrics`
- Webhook logs in Stripe/Clerk dashboards

---

## 📞 Quick Links

| Service | Purpose | URL |
|---------|---------|-----|
| GitHub PR | Merge code | Tab 1 (open) |
| Supabase | Apply migration | Tab 2 (open) |
| Stripe | Configure webhooks | Tab 3 (open) |
| Clerk | Configure webhooks | Tab 4 (open) |
| Vercel | Add env vars | Tab 5 (open) |

---

## 🎉 You're Ready!

All tabs are open, migration is in your clipboard, and you're 10 minutes away from a live PLG funnel!

Start with **Tab 2 (Supabase)** → Paste & Run → Then work through the checklist above.

Good luck! 🚀

