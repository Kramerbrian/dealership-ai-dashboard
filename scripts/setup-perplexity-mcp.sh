#!/bin/bash

# Perplexity MCP Setup Script
# This script helps configure Perplexity MCP server in Cursor

set -e

MCP_CONFIG="$HOME/.cursor/mcp.json"
BACKUP_FILE="$HOME/.cursor/mcp.json.backup-$(date +%Y%m%d-%H%M%S)"

echo "🔧 Perplexity MCP Setup"
echo "======================"
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

# Check for Perplexity API key
if [ -z "$PERPLEXITY_API_KEY" ]; then
    echo "⚠️  PERPLEXITY_API_KEY not found in environment"
    echo ""
    echo "📝 To get your Perplexity API key:"
    echo "   1. Go to: https://www.perplexity.ai/settings/api"
    echo "   2. Sign up or log in"
    echo "   3. Generate a new API key"
    echo "   4. Copy the key"
    echo ""
    read -p "Enter your Perplexity API key (or press Enter to skip): " api_key
    
    if [ -z "$api_key" ]; then
        echo "⚠️  Skipping API key setup. You'll need to add it manually later."
        api_key="YOUR_PERPLEXITY_API_KEY_HERE"
    else
        export PERPLEXITY_API_KEY="$api_key"
        echo "✅ API key set (not saved to file - add to .env for persistence)"
    fi
else
    echo "✅ PERPLEXITY_API_KEY found in environment"
    api_key="$PERPLEXITY_API_KEY"
fi

echo ""
echo "🔧 Updating MCP configuration..."

# Use Python to safely update JSON
python3 << EOF
import json
import os
import sys

mcp_config_path = os.path.expanduser("$MCP_CONFIG")
api_key = "$api_key"

try:
    # Read existing config
    with open(mcp_config_path, 'r') as f:
        config = json.load(f)
    
    # Ensure mcpServers exists
    if 'mcpServers' not in config:
        config['mcpServers'] = {}
    
    # Add or update Perplexity MCP
    config['mcpServers']['Perplexity'] = {
        "command": "npx",
        "args": ["-y", "@perplexity-ai/mcp-server"],
        "env": {
            "PERPLEXITY_API_KEY": api_key
        }
    }
    
    # Write updated config
    with open(mcp_config_path, 'w') as f:
        json.dump(config, f, indent=2)
    
    print("✅ Perplexity MCP added to configuration")
    
except Exception as e:
    print(f"❌ Error updating config: {e}")
    sys.exit(1)
EOF

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Setup complete!"
    echo ""
    echo "📋 Next steps:"
    echo "   1. Restart Cursor IDE to load the new MCP configuration"
    echo "   2. Test Perplexity MCP by asking Cursor to search the web"
    echo "   3. If you didn't set the API key, add it to your .env file:"
    echo "      PERPLEXITY_API_KEY=your_key_here"
    echo ""
    echo "💡 To verify the config:"
    echo "   cat $MCP_CONFIG | grep -A 5 Perplexity"
else
    echo ""
    echo "❌ Setup failed. Check the error above."
    echo "💡 You can manually edit $MCP_CONFIG"
fi

