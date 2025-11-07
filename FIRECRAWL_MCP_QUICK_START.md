# 🚀 Firecrawl MCP - Quick Start

## ✅ Installation Complete

Firecrawl MCP has been added to your Cursor MCP configuration!

## 📋 Next Steps

### 1. Get Your Firecrawl API Key

1. Go to: **https://firecrawl.dev/app/api-keys**
2. Sign up or log in to your Firecrawl account
3. Generate a new API key
4. Copy the key

### 2. Add API Key to MCP Config

Edit `~/.cursor/mcp.json` and replace `YOUR_FIRECRAWL_API_KEY_HERE` with your actual key:

```json
{
  "mcpServers": {
    "Firecrawl": {
      "command": "npx",
      "args": ["-y", "firecrawl-mcp"],
      "env": {
        "FIRECRAWL_API_KEY": "fc-your-actual-api-key-here"
      }
    }
  }
}
```

### 3. Restart Cursor IDE

Completely quit and restart Cursor to load the new MCP configuration.

### 4. Test It!

Ask Cursor to crawl a website:
- "Crawl https://dealershipai.com and extract the content"
- "Scrape the homepage of example.com"
- "Extract all headings and links from this website"

## 🔧 Alternative: Use Setup Script

If you prefer, you can run the automated setup script:

```bash
bash scripts/setup-firecrawl-mcp.sh
```

This will prompt you for your API key and update the config automatically.

## 🎯 Use Cases

### Content Research
```
"Crawl my competitor's website and analyze their content structure"
"Extract all blog posts from this website"
"Get the main content from these top-ranking pages"
```

### SEO Analysis
```
"Crawl this website and check for SEO issues"
"Extract meta tags and structured data from this page"
"Analyze the content structure for SEO optimization"
```

### Competitive Intelligence
```
"Compare the content structure of my website vs competitors"
"Extract pricing information from competitor websites"
"Analyze how competitors structure their landing pages"
```

## 📚 Full Documentation

See `FIRECRAWL_MCP_SETUP.md` for complete setup guide, troubleshooting, and best practices.

---

**Status**: ✅ Firecrawl MCP added to config  
**Action Required**: Add your API key and restart Cursor

