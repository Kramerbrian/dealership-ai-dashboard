# Quick Migration Guide - Pulse System Production Setup

## Prerequisites Checklist

Before running migrations, ensure you have:

- [ ] Production Supabase project created
- [ ] Database credentials copied from Supabase dashboard
- [ ] Vercel project environment variables configured
- [ ] Clerk authentication keys updated

## Step 1: Configure Database Credentials in Vercel

### Get Your Supabase Credentials

1. Go to https://supabase.com/dashboard
2. Select your **production** project (NOT local development)
3. Navigate to **Settings** → **Database**
4. Find the **Connection string** section
5. Copy both connection strings:

**Connection Pooling (for DATABASE_URL):**
```
postgresql://postgres.[YOUR-PROJECT]:[YOUR-PASSWORD]@aws-1-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
```

**Direct Connection (for DIRECT_URL):**
```
postgresql://postgres.[YOUR-PROJECT]:[YOUR-PASSWORD]@aws-1-us-east-2.compute-1.amazonaws.com:5432/postgres
```

### Add to Vercel Environment Variables

1. Go to https://vercel.com/dashboard
2. Select project: **dealership-ai-dashboard**
3. Click **Settings** → **Environment Variables**
4. Click **Add New** button
5. Add these two variables:

| Key | Value | Environment |
|-----|-------|-------------|
| `DATABASE_URL` | Your pooling connection string | Production |
| `DIRECT_URL` | Your direct connection string | Production |

6. Click **Save**

## Step 2: Redeploy to Load New Environment Variables

After adding the environment variables, you need to redeploy:

```bash
npx vercel --prod
```

Wait for deployment to complete (~2-3 minutes).

## Step 3: Run Database Migrations

### Option A: Using Vercel CLI (Recommended)

Connect to production and run migrations:

```bash
# Pull production environment variables
npx vercel env pull .env.production

# Run migrations using production credentials
npx dotenv -e .env.production -- npx prisma migrate deploy
```

### Option B: Using the Migration Script

```bash
# Set production DATABASE_URL temporarily
export DATABASE_URL="your-production-database-url"

# Run the migration script
./scripts/deploy-production-migrations.sh
```

### Option C: Manual Prisma Command

```bash
# Set both environment variables
export DATABASE_URL="your-pooling-connection-string"
export DIRECT_URL="your-direct-connection-string"

# Deploy migrations
npx prisma migrate deploy

# Generate Prisma Client for production schema
npx prisma generate
```

## Step 4: Verify Migrations Succeeded

### Check Tables Were Created

```bash
# Connect to your production database and list tables
npx prisma db execute --stdin <<SQL
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name LIKE 'Pulse%'
ORDER BY table_name;
SQL
```

Expected output:
```
PulseRadarData
PulseScenario
PulseScore
PulseTrend
```

### Test API Endpoints

```bash
# Test Pulse Score API
curl https://dealership-ai-dashboard-45lke0aoe-brian-kramer-dealershipai.vercel.app/api/pulse/score?dealerId=demo-123

# Should return:
# {
#   "success": true,
#   "data": {
#     "pulse_score": 77.4,
#     "signals": {...},
#     "trends": {...}
#   }
# }
```

## Step 5: Fix Clerk Authentication

### Update Clerk Dashboard

1. Go to https://dashboard.clerk.com
2. Select your application
3. Go to **Configure** → **API Keys**
4. Scroll to **Allowed origins**
5. Click **Add origin**
6. Add your production URL:
   ```
   https://dealership-ai-dashboard-45lke0aoe-brian-kramer-dealershipai.vercel.app
   ```
7. Click **Save**

### Update Vercel Environment Variables

1. In Clerk dashboard, copy your **Production API keys**:
   - Publishable Key (starts with `pk_live_`)
   - Secret Key (starts with `sk_live_`)

2. Go to Vercel → **Settings** → **Environment Variables**

3. Add/update these variables for **Production**:

| Key | Value | Environment |
|-----|-------|-------------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `pk_live_xxx` | Production |
| `CLERK_SECRET_KEY` | `sk_live_xxx` | Production |

4. Redeploy:
   ```bash
   npx vercel --prod
   ```

## Step 6: Final Verification

### Test Authentication
1. Visit: https://dealership-ai-dashboard-45lke0aoe-brian-kramer-dealershipai.vercel.app
2. Try to sign up/sign in
3. Should NOT see "Invalid host" error
4. Should successfully authenticate

### Test All Pulse APIs

```bash
# Score
curl https://dealership-ai-dashboard-45lke0aoe-brian-kramer-dealershipai.vercel.app/api/pulse/score?dealerId=demo-123

# Scenario
curl -X POST https://dealership-ai-dashboard-45lke0aoe-brian-kramer-dealershipai.vercel.app/api/pulse/scenario \
  -H "Content-Type: application/json" \
  -d '{"dealerId":"demo-123","adjustments":{"schema":0.1}}'

# Trends
curl https://dealership-ai-dashboard-45lke0aoe-brian-kramer-dealershipai.vercel.app/api/pulse/trends?dealerId=demo-123&days=30

# Radar
curl https://dealership-ai-dashboard-45lke0aoe-brian-kramer-dealershipai.vercel.app/api/pulse/radar?limit=10
```

## Troubleshooting

### Error: "P1000: Authentication failed"
- **Cause:** DATABASE_URL not configured or incorrect
- **Fix:** Double-check connection string in Vercel environment variables
- **Verify:** Connection string includes password and correct host

### Error: "Invalid host" from Clerk
- **Cause:** Production URL not in Clerk allowed origins
- **Fix:** Add production URL to Clerk dashboard allowed origins
- **Verify:** URL matches exactly (including https://)

### Error: "Migration failed"
- **Cause:** Previous migration partially completed
- **Fix:** Mark as completed:
  ```bash
  npx prisma migrate resolve --applied "migration_name"
  ```
- **Then retry:** `npx prisma migrate deploy`

### Tables Not Created
- **Check migration status:**
  ```bash
  npx prisma migrate status
  ```
- **Force reset (CAUTION - deletes data):**
  ```bash
  npx prisma migrate reset
  npx prisma migrate deploy
  ```

## Database Schema Created

The Pulse System creates these tables:

### PulseScore
```prisma
model PulseScore {
  id          String   @id @default(cuid())
  dealer_id   String
  model_id    String?
  timestamp   DateTime @default(now())
  score       Float
  signals     Json
  trends      Json?
  confidence  Float
  @@index([dealer_id, timestamp])
}
```

### PulseScenario
```prisma
model PulseScenario {
  id            String   @id @default(cuid())
  dealer_id     String
  model_id      String?
  timestamp     DateTime @default(now())
  adjustments   Json
  outcome       Json
  monteCarlo    Json?
  confidence    Float
  @@index([dealer_id, timestamp])
}
```

### PulseRadarData
```prisma
model PulseRadarData {
  id                String   @id @default(cuid())
  dealer_id         String?
  model_id          String?
  timestamp         DateTime @default(now())
  event_type        String
  severity          String
  affected_dealers  Json?
  metadata          Json?
  @@index([timestamp, severity])
}
```

### PulseTrend
```prisma
model PulseTrend {
  id           String   @id @default(cuid())
  dealer_id    String
  model_id     String?
  pillar       String
  timestamp    DateTime @default(now())
  velocity     Float
  acceleration Float
  confidence   Float
  dataPoints   Json
  @@index([dealer_id, pillar, timestamp])
}
```

## Success Criteria

✅ **Migration Complete When:**
- [ ] All 4 Pulse tables exist in production database
- [ ] `prisma migrate status` shows all migrations applied
- [ ] API endpoints return valid responses (not 500 errors)
- [ ] Clerk authentication working (no "Invalid host")
- [ ] Can create test data via API
- [ ] Dashboard displays Pulse data correctly

## Next Steps After Migration

1. **Seed Sample Data** (optional):
   ```bash
   npx prisma db seed
   ```

2. **Monitor Production**:
   - Check Vercel logs for errors
   - Monitor API response times
   - Set up Sentry or error tracking

3. **Custom Domain** (optional):
   - Configure DNS CNAME record
   - Add domain to Vercel
   - Update Clerk allowed origins

4. **Performance Optimization**:
   - Enable API caching
   - Add database indexes
   - Optimize query patterns

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Check Supabase database logs
3. Verify all environment variables are set correctly
4. Review [PRODUCTION_SETUP_CHECKLIST.md](./PRODUCTION_SETUP_CHECKLIST.md)
