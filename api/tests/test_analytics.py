"""
Tests for Analytics API Endpoints
=================================

This module contains unit and integration tests for the analytics API endpoints.
"""

import pytest
from fastapi.testclient import TestClient
from api.main import app
from api.middleware.rbac import create_access_token, Role

client = TestClient(app)


@pytest.fixture
def admin_token():
    """Generate an admin JWT token for testing."""
    return create_access_token(
        user_id="admin_001",
        email="admin@test.com",
        role=Role.ADMIN,
        dealership_ids=["deal_001", "deal_002"]
    )


@pytest.fixture
def analyst_token():
    """Generate an analyst JWT token for testing."""
    return create_access_token(
        user_id="analyst_001",
        email="analyst@test.com",
        role=Role.ANALYST,
        dealership_ids=["deal_001"]
    )


@pytest.fixture
def viewer_token():
    """Generate a viewer JWT token for testing."""
    return create_access_token(
        user_id="viewer_001",
        email="viewer@test.com",
        role=Role.VIEWER,
        dealership_ids=["deal_001"]
    )


@pytest.fixture
def manager_token():
    """Generate a manager JWT token for testing."""
    return create_access_token(
        user_id="manager_001",
        email="manager@test.com",
        role=Role.MANAGER,
        dealership_ids=["deal_001"]
    )


class TestHealthEndpoints:
    """Tests for health and status endpoints."""
    
    def test_health_check(self):
        """Test the health check endpoint."""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "version" in data
    
    def test_root_endpoint(self):
        """Test the root endpoint."""
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "endpoints" in data


class TestAuthentication:
    """Tests for authentication endpoints."""
    
    def test_demo_token_generation(self):
        """Test demo token generation."""
        response = client.post(
            "/api/v1/auth/demo-token",
            json={
                "email": "test@example.com",
                "role": "analyst",
                "dealership_ids": ["deal_001"]
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert data["user"]["email"] == "test@example.com"
    
    def test_missing_token(self):
        """Test accessing protected endpoint without token."""
        response = client.get("/api/v1/analytics/dealership/deal_001")
        assert response.status_code == 403  # No credentials provided
    
    def test_invalid_token(self):
        """Test accessing protected endpoint with invalid token."""
        response = client.get(
            "/api/v1/analytics/dealership/deal_001",
            headers={"Authorization": "Bearer invalid_token_here"}
        )
        assert response.status_code == 401


class TestAnalyticsEndpoints:
    """Tests for analytics endpoints."""
    
    def test_get_dealership_analytics_success(self, analyst_token):
        """Test successful retrieval of dealership analytics."""
        response = client.get(
            "/api/v1/analytics/dealership/deal_001",
            headers={"Authorization": f"Bearer {analyst_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "dealership" in data
        assert "risk_score" in data
        assert "ai_visibility_score" in data
        assert "threats" in data
    
    def test_get_dealership_analytics_not_found(self, analyst_token):
        """Test analytics retrieval for non-existent dealership."""
        response = client.get(
            "/api/v1/analytics/dealership/deal_999",
            headers={"Authorization": f"Bearer {analyst_token}"}
        )
        assert response.status_code == 404
    
    def test_get_visibility_analytics(self, analyst_token):
        """Test visibility analytics retrieval."""
        response = client.get(
            "/api/v1/analytics/dealership/deal_001/visibility",
            headers={"Authorization": f"Bearer {analyst_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "overall_score" in data
        assert "platform_scores" in data
        assert len(data["platform_scores"]) > 0
    
    def test_get_threats(self, analyst_token):
        """Test threats retrieval."""
        response = client.get(
            "/api/v1/analytics/dealership/deal_001/threats",
            headers={"Authorization": f"Bearer {analyst_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "threats" in data
        assert "total_risk_score" in data
    
    def test_get_threats_with_filter(self, analyst_token):
        """Test threats retrieval with severity filter."""
        response = client.get(
            "/api/v1/analytics/dealership/deal_001/threats?severity=Critical",
            headers={"Authorization": f"Bearer {analyst_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        # Should only return Critical threats
        for threat in data["threats"]:
            assert threat["severity"] == "Critical"
    
    def test_get_competitor_analytics(self, analyst_token):
        """Test competitor analytics retrieval."""
        response = client.get(
            "/api/v1/analytics/dealership/deal_001/competitors",
            headers={"Authorization": f"Bearer {analyst_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "competitors" in data
        assert "market_position" in data
    
    def test_get_review_analytics(self, analyst_token):
        """Test review analytics retrieval."""
        response = client.get(
            "/api/v1/analytics/dealership/deal_001/reviews",
            headers={"Authorization": f"Bearer {analyst_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "overall_rating" in data
        assert "ratings" in data
        assert "review_counts" in data


class TestRBACPermissions:
    """Tests for RBAC permission enforcement."""
    
    def test_viewer_can_read_analytics(self, viewer_token):
        """Test that viewers can read analytics."""
        response = client.get(
            "/api/v1/analytics/dealership/deal_001",
            headers={"Authorization": f"Bearer {viewer_token}"}
        )
        assert response.status_code == 200
    
    def test_viewer_cannot_refresh_analytics(self, viewer_token):
        """Test that viewers cannot refresh analytics."""
        response = client.post(
            "/api/v1/analytics/dealership/deal_001/refresh",
            headers={"Authorization": f"Bearer {viewer_token}"},
            json={"force_refresh": False}
        )
        assert response.status_code == 403
    
    def test_manager_can_refresh_analytics(self, manager_token):
        """Test that managers can refresh analytics."""
        response = client.post(
            "/api/v1/analytics/dealership/deal_001/refresh",
            headers={"Authorization": f"Bearer {manager_token}"},
            json={"force_refresh": False}
        )
        assert response.status_code == 200
    
    def test_admin_has_full_access(self, admin_token):
        """Test that admins have full access."""
        # Test read access
        response = client.get(
            "/api/v1/analytics/dealership/deal_001",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        
        # Test write access
        response = client.post(
            "/api/v1/analytics/dealership/deal_001/refresh",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={"force_refresh": True}
        )
        assert response.status_code == 200


class TestDealershipAccess:
    """Tests for dealership access control."""
    
    def test_user_can_access_assigned_dealership(self, viewer_token):
        """Test user can access assigned dealership."""
        response = client.get(
            "/api/v1/analytics/dealership/deal_001",
            headers={"Authorization": f"Bearer {viewer_token}"}
        )
        assert response.status_code == 200
    
    def test_user_cannot_access_unassigned_dealership(self):
        """Test user cannot access dealership they're not assigned to."""
        # Create token with limited access
        token = create_access_token(
            user_id="limited_user",
            email="limited@test.com",
            role=Role.VIEWER,
            dealership_ids=["deal_999"]  # Only has access to deal_999
        )
        
        response = client.get(
            "/api/v1/analytics/dealership/deal_001",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 403
    
    def test_admin_can_access_all_dealerships(self, admin_token):
        """Test admin can access any dealership."""
        response = client.get(
            "/api/v1/analytics/dealership/deal_001",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        
        response = client.get(
            "/api/v1/analytics/dealership/deal_002",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
