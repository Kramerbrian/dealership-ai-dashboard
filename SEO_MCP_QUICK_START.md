# 🚀 SEO MCP - Quick Start

## ✅ Installation Complete

SEO MCP has been added to your Cursor MCP configuration!

## 📋 What Was Created

1. **SEO MCP Server**: `mcp/seo-mcp-server.ts`
   - Comprehensive SEO analysis tools
   - Keyword research capabilities
   - Content optimization recommendations
   - Technical SEO checking
   - Backlink analysis

2. **Setup Script**: `scripts/setup-seo-mcp.sh`
   - Automated configuration helper

3. **Documentation**: 
   - `SEO_MCP_SETUP.md` - Complete setup guide
   - `SEO_MCP_QUICK_START.md` - This file

## 🎯 Available Tools

### 1. Analyze SEO
```
"Analyze SEO for dealershipai.com"
"Get SEO metrics for my domain over the last 30 days"
```

### 2. Research Keywords
```
"Research the keyword 'car dealership'"
"Find SEO opportunities for 'used cars' in New York"
```

### 3. Optimize Content
```
"Optimize https://dealershipai.com for better SEO"
"Get content recommendations for my homepage"
```

### 4. Check Technical SEO
```
"Check technical SEO issues for my website"
"Analyze page speed and mobile usability"
```

### 5. Analyze Backlinks
```
"Analyze backlinks for dealershipai.com"
"Check my domain authority and link quality"
```

### 6. Get Recommendations
```
"Get all SEO recommendations for my domain"
"Show me technical SEO improvements I can make"
```

## ✅ Next Steps

1. **Restart Cursor IDE** completely to load the new MCP configuration

2. **Test SEO MCP** by asking Cursor:
   - "Analyze SEO for dealershipai.com"
   - "Research the keyword 'automotive AI'"
   - "Get SEO recommendations for my website"

3. **Customize** (optional):
   - Edit `mcp/seo-mcp-server.ts` to add custom tools
   - Update `NEXT_PUBLIC_APP_URL` in MCP config if your API is on a different URL

## 🔧 Configuration

**Current Setup**:
- Server: `/Users/briankramer/dealership-ai-dashboard/mcp/seo-mcp-server.ts`
- Base URL: `http://localhost:3000`
- Status: ✅ Configured in `~/.cursor/mcp.json`

**To Change Base URL**:
Edit `~/.cursor/mcp.json` and update:
```json
"SEO": {
  "env": {
    "NEXT_PUBLIC_APP_URL": "https://your-production-url.com"
  }
}
```

## 📚 Full Documentation

See `SEO_MCP_SETUP.md` for:
- Complete tool reference
- Troubleshooting guide
- Customization options
- Advanced configuration

---

**Status**: ✅ SEO MCP installed and configured  
**Action Required**: Restart Cursor IDE to activate

