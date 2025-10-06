#!/usr/bin/env python3
"""
Simple API Demo Script
=====================

This script demonstrates the key functionality of the dealership analytics API
including authentication, RBAC, and analytics data retrieval.
"""

import json
from api_server import (
    authenticate_user, fake_users_db, 
    RolePermissions, Permission
)
from rbac_middleware import permission_checker

def demo_authentication():
    """Demonstrate authentication functionality."""
    print("🔐 Authentication Demo")
    print("=" * 40)
    
    # Test valid users
    for username in ["admin", "manager", "viewer", "premium"]:
        password = f"{username}123"
        user = authenticate_user(username, password)
        if user:
            print(f"✅ {username}: Authentication successful (Role: {user['role'].value})")
        else:
            print(f"❌ {username}: Authentication failed")
    
    # Test invalid user
    invalid_user = authenticate_user("invalid", "wrong")
    if not invalid_user:
        print("✅ Invalid credentials properly rejected")
    
    print()

def demo_rbac_permissions():
    """Demonstrate RBAC permission system."""
    print("🛡️  RBAC Permissions Demo")
    print("=" * 40)
    
    roles = ["admin", "manager", "viewer", "premium"]
    key_permissions = [
        Permission.READ_ANALYTICS,
        Permission.EXPORT_ANALYTICS,
        Permission.WRITE_DEALERSHIP,
        Permission.CONFIGURE_AI_AGENTS
    ]
    
    print(f"{'Role':<10} {'Analytics':<10} {'Export':<8} {'Dealership':<12} {'AI Config':<10}")
    print("-" * 50)
    
    for role in roles:
        perms = RolePermissions.get_role_permissions(role)
        read_analytics = "✅" if Permission.READ_ANALYTICS in perms else "❌"
        export = "✅" if Permission.EXPORT_ANALYTICS in perms else "❌"
        dealership = "✅" if Permission.WRITE_DEALERSHIP in perms else "❌"
        ai_config = "✅" if Permission.CONFIGURE_AI_AGENTS in perms else "❌"
        
        print(f"{role:<10} {read_analytics:<10} {export:<8} {dealership:<12} {ai_config:<10}")
    
    print()

def demo_dealership_access():
    """Demonstrate dealership-specific access control."""
    print("🏢 Dealership Access Control Demo")
    print("=" * 40)
    
    dealerships = ["toyota_naples", "honda_ftmyers", "chevrolet_bonita"]
    
    for username, user_data in fake_users_db.items():
        print(f"\n{username} ({user_data['role'].value}):")
        for dealership in dealerships:
            has_access = permission_checker.check_dealership_access_with_logging(
                user_data['role'].value, 
                user_data['dealership_ids'],
                dealership,
                username,
                "127.0.0.1"
            )
            status = "✅" if has_access else "❌"
            print(f"  {dealership}: {status}")
    
    print()

def demo_analytics_integration():
    """Demonstrate analytics system integration."""
    print("📊 Analytics Integration Demo")
    print("=" * 40)
    
    # Import analytics components
    from api_server import integration_agent
    
    print("Available Analytics Agents:")
    print("✅ PlatformAgent - Multi-platform AI search")
    print("✅ AnalysisAgent - Visibility and revenue analysis") 
    print("✅ CompetitorAgent - Competitor identification")
    print("✅ ReviewAgent - Review sentiment analysis")
    print("✅ IntegrationAgent - Orchestration and reporting")
    
    print("\nSample Analytics Data Structure:")
    sample_data = {
        "dealership": "Toyota of Naples",
        "location": "Naples, FL",
        "visibility_reports": [
            {
                "query": "Toyota dealership Naples FL",
                "visibility_score": 34.2,
                "platforms_mentioned": ["Gemini", "ChatGPT"],
                "revenue_at_risk": 15750.0
            }
        ],
        "competitor_reports": [
            {
                "query": "Toyota dealership Naples FL", 
                "competitors": [("Honda", 3), ("Chevrolet", 2)]
            }
        ],
        "review_data": {
            "overall_rating": 4.2,
            "overall_sentiment": 0.78,
            "ratings": {"Google": 4.3, "Yelp": 4.1}
        }
    }
    
    print(json.dumps(sample_data, indent=2))
    print()

def demo_api_endpoints():
    """Demonstrate available API endpoints."""
    print("🌐 API Endpoints Demo")
    print("=" * 40)
    
    endpoints = [
        ("POST", "/auth/login", "User authentication"),
        ("GET", "/auth/me", "Current user info"),
        ("GET", "/api/analytics", "Dealership analytics data"),
        ("GET", "/api/analytics/summary", "Analytics summary"),
        ("GET", "/api/analytics/export", "Export analytics"),
        ("GET", "/api/dealerships", "List accessible dealerships"),
        ("GET", "/api/permissions", "User permissions"),
        ("GET", "/api/health", "Health check")
    ]
    
    print(f"{'Method':<6} {'Endpoint':<25} {'Description'}")
    print("-" * 60)
    for method, endpoint, description in endpoints:
        print(f"{method:<6} {endpoint:<25} {description}")
    
    print("\n🔑 Sample API Usage:")
    print("1. Login: POST /auth/login with {username, password}")
    print("2. Get analytics: GET /api/analytics?business_name=Toyota%20of%20Naples&location=Naples,%20FL")
    print("3. Check permissions: GET /api/permissions")
    print()

def main():
    """Run the complete demo."""
    print("🚀 Dealership Analytics API with RBAC - Demo")
    print("=" * 60)
    print()
    
    demo_authentication()
    demo_rbac_permissions()
    demo_dealership_access()
    demo_analytics_integration()
    demo_api_endpoints()
    
    print("🎉 Demo completed successfully!")
    print()
    print("To start the API server, run:")
    print("  python3 api_server.py")
    print("  # or")
    print("  ./start_api.sh")
    print()
    print("Then visit http://localhost:8000/docs for interactive API documentation")

if __name__ == "__main__":
    main()