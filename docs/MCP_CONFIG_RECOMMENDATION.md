# MCP Configuration Recommendation

## Current Status

Your MCP config shows Supabase configured with:
- **Project Ref**: `gzlgfghpkbqlhgfozjkb`
- **Format**: Using `type: http` (explicit)

## Configuration Format

### Your Format (Recommended)
```json
{
  "mcpServers": {
    "supabase": {
      "type": "http",
      "url": "https://mcp.supabase.com/mcp?project_ref=gzlgfghpkbqlhgfozjkb"
    }
  }
}
```

### Current Format (Also Valid)
```json
{
  "mcpServers": {
    "Supabase": {
      "url": "https://mcp.supabase.com/mcp",
      "headers": {}
    }
  }
}
```

## ⚠️ Important Note: Project Mismatch

Your `.env.local` has a **project mismatch**:

- **MCP Config**: Uses `gzlgfghpkbqlhgfozjkb`
- **DATABASE_URL**: Uses `gzlgfghpkbqlhgfozjkb` ✅
- **NEXT_PUBLIC_SUPABASE_URL**: Uses `vxrdvkhkombwlhjvtsmw` ⚠️

### Recommendation

You should use **one consistent Supabase project**. Choose either:

**Option 1: Use `gzlgfghpkbqlhgfozjkb` (matches MCP)**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://gzlgfghpkbqlhgfozjkb.supabase.co
```

**Option 2: Use `vxrdvkhkombwlhjvtsmw` (matches current env)**
```json
{
  "mcpServers": {
    "supabase": {
      "type": "http",
      "url": "https://mcp.supabase.com/mcp?project_ref=vxrdvkhkombwlhjvtsmw"
    }
  }
}
```

## Complete Recommended MCP Config

```json
{
  "mcpServers": {
    "supabase": {
      "type": "http",
      "url": "https://mcp.supabase.com/mcp?project_ref=gzlgfghpkbqlhgfozjkb"
    },
    "vercel": {
      "type": "http",
      "url": "https://mcp.vercel.com"
    },
    "sentry": {
      "type": "http",
      "url": "https://mcp.sentry.dev/mcp"
    }
  }
}
```

## Next Steps

1. **Verify which project is active**: Check Supabase dashboard
2. **Update MCP config** to match your active project
3. **Update environment variables** to be consistent
4. **Test MCP connection**: Verify you can query Supabase via MCP

