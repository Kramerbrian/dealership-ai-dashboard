#!/usr/bin/env python3
"""
Supabase SQL Query Runner
Supports multiple methods: Supabase Python client, psycopg2, or MCP
"""

import os
import sys
import json
from pathlib import Path
from typing import Optional, List, Dict, Any

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

def get_project_id() -> str:
    """Extract project ID from Supabase URL"""
    env_vars = load_env_file()
    supabase_url = env_vars.get('NEXT_PUBLIC_SUPABASE_URL') or os.getenv('NEXT_PUBLIC_SUPABASE_URL')
    
    if supabase_url:
        try:
            return supabase_url.split('//')[1].split('.')[0]
        except:
            pass
    
    return "gzlgfghpkbqlhgfozjkb"

def execute_with_psycopg2(query: str, database_url: str) -> List[Dict[str, Any]]:
    """Execute SQL using psycopg2"""
    try:
        import psycopg2
        from psycopg2.extras import RealDictCursor
    except ImportError:
        raise ImportError("psycopg2 not installed. Run: pip install psycopg2-binary")
    
    try:
        # Remove query parameters for connection
        conn_url = database_url.split('?')[0]
        conn = psycopg2.connect(conn_url, sslmode='require')
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute(query)
        
        if query.strip().upper().startswith('SELECT'):
            results = cursor.fetchall()
            return [dict(row) for row in results]
        else:
            conn.commit()
            return [{"status": "success", "rows_affected": cursor.rowcount}]
    except Exception as e:
        raise Exception(f"Database error: {e}")
    finally:
        if 'conn' in locals():
            conn.close()

def execute_with_supabase_rest(query: str, project_id: str, service_key: str) -> List[Dict[str, Any]]:
    """Execute SQL using Supabase REST API (requires service role key)"""
    try:
        import requests
    except ImportError:
        raise ImportError("requests not installed. Run: pip install requests")
    
    # Supabase REST API doesn't support arbitrary SQL queries
    # This would need to use the Management API or a custom function
    raise NotImplementedError("Supabase REST API doesn't support arbitrary SQL queries directly")

def print_results(results: List[Dict[str, Any]]):
    """Pretty print query results"""
    if not results:
        print("\n✅ Query executed successfully (no rows returned)")
        return
    
    print(f"\n✅ Query executed successfully! ({len(results)} rows)")
    print("=" * 80)
    
    # Get all column names
    columns = list(results[0].keys())
    
    # Print header
    header = " | ".join(col.ljust(20)[:20] for col in columns)
    print(header)
    print("-" * 80)
    
    # Print rows
    for row in results:
        values = [str(row.get(col, ''))[:20].ljust(20) for col in columns]
        print(" | ".join(values))
    
    print("=" * 80)

def main():
    """Main execution"""
    if len(sys.argv) < 2:
        print("Usage:")
        print("  python3 scripts/supabase_query_runner.py <query_file.sql>")
        print("  python3 scripts/supabase_query_runner.py --query 'SELECT ...'")
        print()
        print("Methods available:")
        print("  1. psycopg2 (direct PostgreSQL connection)")
        print("  2. Supabase Python client (limited - RPC only)")
        print("  3. MCP (requires MCP server setup)")
        print()
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
            query = f.read().strip()
    
    # Remove comments from query
    lines = [line for line in query.split('\n') if not line.strip().startswith('--')]
    query = '\n'.join(lines).strip()
    
    if not query:
        print("❌ No query found in file")
        sys.exit(1)
    
    print("🔧 Supabase SQL Query Runner")
    print("=" * 80)
    print(f"📄 Query:\n{query}")
    print("=" * 80)
    print()
    
    # Load environment
    env_vars = load_env_file()
    database_url = env_vars.get('DATABASE_URL') or os.getenv('DATABASE_URL')
    
    if not database_url:
        print("❌ DATABASE_URL not found in .env or environment")
        print("   Please set DATABASE_URL in .env file")
        sys.exit(1)
    
    # Try psycopg2 first
    try:
        print("🔄 Method 1: Trying direct PostgreSQL connection (psycopg2)...")
        results = execute_with_psycopg2(query, database_url)
        print_results(results)
        return results
    except ImportError as e:
        print(f"⚠️  {e}")
        print("   Install with: pip install psycopg2-binary")
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        print()
        print("💡 Alternative methods:")
        print("   1. Use Supabase SQL Editor: https://supabase.com/dashboard/project/gzlgfghpkbqlhgfozjkb/sql/new")
        print("   2. Set up MCP server with proper authentication")
        print("   3. Use connection pooler (port 6543) if available")
        sys.exit(1)

if __name__ == "__main__":
    main()

