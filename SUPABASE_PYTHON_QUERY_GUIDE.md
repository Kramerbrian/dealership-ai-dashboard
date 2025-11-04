# 🐍 Supabase SQL Query Runner - Python Guide

## 📋 Overview

This guide shows how to run SQL queries against Supabase using Python, with multiple methods available.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
pip3 install -r scripts/requirements-query.txt
```

Or individually:
```bash
pip3 install psycopg2-binary supabase requests
```

### 2. Run Queries

**From SQL file:**
```bash
python3 scripts/supabase_query_runner.py scripts/run-policy-check.sql
python3 scripts/supabase_query_runner.py scripts/run-index-check.sql
```

**With inline query:**
```bash
python3 scripts/supabase_query_runner.py --query "SELECT tablename, COUNT(*) FROM pg_indexes WHERE schemaname = 'public' GROUP BY tablename;"
```

## 🔧 Available Methods

### Method 1: Direct PostgreSQL Connection (psycopg2)

**Pros:**
- ✅ Direct SQL execution
- ✅ Supports all PostgreSQL features
- ✅ Fast and efficient

**Cons:**
- ❌ May be blocked by firewall/IP restrictions
- ❌ Requires direct database access

**Usage:**
```python
from scripts.supabase_query_runner import execute_with_psycopg2
results = execute_with_psycopg2(query, database_url)
```

### Method 2: Supabase Python Client

**Pros:**
- ✅ Official Supabase library
- ✅ Handles authentication
- ✅ Works through Supabase REST API

**Cons:**
- ❌ Doesn't support arbitrary SQL queries
- ❌ Only supports RPC functions and table queries

**Note:** This method is limited. For arbitrary SQL, use Method 1 or Method 3.

### Method 3: Supabase MCP (Model Context Protocol)

**Pros:**
- ✅ Uses Supabase Management API
- ✅ Proper authentication
- ✅ Supports all SQL operations

**Cons:**
- ❌ Requires MCP server setup
- ❌ Needs proper authentication configuration

**Setup:**
1. Configure MCP server with Supabase credentials
2. Use MCP tools directly in your environment

## 📊 Example Usage

### Check RLS Policies

```bash
python3 scripts/supabase_query_runner.py scripts/run-policy-check.sql
```

**Expected Output:**
```
🔧 Supabase SQL Query Runner
================================================================================
📄 Query:
SELECT tablename, policyname, CASE WHEN ...
================================================================================

🔄 Method 1: Trying direct PostgreSQL connection (psycopg2)...
✅ Query executed successfully! (15 rows)
================================================================================
tablename            | policyname                  | status
--------------------------------------------------------------------------------
users                | Users can view own data     | ✅ Optimized
dealerships          | Users can view dealerships  | ✅ Optimized
...
```

### Check Index Counts

```bash
python3 scripts/supabase_query_runner.py scripts/run-index-check.sql
```

## 🔐 Authentication

### Using .env File

The script automatically reads from `.env`:
```bash
DATABASE_URL=postgresql://postgres:password@host:port/database
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Environment Variables

You can also set environment variables:
```bash
export DATABASE_URL="postgresql://..."
python3 scripts/supabase_query_runner.py scripts/run-policy-check.sql
```

## 🛠️ Troubleshooting

### Connection Errors

**Error:** `No route to host` or `Connection refused`

**Solution:**
1. Check if your IP is whitelisted in Supabase dashboard
2. Try using connection pooler (port 6543)
3. Use Supabase SQL Editor instead

### Missing Dependencies

**Error:** `psycopg2 not installed`

**Solution:**
```bash
pip3 install psycopg2-binary
```

### Permission Errors

**Error:** `You do not have permission to perform this action`

**Solution:**
- For MCP: Check MCP server authentication
- For direct connection: Verify database credentials
- Use Supabase SQL Editor as fallback

## 📝 SQL Files

Ready-to-use SQL files:
- `scripts/run-policy-check.sql` - Check RLS policy optimization
- `scripts/run-index-check.sql` - Check index counts
- `scripts/check-policies.sql` - Full policy check
- `scripts/check-indexes.sql` - Full index check

## 🎯 Recommended Approach

1. **First try:** Direct PostgreSQL connection (psycopg2)
2. **If blocked:** Use Supabase SQL Editor
3. **For automation:** Set up MCP server with proper auth

## 🔗 Related Files

- `scripts/supabase_query_runner.py` - Main Python script
- `scripts/run_supabase_sql.py` - Alternative implementation
- `scripts/run_supabase_mcp.py` - MCP preparation script
- `scripts/requirements-query.txt` - Python dependencies

## 💡 Tips

- Use connection pooler (port 6543) for better reliability
- Check Supabase dashboard for IP whitelisting
- Use Supabase SQL Editor for one-off queries
- Set up MCP for automation and CI/CD

