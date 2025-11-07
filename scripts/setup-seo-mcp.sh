#!/bin/bash

# SEO MCP Setup Script
# This script helps configure SEO MCP server in Cursor

set -e

MCP_CONFIG="$HOME/.cursor/mcp.json"
BACKUP_FILE="$HOME/.cursor/mcp.json.backup-$(date +%Y%m%d-%H%M%S)"
MCP_DIR="$(cd "$(dirname "$0")/.." && pwd)/mcp"

echo "🔧 SEO MCP Setup"
echo "================"
echo ""

# Check if MCP config exists
if [ ! -f "$MCP_CONFIG" ]; then
    echo "❌ MCP config not found at $MCP_CONFIG"
    echo "Creating new config..."
    mkdir -p "$HOME/.cursor"
    echo '{"mcpServers": {}}' > "$MCP_CONFIG"
fi

# Backup existing config
echo "📦 Backing up existing config..."
cp "$MCP_CONFIG" "$BACKUP_FILE"
echo "✅ Backup created: $BACKUP_FILE"
echo ""

# Check if MCP directory exists
if [ ! -d "$MCP_DIR" ]; then
    echo "❌ MCP directory not found at $MCP_DIR"
    exit 1
fi

# Check if SEO MCP server exists
if [ ! -f "$MCP_DIR/seo-mcp-server.ts" ]; then
    echo "❌ SEO MCP server not found at $MCP_DIR/seo-mcp-server.ts"
    exit 1
fi

# Get base URL from environment or prompt
BASE_URL="${NEXT_PUBLIC_APP_URL:-http://localhost:3000}"

echo "🔧 Updating MCP configuration..."
echo "   Base URL: $BASE_URL"
echo ""

# Use Python to safely update JSON
python3 << EOF
import json
import os

mcp_config_path = os.path.expanduser("$MCP_CONFIG")
mcp_dir = "$MCP_DIR"
base_url = "$BASE_URL"

try:
    # Read existing config
    with open(mcp_config_path, 'r') as f:
        config = json.load(f)
    
    # Ensure mcpServers exists
    if 'mcpServers' not in config:
        config['mcpServers'] = {}
    
    # Add or update SEO MCP
    config['mcpServers']['SEO'] = {
        "command": "npx",
        "args": ["-y", "tsx", os.path.join(mcp_dir, "seo-mcp-server.ts")],
        "env": {
            "NEXT_PUBLIC_APP_URL": base_url
        }
    }
    
    # Write updated config
    with open(mcp_config_path, 'w') as f:
        json.dump(config, f, indent=2)
    
    print("✅ SEO MCP added to configuration")
    print(f"   Server: {mcp_dir}/seo-mcp-server.ts")
    print(f"   Base URL: {base_url}")
    
except Exception as e:
    print(f"❌ Error updating config: {e}")
    exit(1)
EOF

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Setup complete!"
    echo ""
    echo "📋 Next steps:"
    echo "   1. Install dependencies: cd mcp && npm install"
    echo "   2. Restart Cursor IDE to load the new MCP configuration"
    echo "   3. Test SEO MCP by asking Cursor to analyze SEO for a domain"
    echo ""
    echo "💡 To verify the config:"
    echo "   cat $MCP_CONFIG | grep -A 8 SEO"
    echo ""
    echo "🔧 To change the base URL, set NEXT_PUBLIC_APP_URL environment variable"
    echo "   or edit the config manually"
else
    echo ""
    echo "❌ Setup failed. Check the error above."
    echo "💡 You can manually edit $MCP_CONFIG"
fi

