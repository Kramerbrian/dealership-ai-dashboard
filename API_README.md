# Dealership AI Analytics API

A FastAPI-based REST API for fetching dealership analytics data with comprehensive Role-Based Access Control (RBAC).

## Features

- **Multi-Agent Analytics**: Integrates with the dealership AI multi-agent system for comprehensive analysis
- **RBAC Security**: Role-based access control with JWT authentication
- **Comprehensive Analytics**: Visibility analysis, competitor analysis, review data, and risk assessment
- **Audit Logging**: Request logging for compliance and monitoring
- **RESTful Design**: Clean, well-documented API endpoints

## Quick Start

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Set Environment Variables

```bash
export JWT_SECRET_KEY="your-secret-key-change-in-production"
export OPENAI_API_KEY="your-openai-key"  # Optional
export GOOGLE_SEARCH_API_KEY="your-google-key"  # Optional
export GOOGLE_SEARCH_ENGINE_ID="your-engine-id"  # Optional
export PERPLEXITY_API_KEY="your-perplexity-key"  # Optional
export GOOGLE_GEMINI_API_KEY="your-gemini-key"  # Optional
```

### 3. Run the API

```bash
python main.py
```

The API will be available at `http://localhost:8000`

### 4. Test the API

```bash
python test_api.py
```

## API Documentation

### Authentication

#### POST `/api/v1/auth/login`
Authenticate and receive a JWT token.

**Request:**
```json
{
  "email": "admin@dealership.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "token_type": "bearer",
  "user": {
    "id": "1",
    "username": "admin",
    "email": "admin@dealership.com",
    "role": "admin",
    "permissions": ["read:analytics", "write:analytics", "read:dealerships", "write:dealerships", "admin:access"],
    "dealership_id": null,
    "is_active": true
  }
}
```

#### GET `/api/v1/auth/me`
Get current user information.

**Headers:** `Authorization: Bearer <token>`

### Analytics Endpoints

#### POST `/api/v1/analytics/dealership`
Fetch comprehensive analytics data for a dealership.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "dealership_name": "Toyota of Naples",
  "location": "Naples, FL",
  "include_competitors": true,
  "include_reviews": true,
  "include_auto_responses": false
}
```

**Response:**
```json
{
  "dealership": "Toyota of Naples",
  "location": "Naples, FL",
  "timestamp": "2024-01-15T10:30:00Z",
  "visibility_reports": [
    {
      "query": "Toyota of Naples reviews Naples",
      "visibility_score": 28.5,
      "platforms_mentioned": ["Google", "Yelp"],
      "revenue_at_risk": 12500.0
    }
  ],
  "competitor_reports": [
    {
      "query": "Toyota of Naples reviews Naples",
      "competitors": [
        ["Honda of Naples", 3],
        ["Ford Naples", 2]
      ]
    }
  ],
  "review_data": {
    "overall_rating": 4.2,
    "overall_sentiment": 0.85,
    "ratings": {
      "Google": 4.3,
      "Yelp": 4.1,
      "DealerRater": 4.0
    },
    "review_counts": {
      "Google": 150,
      "Yelp": 89,
      "DealerRater": 45
    },
    "response_rates": {
      "Google": 0.75,
      "Yelp": 0.60,
      "DealerRater": 0.40
    }
  },
  "risk_score": 73.0,
  "monthly_loss_risk": 47250.0,
  "ai_visibility_score": 34.0,
  "market_position": 7,
  "total_competitors": 12
}
```

#### GET `/api/v1/analytics/dealership/{dealership_name}`
Convenience endpoint for GET requests.

**Query Parameters:**
- `location`: Dealership location (default: "Naples, FL")
- `include_competitors`: Include competitor analysis (default: true)
- `include_reviews`: Include review data (default: true)
- `include_auto_responses`: Include auto-generated responses (default: false)

#### GET `/api/v1/analytics/summary`
Get analytics summary across all accessible dealerships.

**Headers:** `Authorization: Bearer <token>`

## User Roles and Permissions

### Admin
- **Permissions**: All permissions
- **Access**: All dealerships
- **Use Case**: System administrators

### Manager
- **Permissions**: `read:analytics`, `write:analytics`, `read:dealerships`
- **Access**: Assigned dealership(s)
- **Use Case**: Dealership managers

### Analyst
- **Permissions**: `read:analytics`, `read:dealerships`
- **Access**: Assigned dealership(s)
- **Use Case**: Data analysts

### Viewer
- **Permissions**: `read:analytics`
- **Access**: Assigned dealership(s)
- **Use Case**: Read-only access for stakeholders

## Mock Users

For testing purposes, the following users are available:

| Email | Role | Password | Dealership |
|-------|------|----------|------------|
| admin@dealership.com | Admin | password123 | All |
| manager@dealership.com | Manager | password123 | dealership_1 |
| analyst@dealership.com | Analyst | password123 | dealership_1 |
| viewer@dealership.com | Viewer | password123 | dealership_1 |

## Error Handling

The API returns appropriate HTTP status codes and error messages:

- **400**: Bad Request - Invalid request parameters
- **401**: Unauthorized - Invalid or missing authentication
- **403**: Forbidden - Insufficient permissions
- **404**: Not Found - Resource not found
- **500**: Internal Server Error - Server error

Error responses include:
```json
{
  "error": "Error message",
  "detail": "Additional details",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control**: Granular permission system
- **Dealership Access Control**: Users can only access assigned dealerships
- **Audit Logging**: All requests are logged for compliance
- **Input Validation**: Pydantic models ensure data integrity

## Development

### Project Structure

```
├── main.py                 # FastAPI application entry point
├── requirements.txt        # Python dependencies
├── test_api.py            # API testing script
├── dealership_ai_multi_agent.py  # Multi-agent analytics system
├── api/
│   ├── __init__.py
│   ├── models.py          # Pydantic models
│   ├── middleware/
│   │   ├── __init__.py
│   │   └── rbac.py        # RBAC middleware
│   └── routes/
│       ├── __init__.py
│       ├── analytics.py   # Analytics endpoints
│       └── auth.py        # Authentication endpoints
```

### Adding New Endpoints

1. Create new route file in `api/routes/`
2. Define Pydantic models in `api/models.py`
3. Add RBAC decorators as needed
4. Include router in `main.py`

### Adding New Permissions

1. Add permission to `Permission` enum in `api/models.py`
2. Update `ROLE_PERMISSIONS` mapping
3. Use `require_permission()` decorator in routes

## Production Considerations

- **Database Integration**: Replace mock users with real database
- **Password Hashing**: Implement proper password hashing
- **Rate Limiting**: Add rate limiting middleware
- **CORS Configuration**: Configure CORS for production domains
- **Environment Variables**: Use secure environment variable management
- **Monitoring**: Add application monitoring and logging
- **Caching**: Implement caching for expensive analytics operations
- **Background Tasks**: Use proper task queue for long-running analytics