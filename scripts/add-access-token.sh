#!/bin/bash

# Quick script to add Supabase access token to MCP config

MCP_CONFIG_FILE="$HOME/.cursor/mcp.json"

echo "🔑 Add Supabase Access Token"
echo "============================"
echo ""

# Check if token provided as argument
if [ -n "$1" ]; then
    ACCESS_TOKEN="$1"
    echo "✅ Token provided via command line"
else
    echo "Get your token from: https://supabase.com/dashboard/account/tokens"
    echo ""
    read -p "Enter your Supabase access token: " ACCESS_TOKEN
    
    if [ -z "$ACCESS_TOKEN" ]; then
        echo ""
        echo "❌ No token provided"
        echo ""
        echo "Usage:"
        echo "  bash scripts/add-access-token.sh YOUR_TOKEN_HERE"
        echo ""
        echo "Or get token from: https://supabase.com/dashboard/account/tokens"
        exit 1
    fi
fi

# Update the config using Python for reliable JSON handling
python3 <<PYTHON_SCRIPT
import json
import sys

config_file = "$MCP_CONFIG_FILE"
access_token = "$ACCESS_TOKEN"

try:
    with open(config_file, 'r') as f:
        config = json.load(f)
    
    # Update Supabase config
    if 'mcpServers' in config and 'Supabase' in config['mcpServers']:
        config['mcpServers']['Supabase']['headers']['Authorization'] = f"Bearer {access_token}"
        # Remove env section if it exists
        if 'env' in config['mcpServers']['Supabase']:
            del config['mcpServers']['Supabase']['env']
    
    with open(config_file, 'w') as f:
        json.dump(config, f, indent=2)
    
    print("✅ Access token added successfully!")
    print(f"   Token: {access_token[:20]}...")
    sys.exit(0)
    
except Exception as e:
    print(f"❌ Error: {e}")
    sys.exit(1)
PYTHON_SCRIPT

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Configuration updated!"
    echo "🔄 Please restart Cursor IDE to apply changes"
else
    echo "❌ Failed to update configuration"
    exit 1
fi

