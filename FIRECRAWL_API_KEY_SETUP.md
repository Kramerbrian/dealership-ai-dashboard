# 🔥 Firecrawl API Key Setup - Complete

## ✅ What Was Done

1. **Added to `.env.local`**: ✅
   - `FIRECRAWL_API_KEY=fc-a2bb1140792448de9513a97e60ff43fa`

2. **Updated MCP Config**: ✅
   - Firecrawl MCP now uses the actual API key

3. **Created Setup Scripts**: ✅
   - `scripts/add-firecrawl-to-supabase.sh` - Supabase setup
   - `scripts/add-firecrawl-to-vercel.sh` - Vercel setup

## 📋 Next Steps

### 1. Supabase Setup

**Option A: Using the script**
```bash
bash scripts/add-firecrawl-to-supabase.sh
```

**Option B: Using Supabase Dashboard**
1. Go to: https://supabase.com/dashboard/project/gzlgfghpkbqlhgfozjkb/settings/secrets
2. Click "Add new secret"
3. Enter:
   - Name: `FIRECRAWL_API_KEY`
   - Value: `fc-a2bb1140792448de9513a97e60ff43fa`
4. Click "Save"

**Option C: Using Supabase CLI**
```bash
supabase login
supabase link --project-ref gzlgfghpkbqlhgfozjkb
supabase secrets set FIRECRAWL_API_KEY=fc-a2bb1140792448de9513a97e60ff43fa
```

### 2. Vercel Setup

**Option A: Using the script**
```bash
bash scripts/add-firecrawl-to-vercel.sh
```

**Option B: Using Vercel Dashboard**
1. Go to: https://vercel.com/dashboard
2. Select your project
3. Go to Settings > Environment Variables
4. Click "Add New"
5. Enter:
   - Name: `FIRECRAWL_API_KEY`
   - Value: `fc-a2bb1140792448de9513a97e60ff43fa`
6. Select environments: Production, Preview, Development
7. Click "Save"

**Option C: Using Vercel CLI**
```bash
vercel login
vercel link
vercel env add FIRECRAWL_API_KEY production
# When prompted, paste: fc-a2bb1140792448de9513a97e60ff43fa
vercel env add FIRECRAWL_API_KEY preview
vercel env add FIRECRAWL_API_KEY development
```

### 3. Restart Cursor IDE

After updating the MCP config, restart Cursor IDE to load the new API key.

## ✅ Verification

### Local (.env.local)
```bash
grep FIRECRAWL_API_KEY .env.local
# Should show: FIRECRAWL_API_KEY=fc-a2bb1140792448de9513a97e60ff43fa
```

### MCP Config
```bash
cat ~/.cursor/mcp.json | grep -A 3 "Firecrawl"
# Should show the API key in the env section
```

### Supabase
```bash
supabase secrets list
# Should show FIRECRAWL_API_KEY
```

### Vercel
```bash
vercel env ls
# Should show FIRECRAWL_API_KEY
```

## 🎯 Usage

Once configured, you can use Firecrawl in:

### Local Development
```typescript
const apiKey = process.env.FIRECRAWL_API_KEY;
```

### Supabase Edge Functions
```typescript
const apiKey = Deno.env.get('FIRECRAWL_API_KEY');
```

### Vercel Functions
```typescript
const apiKey = process.env.FIRECRAWL_API_KEY;
```

### MCP (Cursor)
The API key is already configured in your MCP config, so you can use Firecrawl MCP tools directly in Cursor.

## 🔒 Security Notes

- ✅ API key added to `.env.local` (not committed to git)
- ✅ API key in MCP config (local only)
- ⚠️  Remember to add to Supabase and Vercel for production use
- ⚠️  Never commit API keys to git
- ⚠️  Rotate keys if compromised

## 📚 Additional Resources

- **Firecrawl API Docs**: https://docs.firecrawl.dev/
- **Supabase Secrets**: https://supabase.com/docs/guides/secrets
- **Vercel Environment Variables**: https://vercel.com/docs/concepts/projects/environment-variables

---

**Status**: ✅ Local setup complete  
**Action Required**: Add to Supabase and Vercel using the methods above

