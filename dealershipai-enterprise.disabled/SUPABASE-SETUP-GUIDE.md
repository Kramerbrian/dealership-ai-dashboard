# 🗄️ Supabase Database Setup Guide

This guide will help you set up the Supabase database for your DealershipAI Enterprise application.

## 🚀 Quick Start

### 1. Create Supabase Project

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Click "New Project"

2. **Configure Project**
   - **Name**: `dealershipai-enterprise`
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Start with Free tier

3. **Wait for Setup**
   - Project creation takes 2-3 minutes
   - You'll get a notification when ready

### 2. Get Database Credentials

Once your project is ready:

1. **Go to Settings → Database**
2. **Copy the connection string**:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```

3. **Go to Settings → API**
4. **Copy these values**:
   - `Project URL`: `https://[PROJECT-REF].supabase.co`
   - `anon public key`: `eyJ...` (starts with eyJ)
   - `service_role key`: `eyJ...` (starts with eyJ)

### 3. Set Up Database Schema

1. **Go to SQL Editor** in Supabase Dashboard
2. **Create a new query**
3. **Copy and paste** the contents of `supabase-schema.sql`
4. **Run the query** (this will create all tables, indexes, and policies)

### 4. Configure Environment Variables

Add these to your `.env.local` file:

```bash
# Supabase Configuration
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT-REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."
SUPABASE_SERVICE_ROLE_KEY="eyJ..."
```

### 5. Test Database Connection

Run this command to test the connection:

```bash
npm run db:test
```

## 📊 Database Schema Overview

### Core Tables

| Table | Purpose | Key Features |
|-------|---------|--------------|
| `tenants` | Organizations/Dealerships | Multi-tenant hierarchy, subscription management |
| `users` | User accounts | Role-based access control, Clerk integration |
| `dealership_data` | AI scoring data | Performance metrics, competitor analysis |
| `ai_query_results` | AI query history | Cost tracking, performance monitoring |
| `reviews` | Customer reviews | Sentiment analysis, response management |
| `audit_logs` | System activity | Security, compliance, debugging |

### Security Features

✅ **Row Level Security (RLS)** - Tenant isolation  
✅ **JWT Authentication** - Clerk integration  
✅ **Role-based Access** - 4-tier permission system  
✅ **Audit Logging** - Complete activity tracking  
✅ **API Key Management** - Secure external access  

## 🔧 Advanced Configuration

### 1. Enable Real-time (Optional)

For real-time features like live scoring updates:

1. **Go to Database → Replication**
2. **Enable replication** for tables you want to sync
3. **Add to your app**:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Subscribe to real-time updates
supabase
  .channel('dealership_data')
  .on('postgres_changes', 
    { event: 'UPDATE', schema: 'public', table: 'dealership_data' },
    (payload) => console.log('Data updated:', payload)
  )
  .subscribe()
```

### 2. Set Up Database Backups

1. **Go to Settings → Database**
2. **Enable Point-in-Time Recovery**
3. **Set backup retention** (7 days for free tier)

### 3. Configure Connection Pooling

For production, use connection pooling:

```bash
# Update DATABASE_URL to use pgbouncer
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:6543/postgres?pgbouncer=true&connection_limit=1"
```

## 🧪 Testing the Setup

### 1. Test Database Connection

```bash
# Test basic connection
npm run db:test

# Test with Prisma
npx prisma db pull
npx prisma generate
```

### 2. Test RLS Policies

```sql
-- Test as different users
SET LOCAL "request.jwt.claims" = '{"sub": "user_terry_admin"}';
SELECT * FROM dealership_data; -- Should only see Terry Reid data

SET LOCAL "request.jwt.claims" = '{"sub": "user_superadmin"}';
SELECT * FROM tenants; -- Should see all tenants
```

### 3. Test API Integration

```bash
# Test scoring API
curl "http://localhost:3000/api/scores?dealerId=demo-dealer&domain=terryreidhyundai.com"

# Test auth endpoints
curl "http://localhost:3000/api/auth/providers"
```

## 🚨 Troubleshooting

### Common Issues

1. **Connection Refused**
   - Check if project is fully initialized
   - Verify DATABASE_URL format
   - Ensure password is correct

2. **RLS Policy Errors**
   - Check JWT token format
   - Verify user exists in database
   - Check tenant_id relationships

3. **Permission Denied**
   - Verify service role key
   - Check RLS policies
   - Ensure proper user context

### Debug Commands

```bash
# Check database connection
npx prisma db pull

# View database schema
npx prisma studio

# Test specific queries
npx prisma db execute --file test-queries.sql
```

## 📈 Performance Optimization

### 1. Index Optimization

The schema includes optimized indexes for:
- Tenant-based queries
- User lookups
- Time-based filtering
- Full-text search

### 2. Query Optimization

```sql
-- Use these patterns for better performance
EXPLAIN ANALYZE SELECT * FROM dealership_data 
WHERE tenant_id = $1 
ORDER BY updated_at DESC 
LIMIT 10;
```

### 3. Connection Management

```typescript
// Use connection pooling in production
const db = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL + "?pgbouncer=true&connection_limit=1"
    }
  }
})
```

## 🔒 Security Best Practices

1. **Never expose service role key** in client-side code
2. **Use RLS policies** for all data access
3. **Audit all database changes** with audit_logs
4. **Rotate API keys** regularly
5. **Monitor access patterns** for anomalies

## 📊 Monitoring

### 1. Database Metrics

- **Go to Settings → Database**
- **Monitor**: Connection count, query performance, storage usage

### 2. Query Performance

```sql
-- Check slow queries
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;
```

### 3. Error Monitoring

Set up alerts for:
- High error rates
- Slow queries (>1s)
- Connection pool exhaustion
- RLS policy violations

## 🚀 Production Deployment

### 1. Environment Variables

Set these in your Vercel dashboard:

```bash
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT-REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### 2. Database Migrations

```bash
# Run migrations in production
npx prisma db push --accept-data-loss

# Or use Supabase migrations
supabase db push
```

### 3. Monitoring Setup

- Enable Supabase monitoring
- Set up error tracking (Sentry)
- Configure performance monitoring
- Set up backup verification

## 📚 Next Steps

Once Supabase is configured:

1. ✅ **Test all API endpoints**
2. ✅ **Verify RLS policies work**
3. ✅ **Set up monitoring**
4. ✅ **Configure backups**
5. ✅ **Deploy to production**

## 🔗 Useful Links

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

---

**Need Help?** Check the troubleshooting section or create an issue in the repository.
