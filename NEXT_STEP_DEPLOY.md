# 🚀 Next Step: Deploy to Production

## Status Check ✅

- ✅ Environment variables set in Vercel
- ✅ Prisma Client generated
- ⚠️  Local migrations skipped (will use Vercel env vars)

## Deploy Now

### Option 1: Deploy via Vercel CLI (Recommended)

```bash
# Deploy to production
npx vercel --prod
```

### Option 2: Auto-Deploy (if Git connected)

If your Vercel project is connected to GitHub:
- Push to `main` branch → Auto-deploys
- Or manually trigger in Vercel Dashboard

### Option 3: Use Deployment Script

```bash
./scripts/deploy-backend.sh
```

---

## After Deployment

### 1. Run Database Migration (in Vercel)

**Option A: Via Vercel Dashboard**
1. Go to Vercel Dashboard → Your Project
2. Click on latest deployment
3. Open "Functions" tab
4. Run migration command (if available)

**Option B: Via Vercel CLI with Remote Environment**

The migration will run automatically when you deploy if you have a `postinstall` script, or you can:

1. Connect to Vercel environment
2. Run: `npx prisma migrate deploy`

**Option C: Manual Migration (if needed)**

If migrations don't run automatically, you may need to:
- Run migrations directly against production database
- Or use a migration service/cron job

### 2. Verify Deployment

```bash
# Check status endpoint
curl https://your-app.vercel.app/api/status

# Expected response:
# { "ok": true, "service": "dealershipAI_fleet_agent" }
```

### 3. Test Core Functionality

- [ ] Landing page loads: `https://your-app.vercel.app`
- [ ] Status API works: `/api/status`
- [ ] Health check: `/api/health`
- [ ] Dashboard accessible (with auth): `/dashboard`

---

## If Migration is Needed

If you see database errors after deployment:

1. **Check Vercel Logs:**
   - Dashboard → Project → Logs
   - Look for Prisma errors

2. **Run Migration Manually:**
   ```bash
   # Set environment variables locally temporarily
   export DATABASE_URL="your-production-url"
   export DIRECT_URL="your-production-url"
   
   # Run migration
   npx prisma migrate deploy
   ```

3. **Or Use Supabase Dashboard:**
   - Go to Supabase Dashboard → SQL Editor
   - Run migrations manually if needed

---

## Quick Test Commands

```bash
# 1. Deploy
npx vercel --prod

# 2. Test status
curl https://your-app.vercel.app/api/status

# 3. Test health
curl https://your-app.vercel.app/api/health

# 4. Test AI scores (if fleet API configured)
curl "https://your-app.vercel.app/api/ai-scores?origin=https://example.com"
```

---

## Success Criteria

✅ Deployment successful (no errors in Vercel)  
✅ `/api/status` returns `{ "ok": true }`  
✅ Landing page loads  
✅ No database connection errors in logs  

---

## Next Steps After Deployment

1. **Monitor Logs** for first 24 hours
2. **Test all endpoints** systematically
3. **Verify cron jobs** are running
4. **Check performance** metrics

---

**Ready to deploy? Run: `npx vercel --prod`**

