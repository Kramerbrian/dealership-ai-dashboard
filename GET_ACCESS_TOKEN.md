# 🔑 Get Supabase Access Token for MCP

## Step-by-Step Instructions

### Step 1: Get Your Access Token

1. **Open Supabase Dashboard**:
   - Go to: https://supabase.com/dashboard/account/tokens
   - Or navigate: Dashboard → Account Settings → Access Tokens

2. **Generate New Token**:
   - Click "Generate New Token" button
   - Give it a name (e.g., "MCP Server Token")
   - Click "Generate"

3. **Copy the Token**:
   - ⚠️ **Important**: Copy it immediately - you won't see it again!
   - The token will look like: `sbp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### Step 2: Add Token to MCP Config

Once you have the token, run:

```bash
bash scripts/add-access-token.sh
```

Then paste your token when prompted.

**OR** manually update `~/.cursor/mcp.json`:

```json
"Supabase": {
  "type": "http",
  "url": "https://mcp.supabase.com/mcp?project_ref=gzlgfghpkbqlhgfozjkb",
  "headers": {
    "Authorization": "Bearer YOUR_TOKEN_HERE"
  }
}
```

Replace `YOUR_TOKEN_HERE` with your actual token.

## Quick Command

```bash
# After getting token, run:
bash scripts/add-access-token.sh
```

## Security Note

- ✅ Token is stored in `~/.cursor/mcp.json` (local file)
- ✅ Never commit this file to git
- ✅ Token gives access to your Supabase project
- ✅ Rotate tokens regularly

## Next Steps

After adding the token:
1. Restart Cursor IDE
2. Test MCP connection
3. Execute SQL queries via MCP tools

---

**Ready?** Get your token from: https://supabase.com/dashboard/account/tokens

