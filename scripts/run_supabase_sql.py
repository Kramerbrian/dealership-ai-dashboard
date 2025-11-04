#!/usr/bin/env python3
"""
Execute SQL queries via Supabase using Python client or MCP
"""

import os
import sys
import json
from pathlib import Path
from typing import Optional

# Try to import supabase client
try:
    from supabase import create_client, Client
    SUPABASE_AVAILABLE = True
except ImportError:
    SUPABASE_AVAILABLE = False
    print("⚠️  supabase-py not installed. Install with: pip install supabase")
    print("   Falling back to direct psycopg2 connection...")

# Try to import psycopg2 for direct database connection
try:
    import psycopg2
    from psycopg2.extras import RealDictCursor
    PSYCOPG2_AVAILABLE = True
except ImportError:
    PSYCOPG2_AVAILABLE = False

def load_env_file(env_path: str = ".env") -> dict:
    """Load environment variables from .env file"""
    env_vars = {}
    if os.path.exists(env_path):
        with open(env_path, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    # Remove quotes if present
                    value = value.strip('"\'')
                    env_vars[key.strip()] = value
    return env_vars

def get_database_url() -> Optional[str]:
    """Get database URL from environment"""
    env_vars = load_env_file()
    return env_vars.get('DATABASE_URL') or os.getenv('DATABASE_URL')

def execute_sql_with_psycopg2(query: str, database_url: str) -> list:
    """Execute SQL using psycopg2 (direct PostgreSQL connection)"""
    if not PSYCOPG2_AVAILABLE:
        raise ImportError("psycopg2 not available. Install with: pip install psycopg2-binary")
    
    try:
        conn = psycopg2.connect(database_url)
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute(query)
        
        if query.strip().upper().startswith('SELECT'):
            results = cursor.fetchall()
            # Convert to list of dicts
            return [dict(row) for row in results]
        else:
            conn.commit()
            return [{"status": "success", "rows_affected": cursor.rowcount}]
    except Exception as e:
        print(f"❌ Error executing query: {e}")
        raise
    finally:
        if 'conn' in locals():
            conn.close()

def execute_sql_with_supabase_client(query: str, supabase_url: str, supabase_key: str) -> list:
    """Execute SQL using Supabase Python client (limited - only supports RPC and table queries)"""
    if not SUPABASE_AVAILABLE:
        raise ImportError("supabase-py not available")
    
    # Note: Supabase Python client doesn't support arbitrary SQL queries
    # It only supports RPC functions and table queries
    # For direct SQL, we need to use psycopg2 or the REST API
    
    print("⚠️  Supabase Python client doesn't support arbitrary SQL queries")
    print("✅ Using direct database connection instead...")
    
    # Try to get database URL from Supabase URL
    # This is a workaround - we'll use psycopg2 instead
    raise NotImplementedError("Supabase client doesn't support raw SQL. Use psycopg2 instead.")

def main():
    """Main function to execute SQL queries"""
    if len(sys.argv) < 2:
        print("Usage: python3 scripts/run_supabase_sql.py <query_file.sql>")
        print("   OR: python3 scripts/run_supabase_sql.py --query 'SELECT ...'")
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
    
    print(f"🔧 Executing SQL query...")
    print(f"📄 Query: {query[:100]}..." if len(query) > 100 else f"📄 Query: {query}")
    print()
    
    # Try to get database connection
    database_url = get_database_url()
    
    if not database_url:
        print("❌ DATABASE_URL not found in .env or environment")
        print("   Please set DATABASE_URL in .env file")
        sys.exit(1)
    
    # Remove sslmode=require from URL if present (handled by psycopg2)
    if '?sslmode=require' in database_url:
        database_url = database_url.replace('?sslmode=require', '')
        # Add sslmode to connection
        if '?' not in database_url:
            database_url += '?sslmode=require'
    
    try:
        if PSYCOPG2_AVAILABLE:
            print("✅ Using direct PostgreSQL connection (psycopg2)...")
            results = execute_sql_with_psycopg2(query, database_url)
            
            # Print results
            if results:
                print(f"\n✅ Query executed successfully! ({len(results)} rows)")
                print("=" * 80)
                
                # Pretty print results
                if isinstance(results[0], dict):
                    # Get column names
                    columns = list(results[0].keys())
                    print(" | ".join(columns))
                    print("-" * 80)
                    
                    for row in results:
                        values = [str(row.get(col, '')) for col in columns]
                        print(" | ".join(values))
                else:
                    for row in results:
                        print(row)
                
                print("=" * 80)
                return results
            else:
                print("\n✅ Query executed successfully (no rows returned)")
                return []
        else:
            print("❌ No database connection method available")
            print("   Install one of: pip install psycopg2-binary")
            sys.exit(1)
            
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()

