# ✅ Supabase MCP Server Setup - Complete Guide

## 🎯 What We've Set Up

You now have everything needed to use Supabase MCP tools:

1. ✅ **MCP Configuration File**: `~/.cursor/mcp.json`
2. ✅ **Setup Scripts**: Automated configuration helpers
3. ✅ **Documentation**: Complete setup guide
4. ✅ **Project Reference**: `gzlgfghpkbqlhgfozjkb` (linked project)

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)

```bash
# Run the setup script
bash scripts/update-mcp-supabase-config.sh
```

This will:
- Check your Supabase CLI authentication
- Update MCP configuration with project reference
- Set up authentication (CLI or token-based)

### Option 2: Manual Configuration

1. **Get Access Token**:
   - Go to: https://supabase.com/dashboard/account/tokens
   - Generate new token
   - Copy it

2. **Update MCP Config**:
   Edit `~/.cursor/mcp.json` and update the Supabase entry:
   ```json
   "Supabase": {
     "type": "http",
     "url": "https://mcp.supabase.com/mcp?project_ref=gzlgfghpkbqlhgfozjkb",
     "headers": {
       "Authorization": "Bearer YOUR_ACCESS_TOKEN"
     }
   }
   ```

3. **Restart Cursor IDE**

## 📋 Current Configuration

Your MCP config should look like this:

```json
{
  "mcpServers": {
    "Supabase": {
      "type": "http",
      "url": "https://mcp.supabase.com/mcp?project_ref=gzlgfghpkbqlhgfozjkb",
      "headers": {
        "Authorization": "Bearer YOUR_TOKEN"
      }
    }
  }
}
```

## ✅ Verification Steps

1. **Check Supabase CLI Auth**:
   ```bash
   supabase projects list
   ```
   Should show your project: `gzlgfghpkbqlhgfozjkb`

2. **Verify MCP Config**:
   ```bash
   cat ~/.cursor/mcp.json | grep -A 5 "Supabase"
   ```

3. **Restart Cursor IDE**

4. **Test MCP Tools**:
   - MCP tools should appear in Cursor's tool palette
   - Try: `mcp_Supabase_list_projects`
   - Try: `mcp_Supabase_execute_sql`

## 🎯 Using MCP Tools

Once configured, you can use MCP tools directly:

### List Projects
```
mcp_Supabase_list_projects()
```

### Execute SQL Queries
```python
result = mcp_Supabase_execute_sql(
    project_id="gzlgfghpkbqlhgfozjkb",
    query="SELECT tablename, COUNT(*) FROM pg_indexes WHERE schemaname = 'public' GROUP BY tablename;"
)
```

### Check RLS Policies
```python
result = mcp_Supabase_execute_sql(
    project_id="gzlgfghpkbqlhgfozjkb",
    query="""
    SELECT 
        tablename,
        policyname,
        CASE 
            WHEN definition LIKE '%(SELECT auth.uid())%' THEN '✅ Optimized'
            WHEN definition LIKE '%auth.uid()%' THEN '⚠️ Needs Fix'
            ELSE 'N/A'
        END as status
    FROM pg_policies
    WHERE schemaname = 'public'
    ORDER BY tablename;
    """
)
```

## 🔧 Troubleshooting

### Error: "You do not have permission"

**Solution:**
1. Verify access token is valid
2. Check project reference matches: `gzlgfghpkbqlhgfozjkb`
3. Ensure token has proper permissions
4. Try regenerating access token

### Error: "MCP server not found"

**Solution:**
1. Verify `~/.cursor/mcp.json` exists
2. Check JSON syntax is valid
3. Restart Cursor IDE
4. Verify URL is correct: `https://mcp.supabase.com/mcp?project_ref=gzlgfghpkbqlhgfozjkb`

### MCP Tools Not Showing

**Solution:**
1. Restart Cursor IDE completely
2. Check MCP config file location
3. Verify Supabase entry is in config
4. Check Cursor logs for errors

## 📚 Documentation Files

- **`MCP_SUPABASE_SETUP_GUIDE.md`** - Complete setup guide
- **`scripts/update-mcp-supabase-config.sh`** - Automated setup script
- **`scripts/setup-mcp-supabase.sh`** - Initial setup script

## 🎉 Next Steps

1. **Run the setup script** to configure authentication
2. **Restart Cursor IDE** to load MCP configuration
3. **Test MCP tools** with a simple query
4. **Run your RLS policy check** via MCP
5. **Run your index count check** via MCP

## 💡 Tips

- Use Supabase CLI authentication for convenience
- Store access tokens securely (never commit to git)
- Use project reference in URL for better performance
- Test with simple queries first
- Check MCP logs in Cursor for debugging

---

**Ready to use!** Run the setup script and restart Cursor to start using Supabase MCP tools.

