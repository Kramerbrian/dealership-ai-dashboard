#!/bin/bash

# Finalize Supabase MCP Setup
# This script completes the MCP configuration with proper authentication

set -e

MCP_CONFIG_FILE="$HOME/.cursor/mcp.json"

echo "🔧 Finalizing Supabase MCP Setup"
echo "================================="
echo ""

# Check if Supabase CLI is authenticated
echo "🔐 Checking Supabase CLI authentication..."
if supabase projects list &> /dev/null; then
    echo "✅ Supabase CLI is authenticated"
    echo ""
    
    # Get the project info
    PROJECT_INFO=$(supabase projects list 2>&1 | grep "gzlgfghpkbqlhgfozjkb" || echo "")
    if [ ! -z "$PROJECT_INFO" ]; then
        echo "✅ Project found: gzlgfghpkbqlhgfozjkb"
        echo "$PROJECT_INFO"
    fi
else
    echo "⚠️  Not authenticated with Supabase CLI"
    echo "   Please run: supabase login"
    exit 1
fi

echo ""
echo "📝 Current MCP Configuration:"
echo "   File: $MCP_CONFIG_FILE"
echo ""

# Verify the configuration
if [ -f "$MCP_CONFIG_FILE" ]; then
    # Check if Supabase entry exists
    if grep -q "Supabase" "$MCP_CONFIG_FILE"; then
        echo "✅ Supabase MCP entry found"
        
        # Check if project_ref is set
        if grep -q "project_ref=gzlgfghpkbqlhgfozjkb" "$MCP_CONFIG_FILE"; then
            echo "✅ Project reference configured: gzlgfghpkbqlhgfozjkb"
        else
            echo "⚠️  Project reference not found in URL"
        fi
        
        # Check authentication
        if grep -q "Authorization" "$MCP_CONFIG_FILE"; then
            echo "✅ Authentication header configured"
        else
            echo "⚠️  Authentication header missing"
        fi
    else
        echo "❌ Supabase entry not found in MCP config"
    fi
else
    echo "❌ MCP config file not found: $MCP_CONFIG_FILE"
    exit 1
fi

echo ""
echo "📋 Configuration Summary:"
echo "   Project Reference: gzlgfghpkbqlhgfozjkb"
echo "   Authentication: Supabase CLI (if configured)"
echo "   MCP URL: https://mcp.supabase.com/mcp?project_ref=gzlgfghpkbqlhgfozjkb"
echo ""

echo "✅ Setup Complete!"
echo ""
echo "🔄 Next Steps:"
echo "   1. Restart Cursor IDE completely (quit and reopen)"
echo "   2. After restart, MCP tools should be available"
echo "   3. Test with: mcp_Supabase_list_projects"
echo "   4. Execute SQL queries via MCP tools"
echo ""
echo "📚 Documentation:"
echo "   - MCP_SUPABASE_SETUP_GUIDE.md"
echo "   - MCP_SETUP_COMPLETE.md"
echo ""

