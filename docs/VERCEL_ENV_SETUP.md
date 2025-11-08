# Vercel Environment Variables Setup

## 📋 Variables to Add

Copy these from your `.env.local` file and add them in Vercel Dashboard:

### Required Variables

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE=eyJ...
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
GOOGLE_OAUTH_CLIENT_ID=...
GOOGLE_OAUTH_CLIENT_SECRET=...
GOOGLE_OAUTH_REDIRECT_URI=https://dealership-ai-dashboard-gzcb2txx4-brian-kramer-dealershipai.vercel.app/api/oauth/ga4/callback
GA4_PROPERTY_ID=properties/XXXXX
```

## 🔗 Quick Links

- **Vercel Dashboard**: https://vercel.com/brian-kramer-dealershipai/dealership-ai-dashboard
- **Environment Variables**: https://vercel.com/brian-kramer-dealershipai/dealership-ai-dashboard/settings/environment-variables
- **Deployment**: https://dealership-ai-dashboard-gzcb2txx4-brian-kramer-dealershipai.vercel.app

## 📝 Steps

1. Go to: https://vercel.com/brian-kramer-dealershipai/dealership-ai-dashboard/settings/environment-variables
2. Click **Add New** for each variable
3. Set **Environment** to: Production, Preview, and Development (or just Production)
4. Paste the value from your `.env.local`
5. **Important**: Update `GOOGLE_OAUTH_REDIRECT_URI` to use your Vercel domain
6. Save all variables
7. Redeploy: `npx vercel --prod` or trigger a new deployment

## ✅ Verification

After adding variables and redeploying, test:

- Drive Dashboard: `https://dealership-ai-dashboard-gzcb2txx4-brian-kramer-dealershipai.vercel.app/drive`
- Health Check: `https://dealership-ai-dashboard-gzcb2txx4-brian-kramer-dealershipai.vercel.app/api/health`

