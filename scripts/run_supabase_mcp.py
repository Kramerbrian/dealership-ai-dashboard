#!/usr/bin/env python3
"""
Execute SQL queries via Supabase using MCP (Model Context Protocol)
This script uses the Supabase MCP server to execute SQL queries
"""

import os
import sys
import json
import subprocess
from pathlib import Path
from typing import Optional, Dict, Any

def load_env_file(env_path: str = ".env") -> dict:
    """Load environment variables from .env file"""
    env_vars = {}
    if os.path.exists(env_path):
        with open(env_path, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    value = value.strip('"\'')
                    env_vars[key.strip()] = value
    return env_vars

def get_project_id() -> Optional[str]:
    """Get Supabase project ID from environment"""
    env_vars = load_env_file()
    supabase_url = env_vars.get('NEXT_PUBLIC_SUPABASE_URL') or os.getenv('NEXT_PUBLIC_SUPABASE_URL')
    
    if supabase_url:
        # Extract project ID from URL: https://xxx.supabase.co -> xxx
        try:
            project_id = supabase_url.split('//')[1].split('.')[0]
            return project_id
        except:
            pass
    
    # Default project ID (from your setup)
    return "gzlgfghpkbqlhgfozjkb"

def execute_sql_via_mcp(project_id: str, query: str) -> Dict[str, Any]:
    """
    Execute SQL via Supabase MCP server
    Note: This requires the MCP server to be running and accessible
    """
    print(f"🔧 Executing SQL via Supabase MCP (Project: {project_id})...")
    print(f"📄 Query: {query[:100]}..." if len(query) > 100 else f"📄 Query: {query}")
    print()
    
    # Note: MCP tools are called via the MCP server, not directly from Python
    # This script shows how to format the request, but actual execution
    # happens through the MCP protocol
    
    print("⚠️  MCP execution requires the MCP server to be running")
    print("✅ This script will be executed via the MCP tool directly")
    print()
    print("📋 To use MCP tools directly, use:")
    print(f"   mcp_Supabase_execute_sql(project_id='{project_id}', query='...')")
    
    return {
        "project_id": project_id,
        "query": query,
        "status": "ready_for_mcp_execution"
    }

def main():
    """Main function"""
    if len(sys.argv) < 2:
        print("Usage: python3 scripts/run_supabase_mcp.py <query_file.sql>")
        print("   OR: python3 scripts/run_supabase_mcp.py --query 'SELECT ...'")
        print()
        print("Note: This script prepares the query for MCP execution.")
        print("      The actual execution happens via the MCP Supabase server.")
        sys.exit(1)
    
    # Get query
    if sys.argv[1] == '--query':
        query = sys.argv[2]
    else:
        query_file = Path(sys.argv[1])
        if not query_file.exists():
            print(f"❌ Query file not found: {query_file}")
            sys.exit(1)
        with open(query_file, 'r') as f:
            query = f.read()
    
    # Get project ID
    project_id = get_project_id()
    print(f"📊 Project ID: {project_id}")
    print()
    
    # Prepare for MCP execution
    result = execute_sql_via_mcp(project_id, query)
    
    print("✅ Query prepared for MCP execution")
    print(f"   Project ID: {result['project_id']}")
    print()
    print("💡 Tip: Use the MCP tool directly in your environment to execute this query")

if __name__ == "__main__":
    main()

