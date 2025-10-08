# Database Migrations & Seeds

This directory contains Knex migrations and seeds for the DealershipAI platform.

## Setup

### 1. Configure Database Connection

Ensure your `.env` file has the correct database connection string:

```bash
# PostgreSQL (Standard)
DATABASE_URL=postgresql://user:password@localhost:5432/dealershipai

# Or Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_DB_PASSWORD=your_password
```

### 2. Run Migrations

```bash
# Run all pending migrations
npm run db:migrate

# Check migration status
npm run db:migrate:status

# Rollback last migration
npm run db:migrate:rollback

# Rollback all migrations
npm run db:migrate:rollback --all
```

### 3. Seed Database

```bash
# Run all seed files
npm run db:seed
```

### 4. Reset Database (Development Only)

```bash
# Rollback all migrations, re-run migrations, and seed data
npm run db:reset
```

## Creating New Migrations

```bash
# Create a new migration
npm run db:migrate:make create_new_table

# Example: Create a migration for a new feature
npm run db:migrate:make add_feature_flags_to_tenants
```

## Creating New Seeds

```bash
# Create a new seed file
npm run db:seed:make 002_more_data
```

## Migration Structure

Migrations are located in `db/migrations/` and follow this naming convention:
```
YYYYMMDDHHMMSS_description.js
```

Example:
```
20250106000001_create_core_tables.js
20250106000002_create_feature_tables.js
```

## Seed Structure

Seeds are located in `db/seeds/` and run in alphabetical order:
```
001_initial_data.js
002_additional_data.js
```

## Database Schema

### Core Tables

1. **tenants** - Multi-tenant architecture
   - Supports enterprise, dealership, and single tenant types
   - Hierarchical structure with parent_id

2. **users** - User management with Clerk integration
   - Links to Clerk for authentication
   - Role-based access control (superadmin, enterprise_admin, dealership_admin, user)

3. **dealerships** - Dealer information
   - Links to tenants
   - Stores dealer contact and location data

4. **subscriptions** - Stripe subscription management
   - Links to tenants
   - Tracks subscription status, plans, and billing periods

5. **audit_log** - Activity tracking
   - Logs all user actions
   - Tenant-isolated

### Feature Tables

1. **dealership_data** - AI visibility scores
   - Stores scoring results
   - Links to tenants

2. **ai_visibility_audits** - Audit history
   - Complete audit results with all scores
   - Links to dealerships

3. **chat_sessions** - ACP chat interactions
   - Stores chat history
   - Session-based tracking

4. **market_scans** - Market analysis
   - Competitive market scans
   - Tied to dealerships

5. **mystery_shops** - Mystery shopping data
   - Shopping results and ratings
   - Links to dealerships

6. **reviews** - Review management
   - Multi-platform review aggregation
   - Links to dealerships

7. **competitors** - Competitor tracking
   - Competitor analysis and scoring
   - Links to dealerships

8. **optimization_recommendations** - AI recommendations
   - Generated optimization suggestions
   - Priority and impact tracking

9. **analyses** - Premium analysis results
   - Paid analysis storage
   - Access control

## Row Level Security (RLS)

All tables have Row Level Security enabled to ensure tenant isolation. Users can only access data belonging to their tenant.

## Helper Functions

The database includes several helper functions:

1. **get_user_tenant_id(clerk_id)** - Get tenant ID for a user
2. **get_user_role(clerk_id)** - Get role for a user
3. **get_accessible_tenants(clerk_id)** - Get all tenants a user can access

## Triggers

Auto-updating `updated_at` timestamps are implemented via triggers on:
- tenants
- users
- dealerships
- subscriptions
- dealership_data
- ai_visibility_audits
- reviews
- competitors
- optimization_recommendations

## Production Deployment

### With Vercel + Supabase

1. Set `DATABASE_URL` in Vercel environment variables
2. Run migrations via Vercel CLI or GitHub Actions:
   ```bash
   vercel env pull .env.local
   npm run db:migrate
   ```

### With Docker

Migrations run automatically on container startup if configured in `docker-compose.yml`:
```yaml
services:
  app:
    command: sh -c "npm run db:migrate && npm start"
```

### With CI/CD (GitHub Actions)

```yaml
- name: Run Database Migrations
  run: npm run db:migrate
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

## Troubleshooting

### Migration Errors

If a migration fails:
```bash
# Check current status
npm run db:migrate:status

# Rollback the failed migration
npm run db:migrate:rollback

# Fix the migration file and re-run
npm run db:migrate
```

### Connection Issues

Ensure your database is running and accessible:
```bash
# Test connection with psql
psql $DATABASE_URL

# Or with Knex
npx knex migrate:currentVersion
```

### Supabase Connection

For Supabase, ensure you're using the correct connection string:
- Use the "Connection string" from Supabase Dashboard > Settings > Database
- Format: `postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`

## Best Practices

1. **Always test migrations locally first** before running in production
2. **Create backups** before running migrations in production
3. **Use transactions** in migrations (Knex handles this automatically)
4. **Never edit existing migrations** - create new ones instead
5. **Keep migrations small** - one logical change per migration
6. **Test rollbacks** - ensure your `down()` functions work correctly

## Support

For questions or issues, contact the DealershipAI team or open an issue in the repository.
