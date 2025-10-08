# Database Setup Guide

Complete guide for setting up database migrations with Knex and tier-based feature gating.

## 🚀 Quick Start

```bash
# 1. Install dependencies (already done)
npm install

# 2. Set up your database connection
cp .env.example .env
# Edit .env and add your DATABASE_URL

# 3. Run migrations
npm run db:migrate

# 4. Seed initial data
npm run db:seed

# 5. Verify setup
npm run db:migrate:status
```

## 📋 Prerequisites

- PostgreSQL database (local or Supabase)
- Node.js >= 18.0.0
- npm >= 8.0.0

## 🔧 Configuration

### Option 1: Local PostgreSQL

Add to `.env`:
```bash
DATABASE_URL=postgresql://user:password@localhost:5432/dealershipai
```

### Option 2: Supabase

Add to `.env`:
```bash
# Get these from Supabase Dashboard > Settings > Database
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_DB_PASSWORD=your_password

# Or use direct connection string
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

### Option 3: Docker

```bash
docker-compose up -d postgres
DATABASE_URL=postgresql://dealershipai:password@localhost:5432/dealershipai
```

## 📦 Database Structure

### Core Tables

| Table | Purpose |
|-------|---------|
| `tenants` | Multi-tenant architecture |
| `users` | User management (Clerk integration) |
| `dealerships` | Dealer information |
| `subscriptions` | Stripe subscription tracking |
| `audit_log` | Activity logging |

### Feature Tables

| Table | Purpose |
|-------|---------|
| `dealership_data` | AI visibility scores |
| `ai_visibility_audits` | Audit history |
| `chat_sessions` | ACP chat interactions |
| `market_scans` | Market analysis |
| `mystery_shops` | Mystery shopping data |
| `reviews` | Review management |
| `competitors` | Competitor tracking |
| `optimization_recommendations` | AI recommendations |
| `analyses` | Premium analysis results |

## 🎯 Tier-Based Feature Access

### Setting Up Feature Gates

The tier-features system enforces subscription limits. Configure in `.env`:

```bash
# Session Limits
TIER_FREE_SESSIONS=0
TIER_PRO_SESSIONS=25
TIER_ENTERPRISE_SESSIONS=125

# Cache TTL (hours)
DEALER_CACHE_TTL=72
MARKET_CACHE_TTL_PRO=48
MARKET_CACHE_TTL_ENTERPRISE=24
```

### Using in API Routes

```typescript
import { canAccessFeature, enforceFeatureAccess } from '@/lib/tier-features';

export async function POST(req: NextRequest) {
  const userTier = 'pro'; // Fetch from database
  const currentUsage = 15; // Fetch from database

  // Method 1: Check access
  if (!canAccessFeature(userTier, 'chat_sessions', currentUsage)) {
    return NextResponse.json(
      { error: 'Limit reached' },
      { status: 403 }
    );
  }

  // Method 2: Enforce access (throws error)
  try {
    enforceFeatureAccess(userTier, 'market_scans', currentUsage);
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 403 }
    );
  }

  // Continue with request...
}
```

### Available Features

| Feature | Free | Pro | Premium | Enterprise |
|---------|------|-----|---------|------------|
| Chat Sessions | 0 | 25 | 100 | 125 |
| Market Scans | ❌ | 5 | 20 | ∞ |
| Mystery Shops | ❌ | 2 | 10 | ∞ |
| Competitor Tracking | ❌ | 5 | 20 | ∞ |
| Data Export | ❌ | ✅ | ✅ | ✅ |
| API Access | ❌ | ❌ | ✅ | ✅ |
| Custom Branding | ❌ | ❌ | ✅ | ✅ |
| Priority Support | ❌ | ❌ | ✅ | ✅ |
| Advanced Analytics | ❌ | ✅ | ✅ | ✅ |
| Real-Time Alerts | ❌ | ❌ | ✅ | ✅ |
| Multi-Location | ❌ | ❌ | ✅ | ✅ |
| White Label | ❌ | ❌ | ❌ | ✅ |

## 🛠️ Common Tasks

### Create New Migration

```bash
npm run db:migrate:make add_new_feature
```

Edit the generated file in `db/migrations/`:
```javascript
exports.up = async function(knex) {
  await knex.schema.createTable('new_table', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.text('name').notNullable();
    table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
  });
};

exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('new_table');
};
```

### Add New Seed Data

```bash
npm run db:seed:make 002_additional_dealers
```

### Check Migration Status

```bash
npm run db:migrate:status
```

### Rollback Last Migration

```bash
npm run db:migrate:rollback
```

### Reset Database (Development)

```bash
npm run db:reset
```

## 🔐 Row Level Security (RLS)

All tables have RLS policies for multi-tenant isolation:

```sql
-- Example: Users can only see their tenant data
CREATE POLICY "tenant_isolation" ON dealerships
  FOR ALL USING (
    tenant_id = (SELECT tenant_id FROM users WHERE clerk_id = auth.jwt() ->> 'sub')
  );
```

## 🔄 Using Database in Code

### Direct Knex Usage

```typescript
import db, { tables } from '@/lib/db';

// Get all dealerships for a tenant
const dealerships = await tables.dealerships()
  .where('tenant_id', tenantId)
  .select('*');

// Create a new chat session
await tables.chatSessions().insert({
  tenant_id: tenantId,
  user_id: userId,
  session_token: 'unique_token',
  messages: JSON.stringify([]),
});

// Update dealership data
await tables.dealershipData()
  .where('id', dealershipId)
  .update({
    ai_visibility_score: 85,
    last_analyzed: new Date(),
  });
```

### With Transactions

```typescript
import { transaction } from '@/lib/db';

await transaction(async (trx) => {
  const [dealership] = await trx('dealerships')
    .insert({ name: 'New Dealer', tenant_id: tenantId })
    .returning('*');

  await trx('dealership_data').insert({
    tenant_id: tenantId,
    dealership_url: dealership.website_url,
  });

  // Both operations succeed or both fail
});
```

## 📊 Monitoring & Maintenance

### Check Connection

```bash
# Via psql
psql $DATABASE_URL

# Via Knex
npx knex migrate:currentVersion
```

### View Current Schema

```bash
psql $DATABASE_URL -c "\dt"
```

### Backup Database

```bash
pg_dump $DATABASE_URL > backup.sql
```

### Restore Database

```bash
psql $DATABASE_URL < backup.sql
```

## 🚢 Production Deployment

### Vercel + Supabase

1. Add `DATABASE_URL` to Vercel environment variables
2. Add build command to `package.json`:
   ```json
   {
     "scripts": {
       "build": "npm run db:migrate && next build"
     }
   }
   ```

### Docker

Add to `Dockerfile`:
```dockerfile
CMD ["sh", "-c", "npm run db:migrate && npm start"]
```

### GitHub Actions

```yaml
- name: Run Migrations
  run: npm run db:migrate
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

## ❗ Troubleshooting

### Migration Fails

```bash
# Check what went wrong
npm run db:migrate:status

# Rollback and try again
npm run db:migrate:rollback
# Fix the migration file
npm run db:migrate
```

### Connection Refused

- Check if PostgreSQL is running: `pg_isready`
- Verify connection string in `.env`
- Check firewall rules for remote databases

### Supabase SSL Error

Add to connection string:
```
?sslmode=require
```

Or set in `.env`:
```bash
DATABASE_SSL=true
```

### Permission Denied

Ensure database user has necessary permissions:
```sql
GRANT ALL ON ALL TABLES IN SCHEMA public TO your_user;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO your_user;
```

## 📚 Additional Resources

- [Knex.js Documentation](https://knexjs.org/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Supabase Documentation](https://supabase.com/docs)

## 🆘 Support

For issues or questions:
1. Check the [db/README.md](./db/README.md)
2. Review [tier-features example](./lib/examples/tier-features-example.ts)
3. Open an issue in the repository

## ✅ Verification Checklist

After setup, verify:

- [ ] Database connection successful
- [ ] All migrations applied (`npm run db:migrate:status`)
- [ ] Seed data inserted
- [ ] Can query tables via code
- [ ] Tier features work correctly
- [ ] RLS policies active (if using Supabase)
- [ ] Environment variables set correctly
- [ ] Backup strategy in place for production

## 🎉 You're Ready!

Your database is now configured with:
- ✅ Proper schema with migrations
- ✅ Row-level security for multi-tenancy
- ✅ Tier-based feature gating
- ✅ Sample seed data
- ✅ Type-safe database helpers

Start building your features!
