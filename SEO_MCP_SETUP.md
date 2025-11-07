# 🔍 SEO MCP Server Setup Guide

## Overview

The SEO MCP (Model Context Protocol) server provides SEO analysis, keyword research, and optimization tools directly through Cursor. It integrates with your existing SEO API endpoints and provides comprehensive SEO insights.

## 🎯 What You'll Get

Once configured, you'll be able to:
- ✅ Analyze SEO metrics for any domain
- ✅ Research keywords and get recommendations
- ✅ Optimize content for better SEO
- ✅ Check technical SEO issues
- ✅ Analyze backlinks and link quality
- ✅ Get actionable SEO recommendations

## 📋 Prerequisites

1. **Node.js**: Version 18 or later (already installed)
2. **TypeScript**: Will be installed via npm
3. **Your SEO API**: Running at `http://localhost:3000` (or your configured URL)

## 🚀 Quick Setup

### Option 1: Automated Setup (Recommended)

```bash
# Run the setup script
bash scripts/setup-seo-mcp.sh
```

This will:
- Check for existing MCP configuration
- Add SEO MCP to your Cursor configuration
- Create a backup of your existing config
- Set up the server with your base URL

### Option 2: Manual Configuration

1. **Install Dependencies**:
   ```bash
   cd mcp
   npm install
   ```

2. **Update MCP Config**:
   Edit `~/.cursor/mcp.json` and add:

   ```json
   {
     "mcpServers": {
       "SEO": {
         "command": "npx",
         "args": ["-y", "tsx", "/absolute/path/to/mcp/seo-mcp-server.ts"],
         "env": {
           "NEXT_PUBLIC_APP_URL": "http://localhost:3000"
         }
       }
     }
   }
   ```

   Replace `/absolute/path/to/mcp/seo-mcp-server.ts` with the actual path.

3. **Restart Cursor IDE**

## 📋 Complete MCP Configuration

Your `~/.cursor/mcp.json` should include SEO along with your other MCP servers:

```json
{
  "mcpServers": {
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
    },
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

1. **Install Dependencies**:
   ```bash
   cd mcp
   npm install
   ```

2. **Check MCP Config**:
   ```bash
   cat ~/.cursor/mcp.json | grep -A 8 "SEO"
   ```

3. **Test Server Manually** (optional):
   ```bash
   cd mcp
   npx tsx seo-mcp-server.ts
   ```
   (This will run on stdio, so you won't see output unless there's an error)

4. **Restart Cursor IDE** completely

5. **Test SEO MCP**:
   - Ask Cursor: "Analyze SEO for dealershipai.com"
   - Ask Cursor: "Research the keyword 'car dealership'"
   - Ask Cursor: "Get SEO recommendations for my domain"

## 🎯 Available Tools

### 1. `analyze_seo`
Analyze comprehensive SEO metrics for a domain.

**Parameters**:
- `domain` (required): Domain to analyze
- `timeRange` (optional): Time range (30d, 7d, 90d)

**Example**:
```
"Analyze SEO for dealershipai.com over the last 30 days"
```

### 2. `research_keyword`
Research a keyword for SEO opportunities.

**Parameters**:
- `keyword` (required): Keyword to research
- `location` (optional): Location for local SEO
- `language` (optional): Language code (default: en)

**Example**:
```
"Research the keyword 'used cars' for the United States"
```

### 3. `optimize_content`
Get content optimization recommendations for a URL.

**Parameters**:
- `url` (required): URL to optimize
- `targetKeyword` (optional): Target keyword

**Example**:
```
"Optimize https://dealershipai.com for the keyword 'AI visibility'"
```

### 4. `check_technical_seo`
Check technical SEO issues for a URL.

**Parameters**:
- `url` (required): URL to check

**Example**:
```
"Check technical SEO for https://dealershipai.com"
```

### 5. `analyze_backlinks`
Analyze backlinks for a domain.

**Parameters**:
- `domain` (required): Domain to analyze

**Example**:
```
"Analyze backlinks for dealershipai.com"
```

### 6. `get_seo_recommendations`
Get actionable SEO recommendations.

**Parameters**:
- `domain` (required): Domain to get recommendations for
- `category` (optional): Category (technical, content, local, backlinks, performance, all)

**Example**:
```
"Get all SEO recommendations for dealershipai.com"
```

## 🔧 Configuration

### Environment Variables

The SEO MCP server uses:
- `NEXT_PUBLIC_APP_URL`: Base URL for your API (default: `http://localhost:3000`)

Set this in your MCP config or as an environment variable.

### Customization

You can customize the server by editing `mcp/seo-mcp-server.ts`:
- Add new tools
- Modify existing tool behavior
- Integrate with additional APIs
- Add caching or rate limiting

## 🐛 Troubleshooting

### Error: "Cannot find module '@modelcontextprotocol/sdk'"

**Solution**:
```bash
cd mcp
npm install
```

### Error: "SEO API returned 404"

**Solution**:
1. Verify your API is running at the configured URL
2. Check `NEXT_PUBLIC_APP_URL` in MCP config
3. Test the API directly: `curl http://localhost:3000/api/visibility/seo?domain=test.com`

### Error: "MCP server not found"

**Solution**:
1. Verify `~/.cursor/mcp.json` exists
2. Check JSON syntax is valid
3. Verify the path to `seo-mcp-server.ts` is correct
4. Restart Cursor IDE completely

### SEO MCP Not Working

**Solution**:
1. Check MCP config has correct structure
2. Verify `npx` and `tsx` are available: `npx --version && npx tsx --version`
3. Test manually: `cd mcp && npx tsx seo-mcp-server.ts`
4. Check Cursor logs for errors
5. Restart Cursor IDE

### MCP Tools Not Showing

**Solution**:
1. Restart Cursor IDE completely
2. Check MCP config file location
3. Verify SEO entry is in config
4. Check Cursor logs for errors
5. Try removing and re-adding the config

## 📚 Additional Resources

- **MCP Documentation**: https://modelcontextprotocol.io/
- **SEO API Documentation**: See `app/api/visibility/seo/route.ts`
- **Model Context Protocol SDK**: https://github.com/modelcontextprotocol/typescript-sdk

## 🎉 Next Steps

1. **Run the setup script**: `bash scripts/setup-seo-mcp.sh`
2. **Install dependencies**: `cd mcp && npm install`
3. **Restart Cursor IDE** to load MCP configuration
4. **Test SEO MCP** by asking Cursor to analyze SEO for a domain
5. **Customize** the server for your specific needs

---

**Ready to use!** Restart Cursor and start using SEO MCP for comprehensive SEO analysis.

