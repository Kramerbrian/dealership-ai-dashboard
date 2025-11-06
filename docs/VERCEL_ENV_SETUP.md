# Vercel Environment Variables Setup

## Quick Setup Guide

### Step 1: Access Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: **dealership-ai-dashboard**
3. Navigate to: **Settings** → **Environment Variables**

### Step 2: Add Automation Keys

Add these three variables for **Production**, **Preview**, and **Development**:

#### Variable 1: AUTOMATION_API_KEY
```
Name: AUTOMATION_API_KEY
Value: bec0306d7a4c8b320884de24f823d56029da6469a30c932feb57cff55298b352
Environment: Production, Preview, Development
```

#### Variable 2: CRON_SECRET
```
Name: CRON_SECRET
Value: f695f4971ca982d97a37300e0cd83c8b4f90cd47ff981b4683148fdb2f6dc9ab
Environment: Production, Preview, Development
```

#### Variable 3: NEXT_PUBLIC_APP_URL
```
Name: NEXT_PUBLIC_APP_URL
Value: https://your-domain.com (replace with your actual domain)
Environment: Production, Preview, Development
```

**For Production:** Use your production domain (e.g., `https://dealershipai.com`)  
**For Preview:** Use preview domain or same as production  
**For Development:** Use `http://localhost:3000` (though this won't be used in Vercel)

### Step 3: Verify Setup

After adding variables:
1. Click **Save** for each variable
2. Variables will be available on next deployment
3. To apply immediately, trigger a new deployment

### Step 4: Test Cron Job

After deployment, the cron job will run automatically:
- **Schedule:** 1st of each month at 9 AM UTC
- **Endpoint:** `/api/cron/submit-actual-scores`
- **Check logs:** Vercel Dashboard → Functions → Logs

## Security Best Practices

### ✅ DO:
- Use different keys for Production vs Development
- Rotate keys every 90 days
- Keep keys secure and never share publicly
- Use Vercel's environment variable encryption

### ❌ DON'T:
- Commit keys to git (they're in `.env` which should be gitignored)
- Share keys in chat/email
- Use the same keys across multiple projects
- Hardcode keys in source code

## Verification

### Check if Variables are Set

After deployment, you can verify in Vercel:
1. Go to **Deployments** → Latest deployment
2. Click on the deployment
3. Check **Environment Variables** section

### Test Automation Endpoint

```bash
# Test the cron endpoint (requires CRON_SECRET)
curl -X GET https://your-domain.com/api/cron/submit-actual-scores \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## Troubleshooting

### Cron Not Running
- Check `vercel.json` has cron configuration
- Verify `CRON_SECRET` is set
- Check Vercel function logs for errors

### Authentication Errors
- Verify `AUTOMATION_API_KEY` matches in both systems
- Check Authorization header format: `Bearer YOUR_KEY`
- Ensure key is set for correct environment

### API Calls Failing
- Verify `NEXT_PUBLIC_APP_URL` is correct
- Check network connectivity
- Review server logs in Vercel dashboard

## Current Keys (Development)

These are your **development keys** (already in `.env`):

```
AUTOMATION_API_KEY=bec0306d7a4c8b320884de24f823d56029da6469a30c932feb57cff55298b352
CRON_SECRET=f695f4971ca982d97a37300e0cd83c8b4f90cd47ff981b4683148fdb2f6dc9ab
```

**Recommendation:** Generate new keys for production:
```bash
npm run generate:automation-keys
```

Then use the new keys for Vercel Production environment.

## Next Steps

1. ✅ Add keys to Vercel (see above)
2. ✅ Deploy to Vercel
3. ✅ Verify cron job runs (check logs on 1st of month)
4. ✅ Monitor automation in Forecast Accuracy Tracker

