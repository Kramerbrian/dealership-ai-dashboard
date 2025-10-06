#!/usr/bin/env python3
"""
Test script for the dealership AI analytics API
"""

import requests
import json
import time

# API base URL
BASE_URL = "http://localhost:8000"

def test_api():
    """Test the API endpoints"""
    print("🚀 Testing Dealership AI Analytics API")
    print("=" * 50)
    
    # Test 1: Health check
    print("\n1. Testing health check...")
    try:
        response = requests.get(f"{BASE_URL}/health")
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.json()}")
    except Exception as e:
        print(f"   Error: {e}")
    
    # Test 2: Authentication
    print("\n2. Testing authentication...")
    try:
        # Login as admin
        login_data = {
            "email": "admin@dealership.com",
            "password": "password123"
        }
        response = requests.post(f"{BASE_URL}/api/v1/auth/login", json=login_data)
        print(f"   Login Status: {response.status_code}")
        
        if response.status_code == 200:
            auth_data = response.json()
            token = auth_data["access_token"]
            print(f"   Token received: {token[:20]}...")
            
            # Test 3: Get current user
            print("\n3. Testing get current user...")
            headers = {"Authorization": f"Bearer {token}"}
            response = requests.get(f"{BASE_URL}/api/v1/auth/me", headers=headers)
            print(f"   Status: {response.status_code}")
            print(f"   User: {response.json()}")
            
            # Test 4: Analytics endpoint
            print("\n4. Testing analytics endpoint...")
            analytics_data = {
                "dealership_name": "Toyota of Naples",
                "location": "Naples, FL",
                "include_competitors": True,
                "include_reviews": True,
                "include_auto_responses": False
            }
            response = requests.post(
                f"{BASE_URL}/api/v1/analytics/dealership", 
                json=analytics_data,
                headers=headers
            )
            print(f"   Status: {response.status_code}")
            if response.status_code == 200:
                result = response.json()
                print(f"   Dealership: {result['dealership']}")
                print(f"   Risk Score: {result['risk_score']}")
                print(f"   AI Visibility Score: {result['ai_visibility_score']}")
                print(f"   Monthly Loss Risk: ${result['monthly_loss_risk']}")
            else:
                print(f"   Error: {response.text}")
            
            # Test 5: Analytics summary
            print("\n5. Testing analytics summary...")
            response = requests.get(f"{BASE_URL}/api/v1/analytics/summary", headers=headers)
            print(f"   Status: {response.status_code}")
            if response.status_code == 200:
                summary = response.json()
                print(f"   Summary: {summary}")
            else:
                print(f"   Error: {response.text}")
                
        else:
            print(f"   Login failed: {response.text}")
            
    except Exception as e:
        print(f"   Error: {e}")
    
    # Test 6: Test different user roles
    print("\n6. Testing different user roles...")
    test_users = [
        ("manager@dealership.com", "Manager"),
        ("analyst@dealership.com", "Analyst"),
        ("viewer@dealership.com", "Viewer")
    ]
    
    for email, role in test_users:
        try:
            print(f"\n   Testing {role} role...")
            login_data = {"email": email, "password": "password123"}
            response = requests.post(f"{BASE_URL}/api/v1/auth/login", json=login_data)
            
            if response.status_code == 200:
                token = response.json()["access_token"]
                headers = {"Authorization": f"Bearer {token}"}
                
                # Try to access analytics
                analytics_data = {
                    "dealership_name": "Test Dealership",
                    "location": "Test City, FL"
                }
                response = requests.post(
                    f"{BASE_URL}/api/v1/analytics/dealership", 
                    json=analytics_data,
                    headers=headers
                )
                print(f"     Analytics access: {response.status_code}")
            else:
                print(f"     Login failed: {response.status_code}")
                
        except Exception as e:
            print(f"     Error: {e}")
    
    print("\n" + "=" * 50)
    print("✅ API testing completed!")

if __name__ == "__main__":
    test_api()