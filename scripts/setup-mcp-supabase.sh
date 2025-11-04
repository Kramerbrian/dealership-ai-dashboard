#!/bin/bash

# Setup Supabase MCP Server Configuration
# This script helps you configure MCP for Supabase access

set -e

echo "🔧 Supabase MCP Server Setup"
echo "============================"
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "⚠️  Supabase CLI not found"
    echo "   Installing via npm..."
    npm install -g supabase || {
        echo "❌ Failed to install Supabase CLI"
        echo "   Please install manually: npm install -g supabase"
        exit 1
    }
fi

echo "✅ Supabase CLI found"
echo ""

# Get project reference
PROJECT_REF="gzlgfghpkbqlhgfozjkb"
if [ -f .env ]; then
    SUPABASE_URL=$(grep "NEXT_PUBLIC_SUPABASE_URL" .env | head -1 | cut -d '=' -f2- | tr -d '"' | tr -d "'")
    if [ ! -z "$SUPABASE_URL" ]; then
        PROJECT_REF=$(echo "$SUPABASE_URL" | sed 's|https://||' | sed 's|\.supabase\.co.*||')
        echo "📊 Detected project reference: $PROJECT_REF"
    fi
fi

echo "📋 Project Reference: $PROJECT_REF"
echo ""

# Check if user is logged in
echo "🔐 Checking Supabase authentication..."
if supabase projects list &> /dev/null; then
    echo "✅ Already authenticated with Supabase"
else
    echo "⚠️  Not authenticated. Please log in..."
    echo "   This will open your browser for authentication"
    echo ""
    read -p "Press Enter to continue with login..."
    supabase login || {
        echo "❌ Authentication failed"
        exit 1
    }
fi

echo ""

# Determine MCP config location
MCP_CONFIG_DIR="$HOME/.cursor"
MCP_CONFIG_FILE="$MCP_CONFIG_DIR/mcp.json"

echo "📁 MCP Configuration Location:"
echo "   $MCP_CONFIG_FILE"
echo ""

# Check if config exists
if [ -f "$MCP_CONFIG_FILE" ]; then
    echo "⚠️  MCP config file already exists"
    echo "   Backing up to: ${MCP_CONFIG_FILE}.backup"
    cp "$MCP_CONFIG_FILE" "${MCP_CONFIG_FILE}.backup"
fi

# Create config directory if needed
mkdir -p "$MCP_CONFIG_DIR"

# Get access token (user needs to provide)
echo "🔑 Supabase Access Token"
echo "   You need to provide your Supabase access token"
echo "   Get it from: https://supabase.com/dashboard/account/tokens"
echo ""
read -p "Enter your Supabase access token (or press Enter to skip): " ACCESS_TOKEN

if [ -z "$ACCESS_TOKEN" ]; then
    echo ""
    echo "⚠️  No token provided. Creating configuration template..."
    echo "   You'll need to add your token manually"
    ACCESS_TOKEN="YOUR_SUPABASE_ACCESS_TOKEN_HERE"
fi

# Create MCP configuration
echo ""
echo "📝 Creating MCP configuration..."

cat > "$MCP_CONFIG_FILE" <<EOF
{
  "mcpServers": {
    "supabase": {
      "type": "http",
      "url": "https://mcp.supabase.com/mcp?project_ref=$PROJECT_REF",
      "headers": {
        "Authorization": "Bearer $ACCESS_TOKEN"
      }
    }
  }
}
EOF

echo "✅ MCP configuration created!"
echo ""

# Verify JSON syntax
if command -v jq &> /dev/null; then
    if jq empty "$MCP_CONFIG_FILE" 2>/dev/null; then
        echo "✅ JSON syntax is valid"
    else
        echo "❌ JSON syntax error. Please check the file manually"
    fi
else
    echo "⚠️  jq not installed. Cannot verify JSON syntax"
    echo "   Please verify the file manually"
fi

echo ""
echo "📋 Configuration Summary:"
echo "   Project Reference: $PROJECT_REF"
echo "   Config File: $MCP_CONFIG_FILE"
echo "   Token: ${ACCESS_TOKEN:0:20}..." # Show first 20 chars only
echo ""

# Test configuration
echo "🧪 Testing MCP connection..."
echo "   (This requires Cursor IDE to be restarted)"
echo ""

echo "✅ Setup complete!"
echo ""
echo "📝 Next Steps:"
echo "   1. Restart Cursor IDE"
echo "   2. Verify MCP tools are available"
echo "   3. Test with: mcp_Supabase_execute_sql"
echo ""
echo "📚 Documentation: MCP_SUPABASE_SETUP_GUIDE.md"
echo ""

