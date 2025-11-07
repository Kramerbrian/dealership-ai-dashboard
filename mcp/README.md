# SEO MCP Server

A Model Context Protocol (MCP) server that provides SEO analysis, keyword research, and optimization tools for dealershipAI.

## Quick Start

The SEO MCP server is already configured in your Cursor MCP settings. Just restart Cursor IDE to activate it.

## Configuration

The server is configured in `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "SEO": {
      "command": "npx",
      "args": ["-y", "tsx", "/Users/briankramer/dealership-ai-dashboard/mcp/seo-mcp-server.ts"],
      "env": {
        "NEXT_PUBLIC_APP_URL": "http://localhost:3000"
      }
    }
  }
}
```

## Available Tools

1. **analyze_seo** - Analyze comprehensive SEO metrics for a domain
2. **research_keyword** - Research keywords for SEO opportunities
3. **optimize_content** - Get content optimization recommendations
4. **check_technical_seo** - Check technical SEO issues
5. **analyze_backlinks** - Analyze backlinks and link quality
6. **get_seo_recommendations** - Get actionable SEO recommendations

## Development

### Install Dependencies
```bash
npm install
```

### Run Server (for testing)
```bash
npx tsx seo-mcp-server.ts
```

### Update Configuration
Edit `seo-mcp-server.ts` to:
- Add new tools
- Modify existing tool behavior
- Integrate with additional APIs
- Add caching or rate limiting

## Environment Variables

- `NEXT_PUBLIC_APP_URL` - Base URL for your SEO API (default: `http://localhost:3000`)

## Testing

After restarting Cursor, test the SEO MCP by asking:

- "Analyze SEO for dealershipai.com"
- "Research the keyword 'car dealership'"
- "Get SEO recommendations for my domain"

## Troubleshooting

If the server doesn't work:

1. **Check dependencies**: `cd mcp && npm install`
2. **Verify tsx**: `npx tsx --version`
3. **Test server manually**: `npx tsx seo-mcp-server.ts` (should run without errors)
4. **Check MCP config**: `cat ~/.cursor/mcp.json | grep -A 8 SEO`
5. **Restart Cursor IDE** completely

## Files

- `seo-mcp-server.ts` - Main MCP server implementation
- `package.json` - Dependencies and scripts
- `README.md` - This file

## Documentation

See `../SEO_MCP_SETUP.md` for complete setup guide and tool reference.

