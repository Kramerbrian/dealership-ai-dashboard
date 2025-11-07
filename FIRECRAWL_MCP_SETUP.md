# 🔥 Firecrawl MCP Setup Guide

## Overview

Firecrawl MCP (Model Context Protocol) enables Cursor to crawl and scrape websites, extract content, and analyze web pages. It's perfect for SEO analysis, content research, and competitive intelligence.

## 🎯 What You'll Get

Once configured, you'll be able to:
- ✅ Crawl websites and extract content
- ✅ Scrape web pages for analysis
- ✅ Extract structured data from websites
- ✅ Analyze competitor websites
- ✅ Research content and SEO opportunities

## 📋 Prerequisites

1. **Node.js**: Version 18 or later (already installed)
2. **Firecrawl API Key**: Get one from https://firecrawl.dev/app/api-keys

## 🚀 Quick Setup

### Option 1: Automated Setup (Recommended)

```bash
# Run the setup script
bash scripts/setup-firecrawl-mcp.sh
```

This will:
- Check for existing MCP configuration
- Prompt for your Firecrawl API key
- Add Firecrawl MCP to your Cursor configuration
- Create a backup of your existing config

### Option 2: Manual Configuration

1. **Get Your Firecrawl API Key**:
   - Go to: https://firecrawl.dev/app/api-keys
   - Sign up or log in
   - Generate a new API key
   - Copy the key

2. **Update MCP Config**:
   Edit `~/.cursor/mcp.json` and add:

   ```json
   {
     "mcpServers": {
       "Firecrawl": {
         "command": "npx",
         "args": ["-y", "firecrawl-mcp"],
         "env": {
           "FIRECRAWL_API_KEY": "your_api_key_here"
         }
       }
     }
   }
   ```

   Replace `your_api_key_here` with your actual API key.

3. **Restart Cursor IDE**

## 📋 Complete MCP Configuration

Your `~/.cursor/mcp.json` should include Firecrawl along with your other MCP servers:

```json
{
  "mcpServers": {
    "Firecrawl": {
      "command": "npx",
      "args": ["-y", "firecrawl-mcp"],
      "env": {
        "FIRECRAWL_API_KEY": "your_api_key_here"
      }
    },
    "SEO": {
      "command": "npx",
      "args": ["-y", "tsx", "/path/to/mcp/seo-mcp-server.ts"],
      "env": {
        "NEXT_PUBLIC_APP_URL": "http://localhost:3000"
      }
    },
    "Perplexity": {
      "command": "npx",
      "args": ["-y", "@perplexity-ai/mcp-server"],
      "env": {
        "PERPLEXITY_API_KEY": "your_key_here"
      }
    }
  }
}
```

## ✅ Verification Steps

1. **Check MCP Config**:
   ```bash
   cat ~/.cursor/mcp.json | grep -A 5 "Firecrawl"
   ```

2. **Restart Cursor IDE** completely

3. **Test Firecrawl MCP**:
   - Ask Cursor: "Crawl https://example.com and extract the content"
   - Ask Cursor: "Scrape the homepage of dealershipai.com"
   - Ask Cursor: "Analyze the content structure of a competitor's website"

## 🎯 Using Firecrawl MCP

Once configured, you can use Firecrawl MCP in several ways:

### Crawl Websites

Ask Cursor to crawl and extract content:
```
"Crawl https://dealershipai.com and extract all the content"
"Scrape the homepage of my competitor's website"
"Extract structured data from https://example.com"
```

### Content Analysis

Use Firecrawl for content research:
```
"Analyze the content structure of https://example.com"
"Extract all headings and links from this website"
"Get the main content from this page"
```

### SEO Research

Combine with SEO MCP for comprehensive analysis:
```
"Crawl my competitor's website and analyze their SEO"
"Extract content from top-ranking pages in my niche"
"Compare content structure across multiple websites"
```

## 🔧 Environment Variables

For persistence, add your API key to your `.env` file:

```bash
# .env
FIRECRAWL_API_KEY=your_api_key_here
```

**Note**: Cursor may not expand environment variables in MCP config. You may need to use the actual key value in the config file.

## 🔒 Security Best Practices

1. **Never commit API keys to git**
   - Add `FIRECRAWL_API_KEY` to `.gitignore`
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
3. Generate a new key from Firecrawl dashboard
4. Update MCP config with new key

### Firecrawl MCP Not Working

**Solution:**
1. Check MCP config has correct structure
2. Verify `npx` can run: `npx --version`
3. Test manually: `npx -y firecrawl-mcp`
4. Check Cursor logs for errors
5. Restart Cursor IDE

### MCP Tools Not Showing

**Solution:**
1. Restart Cursor IDE completely
2. Check MCP config file location
3. Verify Firecrawl entry is in config
4. Check Cursor logs for errors
5. Try removing and re-adding the config

## 📚 Additional Resources

- **Firecrawl API Docs**: https://docs.firecrawl.dev/
- **Firecrawl MCP Server**: https://docs.firecrawl.dev/mcp-server
- **MCP Documentation**: https://modelcontextprotocol.io/

## 🎉 Next Steps

1. **Run the setup script**: `bash scripts/setup-firecrawl-mcp.sh`
2. **Restart Cursor IDE** to load MCP configuration
3. **Test Firecrawl MCP** by asking Cursor to crawl a website
4. **Combine with SEO MCP** for comprehensive website analysis

---

**Ready to use!** Restart Cursor and start using Firecrawl MCP for web crawling and content extraction.

