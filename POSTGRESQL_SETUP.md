# 🐘 PostgreSQL Setup Guide

## Option 1: Vercel Postgres (Recommended - Easiest)

### Setup Link: [Vercel Storage](https://vercel.com/storage)
1. Go to [vercel.com/storage](https://vercel.com/storage)
2. Click "Create Database"
3. Select "Postgres"
4. Choose region (closest to your users)
5. Copy connection string
6. Add to Vercel environment variables as `DATABASE_URL`

### Benefits:
- ✅ Integrated with Vercel
- ✅ Automatic backups
- ✅ SSL enabled
- ✅ No additional setup required

---

## Option 2: Supabase (Popular Alternative)

### Setup Link: [Supabase](https://supabase.com)
1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Create new project
4. Go to Settings → Database
5. Copy connection string
6. Add to Vercel environment variables as `DATABASE_URL`

### Additional Supabase Keys:
- `NEXT_PUBLIC_SUPABASE_URL`: Your project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your anon key

### Benefits:
- ✅ Free tier available
- ✅ Built-in authentication
- ✅ Real-time subscriptions
- ✅ Dashboard interface

---

## Option 3: Railway (Developer Friendly)

### Setup Link: [Railway](https://railway.app)
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Create new project
4. Add PostgreSQL service
5. Copy connection string
6. Add to Vercel environment variables as `DATABASE_URL`

### Benefits:
- ✅ $5/month for production
- ✅ Automatic deployments
- ✅ Easy scaling

---

## Option 4: Render (Simple & Reliable)

### Setup Link: [Render](https://render.com)
1. Go to [render.com](https://render.com)
2. Sign up for free account
3. Create new PostgreSQL service
4. Copy connection string
5. Add to Vercel environment variables as `DATABASE_URL`

### Benefits:
- ✅ Free tier available
- ✅ Automatic backups
- ✅ SSL enabled
- ✅ Simple interface

---

## Option 5: PlanetScale (MySQL Alternative)

### Setup Link: [PlanetScale](https://planetscale.com)
1. Go to [planetscale.com](https://planetscale.com)
2. Create new database
3. Get connection string
4. Add to Vercel environment variables as `DATABASE_URL`

### Benefits:
- ✅ Serverless MySQL
- ✅ Branching for databases
- ✅ Free tier available

---

## Database Migration Commands

### After setting up PostgreSQL:

```bash
# Install Prisma CLI (if not already installed)
npm install -g prisma

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Optional: Seed database with sample data
npm run db:seed
```

### Test Database Connection:
```bash
# Test connection
npx prisma db pull

# View database in Prisma Studio
npx prisma studio
```

## Environment Variables to Update

Once you have your PostgreSQL connection string:

```bash
# Update DATABASE_URL in Vercel
npx vercel env rm DATABASE_URL production
npx vercel env add DATABASE_URL production
# Paste your connection string when prompted
```

## Recommended Setup for DealershipAI

### For Development:
- **Vercel Postgres** (easiest integration)

### For Production:
- **Supabase** (best features)
- **Railway** (most reliable)
- **Render** (most cost-effective)

## Connection String Format
```
postgresql://username:password@host:port/database_name?sslmode=require
```

## Security Best Practices
- ✅ Use SSL/TLS connections
- ✅ Enable connection pooling
- ✅ Set up regular backups
- ✅ Use environment variables for credentials
- ✅ Monitor connection limits

## Troubleshooting

### Common Issues:
1. **Connection refused**: Check host and port
2. **Authentication failed**: Verify username/password
3. **SSL required**: Add `?sslmode=require` to connection string
4. **Database not found**: Create database first

### Test Connection:
```bash
# Test with psql (if installed)
psql "your-connection-string"

# Test with Node.js
node -e "
const { Client } = require('pg');
const client = new Client({ connectionString: process.env.DATABASE_URL });
client.connect().then(() => {
  console.log('✅ Database connected successfully');
  client.end();
}).catch(err => {
  console.log('❌ Database connection failed:', err.message);
});
"
```

## Next Steps After Setup

1. **Update environment variables** in Vercel
2. **Run database migrations**
3. **Test the connection**
4. **Redeploy the application**
5. **Verify everything works**

Your DealershipAI platform will be fully operational! 🚀
