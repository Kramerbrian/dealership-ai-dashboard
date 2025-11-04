#!/bin/bash

# Update Supabase MCP Configuration with proper authentication
# This script updates the existing MCP config to include project reference and authentication

set -e

MCP_CONFIG_FILE="$HOME/.cursor/mcp.json"
BACKUP_FILE="${MCP_CONFIG_FILE}.backup.$(date +%Y%m%d_%H%M%S)"

echo "🔧 Updating Supabase MCP Configuration"
echo "======================================"
echo ""

# Check if config file exists
if [ ! -f "$MCP_CONFIG_FILE" ]; then
    echo "❌ MCP config file not found: $MCP_CONFIG_FILE"
    echo "   Run setup script first: bash scripts/setup-mcp-supabase.sh"
    exit 1
fi

# Backup existing config
echo "📦 Backing up existing config..."
cp "$MCP_CONFIG_FILE" "$BACKUP_FILE"
echo "   Backup saved to: $BACKUP_FILE"
echo ""

# Get access token
echo "🔑 Supabase Access Token"
echo "   Get your token from: https://supabase.com/dashboard/account/tokens"
echo "   Or use Supabase CLI authentication (recommended)"
echo ""
read -p "Enter your Supabase access token (or press Enter to use CLI auth): " ACCESS_TOKEN

if [ -z "$ACCESS_TOKEN" ]; then
    echo ""
    echo "🔄 Using Supabase CLI authentication..."
    
    # Check if user is logged in
    if supabase projects list &> /dev/null; then
        echo "✅ Already authenticated with Supabase CLI"
        echo ""
        echo "📝 Note: MCP server will use CLI authentication if configured"
        echo "   The token will be read from Supabase CLI config automatically"
        ACCESS_TOKEN="USE_CLI_AUTH"
    else
        echo "⚠️  Not authenticated. Please run: supabase login"
        echo ""
        read -p "Press Enter to open browser for authentication..."
        supabase login || {
            echo "❌ Authentication failed"
            exit 1
        }
        ACCESS_TOKEN="USE_CLI_AUTH"
    fi
fi

echo ""
echo "📝 Updating MCP configuration..."

# Use Python to update JSON (more reliable than sed)
python3 <<PYTHON_SCRIPT
import json
import sys

config_file = "$MCP_CONFIG_FILE"
access_token = "$ACCESS_TOKEN"

try:
    # Read existing config
    with open(config_file, 'r') as f:
        config = json.load(f)
    
    # Update Supabase configuration
    if 'mcpServers' not in config:
        config['mcpServers'] = {}
    
    # Update Supabase entry
    supabase_config = {
        "type": "http",
        "url": "https://mcp.supabase.com/mcp?project_ref=gzlgfghpkbqlhgfozjkb"
    }
    
    if access_token != "USE_CLI_AUTH" and access_token:
        supabase_config["headers"] = {
            "Authorization": f"Bearer {access_token}"
        }
    else:
        # For CLI auth, headers will be empty and MCP will use CLI credentials
        supabase_config["headers"] = {}
    
    config['mcpServers']['Supabase'] = supabase_config
    
    # Write updated config
    with open(config_file, 'w') as f:
        json.dump(config, f, indent=2)
    
    print("✅ MCP configuration updated successfully!")
    sys.exit(0)
    
except Exception as e:
    print(f"❌ Error updating config: {e}")
    sys.exit(1)
PYTHON_SCRIPT

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Configuration updated!"
    echo ""
    echo "📋 Updated Supabase MCP config:"
    echo "   Project Reference: gzlgfghpkbqlhgfozjkb"
    if [ "$ACCESS_TOKEN" != "USE_CLI_AUTH" ]; then
        echo "   Authentication: Access token configured"
    else
        echo "   Authentication: Using Supabase CLI credentials"
    fi
    echo ""
    echo "🔄 Next steps:"
    echo "   1. Restart Cursor IDE to load new MCP configuration"
    echo "   2. Test MCP connection with: mcp_Supabase_list_projects"
    echo "   3. Execute SQL queries via MCP tools"
    echo ""
    echo "📚 See: MCP_SUPABASE_SETUP_GUIDE.md for detailed documentation"
else
    echo ""
    echo "❌ Failed to update configuration"
    echo "   Restoring backup..."
    cp "$BACKUP_FILE" "$MCP_CONFIG_FILE"
    exit 1
fi

