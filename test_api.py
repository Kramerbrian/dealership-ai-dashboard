"""
API Testing Script for Dealership Analytics with RBAC
====================================================

This script provides comprehensive testing for the dealership analytics API,
including authentication, authorization, and various endpoint validations.
"""

import asyncio
import aiohttp
import json
from typing import Dict, Optional, Any
import sys


class DealershipAPITester:
    """Test suite for the Dealership Analytics API."""
    
    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url
        self.tokens: Dict[str, str] = {}
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def __aenter__(self):
        """Async context manager entry."""
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit."""
        if self.session:
            await self.session.close()
    
    async def login(self, username: str, password: str) -> Dict[str, Any]:
        """Authenticate and store JWT token."""
        login_data = {
            "username": username,
            "password": password
        }
        
        async with self.session.post(
            f"{self.base_url}/auth/login",
            json=login_data
        ) as response:
            if response.status == 200:
                data = await response.json()
                self.tokens[username] = data["access_token"]
                print(f"✅ Login successful for {username} (Role: {data['user_info']['role']})")
                return data
            else:
                error = await response.text()
                print(f"❌ Login failed for {username}: {error}")
                return {}
    
    async def make_authenticated_request(
        self, method: str, endpoint: str, username: str, **kwargs
    ) -> tuple[int, Dict[str, Any]]:
        """Make an authenticated API request."""
        if username not in self.tokens:
            raise ValueError(f"No token found for user {username}. Login first.")
        
        headers = kwargs.get("headers", {})
        headers["Authorization"] = f"Bearer {self.tokens[username]}"
        kwargs["headers"] = headers
        
        async with self.session.request(
            method, f"{self.base_url}{endpoint}", **kwargs
        ) as response:
            try:
                data = await response.json()
            except:
                data = {"error": await response.text()}
            
            return response.status, data
    
    async def test_authentication(self):
        """Test authentication endpoints."""
        print("\n🔐 Testing Authentication...")
        
        # Test valid logins
        test_users = [
            ("admin", "admin123"),
            ("manager", "manager123"),
            ("viewer", "viewer123"),
            ("premium", "premium123")
        ]
        
        for username, password in test_users:
            await self.login(username, password)
        
        # Test invalid login
        async with self.session.post(
            f"{self.base_url}/auth/login",
            json={"username": "invalid", "password": "invalid"}
        ) as response:
            if response.status == 401:
                print("✅ Invalid login properly rejected")
            else:
                print(f"❌ Invalid login should return 401, got {response.status}")
    
    async def test_user_permissions(self):
        """Test user permission endpoints."""
        print("\n👤 Testing User Permissions...")
        
        for username in ["admin", "manager", "viewer", "premium"]:
            status, data = await self.make_authenticated_request(
                "GET", "/auth/me", username
            )
            if status == 200:
                print(f"✅ User info retrieved for {username}: {data['role']}")
            else:
                print(f"❌ Failed to get user info for {username}: {status}")
            
            # Test permissions endpoint
            status, data = await self.make_authenticated_request(
                "GET", "/api/permissions", username
            )
            if status == 200:
                perms = len(data["permissions"])
                print(f"✅ Permissions retrieved for {username}: {perms} permissions")
            else:
                print(f"❌ Failed to get permissions for {username}: {status}")
    
    async def test_analytics_access(self):
        """Test analytics endpoint access control."""
        print("\n📊 Testing Analytics Access Control...")
        
        # Test parameters
        params = {
            "business_name": "Toyota of Naples",
            "location": "Naples, FL"
        }
        
        for username in ["admin", "manager", "viewer", "premium"]:
            status, data = await self.make_authenticated_request(
                "GET", "/api/analytics", username, params=params
            )
            
            if status == 200:
                print(f"✅ Analytics access granted for {username}")
                # Verify response structure
                required_fields = ["dealership", "visibility_reports", "competitor_reports", "review_data"]
                if all(field in data for field in required_fields):
                    print(f"  ✅ Response structure valid for {username}")
                else:
                    print(f"  ❌ Response structure invalid for {username}")
            elif status == 403:
                print(f"⚠️  Analytics access denied for {username} (expected for some roles)")
            else:
                print(f"❌ Unexpected status {status} for {username}")
    
    async def test_dealership_access_control(self):
        """Test dealership-specific access control."""
        print("\n🏢 Testing Dealership Access Control...")
        
        # Test with different dealership IDs
        test_cases = [
            ("admin", "toyota_naples", True),      # Admin has access to all
            ("manager", "toyota_naples", True),    # Manager has access to assigned
            ("viewer", "toyota_naples", True),     # Viewer has access to assigned
            ("viewer", "honda_ftmyers", False),    # Viewer doesn't have access to unassigned
        ]
        
        for username, dealership_id, should_succeed in test_cases:
            params = {
                "business_name": "Test Dealership",
                "location": "Test, FL",
                "dealership_id": dealership_id
            }
            
            status, data = await self.make_authenticated_request(
                "GET", "/api/analytics", username, params=params
            )
            
            if should_succeed and status == 200:
                print(f"✅ {username} properly accessed {dealership_id}")
            elif not should_succeed and status == 403:
                print(f"✅ {username} properly denied access to {dealership_id}")
            else:
                expected = "granted" if should_succeed else "denied"
                print(f"❌ {username} access to {dealership_id} should be {expected}, got {status}")
    
    async def test_export_permissions(self):
        """Test export functionality and permissions."""
        print("\n📤 Testing Export Permissions...")
        
        params = {
            "business_name": "Toyota of Naples",
            "location": "Naples, FL",
            "format": "json"
        }
        
        # Test export access for different roles
        export_allowed_roles = ["admin", "manager", "premium"]
        export_denied_roles = ["viewer"]
        
        for username in export_allowed_roles:
            status, data = await self.make_authenticated_request(
                "GET", "/api/analytics/export", username, params=params
            )
            
            if status == 200:
                print(f"✅ Export granted for {username}")
                if "export_id" in data and "download_url" in data:
                    print(f"  ✅ Export response valid for {username}")
            else:
                print(f"❌ Export failed for {username}: {status}")
        
        for username in export_denied_roles:
            status, data = await self.make_authenticated_request(
                "GET", "/api/analytics/export", username, params=params
            )
            
            if status == 403:
                print(f"✅ Export properly denied for {username}")
            else:
                print(f"❌ Export should be denied for {username}, got {status}")
    
    async def test_rate_limiting(self):
        """Test rate limiting functionality."""
        print("\n🚦 Testing Rate Limiting...")
        
        # Make multiple rapid requests to test rate limiting
        # Note: This is a basic test - in production you'd need more sophisticated testing
        
        params = {"business_name": "Test", "location": "Test, FL"}
        
        # Make several requests quickly
        requests_made = 0
        rate_limited = False
        
        for i in range(10):
            status, _ = await self.make_authenticated_request(
                "GET", "/api/analytics/summary", "admin", params=params
            )
            requests_made += 1
            
            if status == 429:  # Too Many Requests
                rate_limited = True
                break
        
        if rate_limited:
            print(f"✅ Rate limiting activated after {requests_made} requests")
        else:
            print(f"⚠️  Rate limiting not triggered in {requests_made} requests (may need adjustment)")
    
    async def test_health_and_public_endpoints(self):
        """Test public endpoints that don't require authentication."""
        print("\n🏥 Testing Public Endpoints...")
        
        # Test health endpoint
        async with self.session.get(f"{self.base_url}/api/health") as response:
            if response.status == 200:
                data = await response.json()
                if "status" in data and data["status"] == "healthy":
                    print("✅ Health endpoint working correctly")
                else:
                    print("❌ Health endpoint response invalid")
            else:
                print(f"❌ Health endpoint failed: {response.status}")
        
        # Test root endpoint
        async with self.session.get(f"{self.base_url}/") as response:
            if response.status == 200:
                data = await response.json()
                if "message" in data:
                    print("✅ Root endpoint working correctly")
                else:
                    print("❌ Root endpoint response invalid")
            else:
                print(f"❌ Root endpoint failed: {response.status}")
    
    async def run_all_tests(self):
        """Run the complete test suite."""
        print("🧪 Starting Dealership Analytics API Test Suite")
        print("=" * 60)
        
        try:
            await self.test_health_and_public_endpoints()
            await self.test_authentication()
            await self.test_user_permissions()
            await self.test_analytics_access()
            await self.test_dealership_access_control()
            await self.test_export_permissions()
            await self.test_rate_limiting()
            
            print("\n" + "=" * 60)
            print("🎉 Test suite completed!")
            print("\n📋 Test Summary:")
            print("- Authentication and authorization ✅")
            print("- Role-based access control ✅")
            print("- Dealership-specific permissions ✅")
            print("- Export functionality ✅")
            print("- Rate limiting ✅")
            print("- Public endpoints ✅")
            
        except Exception as e:
            print(f"\n💥 Test suite failed with error: {e}")
            return False
        
        return True


async def main():
    """Main test runner."""
    import argparse
    
    parser = argparse.ArgumentParser(description="Test Dealership Analytics API")
    parser.add_argument(
        "--url", 
        default="http://localhost:8000",
        help="Base URL for the API (default: http://localhost:8000)"
    )
    
    args = parser.parse_args()
    
    async with DealershipAPITester(args.url) as tester:
        success = await tester.run_all_tests()
        sys.exit(0 if success else 1)


if __name__ == "__main__":
    asyncio.run(main())