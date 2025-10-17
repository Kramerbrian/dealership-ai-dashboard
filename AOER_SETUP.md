# AOER Tables Setup Guide

## 🚀 Quick Setup

### Option 1: Direct SQL Execution (Recommended)
1. **Copy the SQL**: Open `aoer_tables.sql` in this directory
2. **Connect to your database** using pgAdmin, DBeaver, or any PostgreSQL client
3. **Execute the SQL** - it will create all tables with proper partitioning

### Option 2: Node.js Script
```bash
# Make sure you have DATABASE_URL set in .env.local
node scripts/create-aoer-tables.js
```

### Option 3: Manual psql Command
```bash
# If you have psql installed and DATABASE_URL set
psql $DATABASE_URL -f aoer_tables.sql
```

## 📋 What Gets Created

### Tables
- **`aoer_queries`** - Main partitioned table for query data
- **`aoer_queries_2025q4`** - Q4 2025 partition (Oct-Dec 2025)
- **`aoer_queries_2026q1`** - Q1 2026 partition (Jan-Mar 2026)
- **`aiv_raw_signals`** - AI visibility raw signal data
- **`aoer_failures`** - Job failure tracking

### Features
- **Partitioning**: Automatic routing based on `week_start` date
- **Constraints**: Intent validation (informational, commercial, navigational, other)
- **Indexes**: Optimized for performance
- **UUID Primary Keys**: Using `gen_random_uuid()`

## 🔧 Environment Setup

Create a `.env.local` file with:
```env
DATABASE_URL="postgresql://username:password@host:port/database"
```

## ✅ Verification

After running the setup, verify tables were created:
```sql
SELECT tablename FROM pg_tables 
WHERE tablename IN ('aoer_queries', 'aoer_queries_2025q4', 'aoer_queries_2026q1', 'aiv_raw_signals', 'aoer_failures');
```

## 🎯 Next Steps

1. **Sync Prisma**: `npx prisma db push`
2. **Test the service**: Use `src/lib/aoer-service.ts`
3. **Insert test data**: Try the example queries

## 🆘 Troubleshooting

### "syntax error at or near 'cat'"
- This happens when shell commands are executed as SQL
- Use the direct SQL file (`aoer_tables.sql`) instead
- Or use the Node.js script (`scripts/create-aoer-tables.js`)

### "DATABASE_URL not set"
- Create `.env.local` file with your database connection string
- Make sure the URL is properly formatted

### "Permission denied"
- Check your database user has CREATE TABLE permissions
- Verify the connection string is correct

---

**Ready to go!** The AOER tables will be created with proper partitioning and constraints. 🚀
