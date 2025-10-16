# 🗄️ Database Setup Guide for DealershipAI

## Prerequisites

1. **PostgreSQL Database** (version 13+)
2. **Environment Variables** configured
3. **Prisma CLI** installed

## Step 1: Database Provider Options

### Option A: Supabase (Recommended)
```bash
# 1. Create account at https://supabase.com
# 2. Create new project
# 3. Get connection string from Settings > Database
# 4. Set environment variable:
export DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres"
```

### Option B: Vercel Postgres
```bash
# 1. Install Vercel CLI: npm i -g vercel
# 2. Create database: vercel postgres create dealershipai-db
# 3. Get connection string: vercel postgres connect dealershipai-db
# 4. Set environment variable:
export DATABASE_URL="postgres://[USER]:[PASSWORD]@[HOST]:5432/[DATABASE]"
```

### Option C: Railway
```bash
# 1. Create account at https://railway.app
# 2. Create new PostgreSQL database
# 3. Get connection string from database settings
# 4. Set environment variable:
export DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/railway"
```

### Option D: Local PostgreSQL
```bash
# 1. Install PostgreSQL locally
# 2. Create database: createdb dealershipai
# 3. Set environment variable:
export DATABASE_URL="postgresql://postgres:password@localhost:5432/dealershipai"
```

## Step 2: Environment Configuration

Create `.env.local` file:
```bash
# Database
DATABASE_URL="your_database_connection_string_here"

# Optional: Redis for caching
UPSTASH_REDIS_REST_URL="your_redis_url"
UPSTASH_REDIS_REST_TOKEN="your_redis_token"

# Optional: Analytics
NEXT_PUBLIC_GA_ID="G-XXXXXXXXXX"

# Optional: Stripe for billing
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
```

## Step 3: Database Migration

```bash
# 1. Install dependencies
npm install

# 2. Generate Prisma client
npx prisma generate

# 3. Run initial migration
npx prisma migrate dev --name init

# 4. Apply AEO views migration
psql "$DATABASE_URL" -f db/migrations/002_aeo_views.sql

# 5. Seed with sample data (optional)
npx prisma db seed
```

## Step 4: Verify Setup

```bash
# Test database connection
npx prisma studio

# Or test via API
curl "https://your-domain.com/api/aeo/leaderboard?days=30"
```

## Step 5: Production Deployment

### Vercel Environment Variables
1. Go to Vercel Dashboard > Project Settings > Environment Variables
2. Add `DATABASE_URL` with your production database connection string
3. Redeploy: `vercel deploy --prod`

### Database Security
- Use connection pooling (PgBouncer)
- Enable SSL connections
- Set up proper user permissions
- Regular backups

## Troubleshooting

### Common Issues

**1. Connection Refused**
```bash
# Check if database is running
pg_isready -h your-host -p 5432

# Verify connection string format
echo $DATABASE_URL
```

**2. Migration Errors**
```bash
# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Or apply specific migration
npx prisma migrate deploy
```

**3. Prisma Client Issues**
```bash
# Regenerate client
npx prisma generate

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Next Steps

Once database is set up:
1. ✅ Run GEO Audit to assess AI search visibility
2. ✅ Implement structured data (JSON-LD)
3. ✅ Create AI-friendly content
4. ✅ Monitor AI Overview presence and citation rates

---

**Need Help?** Check the logs with:
```bash
vercel logs --follow
```
