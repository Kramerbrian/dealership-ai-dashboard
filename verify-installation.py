#!/usr/bin/env python3
"""
Verification Script for Dealership Analytics API
================================================

This script verifies that all components of the API are properly installed
and can be imported without errors.
"""

import sys
import importlib
from pathlib import Path

def print_header(text):
    """Print a formatted header."""
    print(f"\n{'=' * 70}")
    print(f"  {text}")
    print(f"{'=' * 70}\n")

def check_import(module_name, description):
    """Try to import a module and report the result."""
    try:
        module = importlib.import_module(module_name)
        print(f"✅ {description:<50} OK")
        return True
    except Exception as e:
        print(f"❌ {description:<50} FAILED")
        print(f"   Error: {str(e)}")
        return False

def main():
    """Run all verification checks."""
    print_header("Dealership Analytics API - Installation Verification")
    
    # Check Python version
    python_version = sys.version_info
    print(f"Python Version: {python_version.major}.{python_version.minor}.{python_version.micro}")
    
    if python_version < (3, 9):
        print("⚠️  WARNING: Python 3.9 or higher is recommended")
    else:
        print("✅ Python version OK")
    
    print_header("Checking Required Dependencies")
    
    dependencies = [
        ("fastapi", "FastAPI framework"),
        ("uvicorn", "Uvicorn ASGI server"),
        ("pydantic", "Pydantic data validation"),
        ("jwt", "PyJWT for authentication"),
        ("aiohttp", "Async HTTP client"),
    ]
    
    all_ok = True
    for module, description in dependencies:
        if not check_import(module, description):
            all_ok = False
    
    print_header("Checking API Modules")
    
    # Add parent directory to path to allow imports
    sys.path.insert(0, str(Path(__file__).parent))
    
    api_modules = [
        ("api", "API package"),
        ("api.main", "Main application"),
        ("api.middleware.rbac", "RBAC middleware"),
        ("api.routes.analytics", "Analytics routes"),
    ]
    
    for module, description in api_modules:
        if not check_import(module, description):
            all_ok = False
    
    print_header("Checking File Structure")
    
    required_files = [
        "api/__init__.py",
        "api/main.py",
        "api/middleware/__init__.py",
        "api/middleware/rbac.py",
        "api/routes/__init__.py",
        "api/routes/analytics.py",
        "api/tests/__init__.py",
        "api/tests/test_analytics.py",
        "requirements.txt",
        ".env.example",
        ".gitignore",
    ]
    
    for file_path in required_files:
        path = Path(__file__).parent / file_path
        if path.exists():
            print(f"✅ {file_path:<50} EXISTS")
        else:
            print(f"❌ {file_path:<50} MISSING")
            all_ok = False
    
    print_header("Verification Summary")
    
    if all_ok:
        print("✅ All checks passed! The API is ready to use.")
        print("\nNext steps:")
        print("  1. Install dependencies: pip install -r requirements.txt")
        print("  2. Set up environment:   cp .env.example .env")
        print("  3. Run the API:          uvicorn api.main:app --reload")
        print("  4. Visit documentation:  http://localhost:8000/docs")
        return 0
    else:
        print("❌ Some checks failed. Please review the errors above.")
        print("\nTo fix missing dependencies, run:")
        print("  pip install -r requirements.txt")
        return 1

if __name__ == "__main__":
    sys.exit(main())
