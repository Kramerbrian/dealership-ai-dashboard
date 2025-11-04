# 🔄 Restart Cursor to Load Supabase MCP Configuration

## ✅ Setup Complete!

Your Supabase MCP configuration has been updated with:
- ✅ Project Reference: `gzlgfghpkbqlhgfozjkb`
- ✅ MCP URL with project reference
- ✅ Authentication placeholder (needs token or CLI auth)

## 🔄 Restart Cursor IDE

### Step 1: Quit Cursor Completely

**macOS:**
```
Cursor → Quit Cursor
```
Or press: `Cmd + Q`

**Windows/Linux:**
```
File → Exit
```
Or close all Cursor windows

### Step 2: Reopen Cursor

1. Open Cursor IDE again
2. Open your project: `/Users/briankramer/dealership-ai-dashboard`
3. Wait for MCP servers to initialize (check status bar)

### Step 3: Verify MCP Tools

1. **Check MCP Status**:
   - Look for MCP indicator in status bar
   - Should show connected servers

2. **Test Supabase MCP**:
   - Try using: `mcp_Supabase_list_projects`
   - Should return your Supabase projects

3. **Execute SQL Query**:
   ```python
   result = mcp_Supabase_execute_sql(
       project_id="gzlgfghpkbqlhgfozjkb",
       query="SELECT tablename, COUNT(*) FROM pg_indexes WHERE schemaname = 'public' GROUP BY tablename;"
   )
   ```

## 🔐 Authentication Options

### Option 1: Supabase CLI (Recommended)

If you're already authenticated with Supabase CLI:
```bash
supabase login
```

The MCP server should use CLI credentials automatically.

### Option 2: Access Token

1. Get token from: https://supabase.com/dashboard/account/tokens
2. Update `~/.cursor/mcp.json`:
   ```json
   "headers": {
     "Authorization": "Bearer YOUR_ACTUAL_TOKEN"
   }
   ```
3. Restart Cursor again

## 🧪 Test Queries

After restart, test these queries:

### Query 1: Check RLS Policies
```python
mcp_Supabase_execute_sql(
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

### Query 2: Check Index Counts
```python
mcp_Supabase_execute_sql(
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

## ⚠️ Troubleshooting

### MCP Tools Not Showing

1. **Check MCP Config**:
   ```bash
   cat ~/.cursor/mcp.json | grep -A 5 "Supabase"
   ```

2. **Verify JSON Syntax**:
   ```bash
   python3 -m json.tool ~/.cursor/mcp.json > /dev/null && echo "✅ Valid JSON"
   ```

3. **Check Cursor Logs**:
   - View → Output → Select "MCP" or "Logs"
   - Look for Supabase connection errors

### "Permission Denied" Error

1. **Verify Access Token**:
   - Check token is valid
   - Ensure token hasn't expired
   - Regenerate if needed

2. **Check Project Reference**:
   - Verify: `gzlgfghpkbqlhgfozjkb` matches your project
   - Check: `supabase projects list`

### Connection Failed

1. **Check Internet Connection**
2. **Verify Supabase Service Status**
3. **Try Supabase CLI**:
   ```bash
   supabase projects list
   ```

## ✅ Success Indicators

After restart, you should see:
- ✅ MCP indicator in Cursor status bar
- ✅ Supabase tools available in tool palette
- ✅ Can execute `mcp_Supabase_list_projects`
- ✅ Can run SQL queries via MCP

## 📚 Additional Resources

- **Setup Guide**: `MCP_SUPABASE_SETUP_GUIDE.md`
- **Complete Guide**: `MCP_SETUP_COMPLETE.md`
- **Supabase Docs**: https://supabase.com/docs/guides/mcp

---

**Ready!** Restart Cursor now and start using Supabase MCP tools! 🚀

