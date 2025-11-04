# 🔧 Supabase MCP Server Setup Guide

## 📋 Overview

This guide will help you set up the Supabase MCP (Model Context Protocol) server to execute SQL queries directly from Cursor or other MCP-compatible tools.

## 🎯 What You'll Get

Once configured, you'll be able to:
- ✅ Execute SQL queries via MCP tools
- ✅ List tables, migrations, and extensions
- ✅ Apply migrations programmatically
- ✅ Access Supabase project data securely

## 📍 Step 1: Get Your Supabase Credentials

### Get Project Reference ID

Your project reference ID is: **`gzlgfghpkbqlhgfozjkb`**

You can verify this by checking:
```bash
grep NEXT_PUBLIC_SUPABASE_URL .env
# Should show: https://gzlgfghpkbqlhgfozjkb.supabase.co
```

### Get Access Token

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard
2. **Navigate to**: Account Settings → Access Tokens
3. **Create a new access token** (or use existing)
4. **Copy the token** - you'll need this for MCP configuration

**Alternative**: If you don't see Access Tokens, you may need to use the Supabase CLI:
```bash
supabase login
# This will open browser and authenticate
```

## 📍 Step 2: Configure MCP Server

### For Cursor IDE

MCP configuration in Cursor is typically in:
- `~/.cursor/mcp.json` (user config)
- Or project-specific config

### Create MCP Configuration

Create or edit the MCP configuration file:

```json
{
  "mcpServers": {
    "supabase": {
      "type": "http",
      "url": "https://mcp.supabase.com/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_SUPABASE_ACCESS_TOKEN",
        "X-Project-Ref": "gzlgfghpkbqlhgfozjkb"
      }
    }
  }
}
```

### Alternative Configuration (with project_ref in URL)

```json
{
  "mcpServers": {
    "supabase": {
      "type": "http",
      "url": "https://mcp.supabase.com/mcp?project_ref=gzlgfghpkbqlhgfozjkb",
      "headers": {
        "Authorization": "Bearer YOUR_SUPABASE_ACCESS_TOKEN"
      }
    }
  }
}
```

## 📍 Step 3: Set Up Authentication

### Method 1: Using Supabase CLI (Recommended)

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# This will:
# 1. Open browser for authentication
# 2. Store access token locally
# 3. Enable MCP server to use CLI credentials
```

### Method 2: Using Access Token Directly

1. Get your access token from Supabase dashboard
2. Add it to MCP configuration as shown above
3. Store securely (don't commit to git)

### Method 3: Environment Variables

You can also set environment variables:
```bash
export SUPABASE_ACCESS_TOKEN="your-access-token"
export SUPABASE_PROJECT_REF="gzlgfghpkbqlhgfozjkb"
```

## 📍 Step 4: Verify MCP Connection

### Test Connection

Once configured, test the connection:

```python
# Using Python (if you have MCP client)
from mcp import Client

client = Client("supabase")
result = client.list_tables(project_id="gzlgfghpkbqlhgfozjkb")
print(result)
```

Or test via Cursor:
1. Open Cursor
2. Try using MCP tools (they should appear in tool palette)
3. Execute a simple query

## 📍 Step 5: Execute SQL Queries

### Using MCP Tools Directly

Once configured, you can use MCP tools:

**Query 1: Check RLS Policies**
```python
result = mcp_Supabase_execute_sql(
    project_id="gzlgfghpkbqlhgfozjkb",
    query="""
    SELECT 
        tablename,
        policyname,
        CASE 
            WHEN definition LIKE '%(SELECT auth.uid())%' THEN '✅ Optimized'
            WHEN definition LIKE '%(select auth.uid())%' THEN '✅ Optimized'
            WHEN definition LIKE '%auth.uid()%' THEN '⚠️ Needs Fix'
            ELSE 'N/A'
        END as status
    FROM pg_policies
    WHERE schemaname = 'public'
    ORDER BY tablename;
    """
)
```

**Query 2: Check Index Counts**
```python
result = mcp_Supabase_execute_sql(
    project_id="gzlgfghpkbqlhgfozjkb",
    query="""
    SELECT 
        tablename,
        COUNT(*) as index_count
    FROM pg_indexes
    WHERE schemaname = 'public'
    AND indexname LIKE 'idx_%'
    GROUP BY tablename
    ORDER BY index_count DESC;
    """
)
```

## 🔒 Security Best Practices

1. **Never commit access tokens to git**
   - Add to `.gitignore`
   - Use environment variables
   - Use secrets management

2. **Use least privilege**
   - Create specific access tokens for MCP
   - Limit token permissions if possible

3. **Rotate tokens regularly**
   - Update tokens every 90 days
   - Revoke old tokens

## 🛠️ Troubleshooting

### Error: "You do not have permission to perform this action"

**Solution:**
1. Verify your access token is valid
2. Check project reference ID matches
3. Ensure token has proper permissions
4. Try regenerating access token

### Error: "MCP server not found"

**Solution:**
1. Verify MCP configuration file location
2. Check JSON syntax is valid
3. Restart Cursor/IDE
4. Verify MCP server URL is correct

### Error: "Connection refused"

**Solution:**
1. Check internet connection
2. Verify Supabase service is accessible
3. Check firewall settings
4. Try using Supabase CLI authentication instead

## 📚 Additional Resources

- **Supabase MCP Documentation**: https://supabase.com/docs/guides/mcp
- **Supabase CLI Docs**: https://supabase.com/docs/reference/cli
- **MCP Protocol Spec**: https://modelcontextprotocol.io

## ✅ Verification Checklist

- [ ] Supabase CLI installed and logged in
- [ ] Access token obtained and stored securely
- [ ] MCP configuration file created
- [ ] Project reference ID verified
- [ ] Test connection successful
- [ ] Can execute SQL queries via MCP

## 🎯 Quick Setup Command

```bash
# One-liner to set up (after manual token entry)
echo '{
  "mcpServers": {
    "supabase": {
      "type": "http",
      "url": "https://mcp.supabase.com/mcp?project_ref=gzlgfghpkbqlhgfozjkb",
      "headers": {
        "Authorization": "Bearer YOUR_TOKEN_HERE"
      }
    }
  }
}' > ~/.cursor/mcp.json
```

**Remember to replace `YOUR_TOKEN_HERE` with your actual Supabase access token!**

## 🚀 Next Steps

After setup:
1. Test with a simple query
2. Run your RLS policy check
3. Run your index count check
4. Integrate into your workflow

---

**Need help?** Check the troubleshooting section or verify your credentials in the Supabase dashboard.

