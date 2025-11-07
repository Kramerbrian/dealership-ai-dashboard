# 🔍 Perplexity MCP Setup Guide

## Overview

Perplexity MCP (Model Context Protocol) enables Cursor to perform real-time web searches and provide enhanced responses using Perplexity's AI-powered search capabilities.

## 🎯 What You'll Get

Once configured, you'll be able to:
- ✅ Perform real-time web searches via MCP tools
- ✅ Get up-to-date information from the web
- ✅ Access Perplexity's AI-powered search results
- ✅ Enhanced responses with current data

## 📋 Prerequisites

1. **Node.js**: Version 18 or later (already installed)
2. **Perplexity API Key**: Get one from https://www.perplexity.ai/settings/api

## 🚀 Quick Setup

### Option 1: Automated Setup (Recommended)

```bash
# Run the setup script
bash scripts/setup-perplexity-mcp.sh
```

This will:
- Check for existing MCP configuration
- Prompt for your Perplexity API key
- Add Perplexity MCP to your Cursor configuration
- Create a backup of your existing config

### Option 2: Manual Configuration

1. **Get Your Perplexity API Key**:
   - Go to: https://www.perplexity.ai/settings/api
   - Sign up or log in
   - Generate a new API key
   - Copy the key

2. **Update MCP Config**:
   Edit `~/.cursor/mcp.json` and add:

   ```json
   {
     "mcpServers": {
       "Perplexity": {
         "command": "npx",
         "args": ["-y", "@perplexity-ai/mcp-server"],
         "env": {
           "PERPLEXITY_API_KEY": "your_api_key_here"
         }
       }
     }
   }
   ```

   Replace `your_api_key_here` with your actual API key.

3. **Restart Cursor IDE**

## 📋 Complete MCP Configuration

Your `~/.cursor/mcp.json` should include Perplexity along with your other MCP servers:

```json
{
  "mcpServers": {
    "Perplexity": {
      "command": "npx",
      "args": ["-y", "@perplexity-ai/mcp-server"],
      "env": {
        "PERPLEXITY_API_KEY": "your_api_key_here"
      }
    },
    "Supabase": {
      "type": "http",
      "url": "https://mcp.supabase.com/mcp?project_ref=gzlgfghpkbqlhgfozjkb",
      "headers": {
        "Authorization": "Bearer YOUR_SUPABASE_TOKEN"
      }
    },
    "Vercel": {
      "url": "https://mcp.vercel.com",
      "headers": {}
    }
  }
}
```

## ✅ Verification Steps

1. **Check MCP Config**:
   ```bash
   cat ~/.cursor/mcp.json | grep -A 5 "Perplexity"
   ```

2. **Restart Cursor IDE** completely

3. **Test Perplexity MCP**:
   - Ask Cursor to search for something current
   - Example: "What's the latest news about Next.js 15?"
   - Cursor should use Perplexity MCP to search the web

## 🎯 Using Perplexity MCP

Once configured, you can use Perplexity MCP in several ways:

### Direct Web Search

Ask Cursor to search for current information:
```
"Search for the latest Next.js 14 features"
"What are the current best practices for React Server Components?"
"Find recent updates about Supabase Edge Functions"
```

### Enhanced Responses

Cursor will automatically use Perplexity when:
- You ask about current events
- You need up-to-date documentation
- You request recent information
- You ask about breaking changes or updates

## 🔧 Environment Variables

For persistence, add your API key to your `.env` file:

```bash
# .env
PERPLEXITY_API_KEY=your_api_key_here
```

Then update your MCP config to use the environment variable:

```json
{
  "mcpServers": {
    "Perplexity": {
      "command": "npx",
      "args": ["-y", "@perplexity-ai/mcp-server"],
      "env": {
        "PERPLEXITY_API_KEY": "${PERPLEXITY_API_KEY}"
      }
    }
  }
}
```

**Note**: Cursor may not expand environment variables in MCP config. You may need to use the actual key value.

## 🔒 Security Best Practices

1. **Never commit API keys to git**
   - Add `PERPLEXITY_API_KEY` to `.gitignore`
   - Use environment variables or secure storage

2. **Rotate keys regularly**
   - Generate new keys periodically
   - Revoke old keys when no longer needed

3. **Use separate keys for development/production**
   - Different keys for different environments
   - Easier to revoke if compromised

## 🐛 Troubleshooting

### Error: "MCP server not found"

**Solution:**
1. Verify `~/.cursor/mcp.json` exists
2. Check JSON syntax is valid
3. Restart Cursor IDE completely
4. Verify Node.js is installed: `node --version`

### Error: "Invalid API key"

**Solution:**
1. Verify API key is correct
2. Check key hasn't expired
3. Generate a new key from Perplexity dashboard
4. Update MCP config with new key

### Perplexity MCP Not Working

**Solution:**
1. Check MCP config has correct structure
2. Verify `npx` can run: `npx --version`
3. Test manually: `npx -y @perplexity-ai/mcp-server`
4. Check Cursor logs for errors
5. Restart Cursor IDE

### MCP Tools Not Showing

**Solution:**
1. Restart Cursor IDE completely
2. Check MCP config file location
3. Verify Perplexity entry is in config
4. Check Cursor logs for errors
5. Try removing and re-adding the config

## 📚 Additional Resources

- **Perplexity API Docs**: https://docs.perplexity.ai/
- **MCP Documentation**: https://modelcontextprotocol.io/
- **Perplexity MCP Server**: https://github.com/ppl-ai/modelcontextprotocol

## 🎉 Next Steps

1. **Run the setup script**: `bash scripts/setup-perplexity-mcp.sh`
2. **Restart Cursor IDE** to load MCP configuration
3. **Test Perplexity MCP** by asking Cursor to search the web
4. **Add API key to .env** for persistence (optional)

---

**Ready to use!** Restart Cursor and start using Perplexity MCP for real-time web searches.

