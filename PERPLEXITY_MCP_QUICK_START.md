# 🚀 Perplexity MCP - Quick Start

## ✅ Installation Complete

Perplexity MCP has been added to your Cursor MCP configuration!

## 📋 Next Steps

### 1. Get Your Perplexity API Key

1. Go to: **https://www.perplexity.ai/settings/api**
2. Sign up or log in to your Perplexity account
3. Generate a new API key
4. Copy the key

### 2. Add API Key to MCP Config

Edit `~/.cursor/mcp.json` and replace `YOUR_PERPLEXITY_API_KEY_HERE` with your actual key:

```json
{
  "mcpServers": {
    "Perplexity": {
      "command": "npx",
      "args": ["-y", "@perplexity-ai/mcp-server"],
      "env": {
        "PERPLEXITY_API_KEY": "pplx-your-actual-api-key-here"
      }
    }
  }
}
```

### 3. Restart Cursor IDE

Completely quit and restart Cursor to load the new MCP configuration.

### 4. Test It!

Ask Cursor to search for something current:
- "What's the latest news about Next.js 15?"
- "Search for recent updates on React Server Components"
- "Find current best practices for Supabase Edge Functions"

## 🔧 Alternative: Use Setup Script

If you prefer, you can run the automated setup script:

```bash
bash scripts/setup-perplexity-mcp.sh
```

This will prompt you for your API key and update the config automatically.

## 📚 Full Documentation

See `PERPLEXITY_MCP_SETUP.md` for complete setup guide, troubleshooting, and best practices.

---

**Status**: ✅ Perplexity MCP added to config  
**Action Required**: Add your API key and restart Cursor

