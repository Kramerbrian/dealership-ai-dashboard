# Dealership Analytics API

A FastAPI-based REST API for fetching and managing dealership analytics data with comprehensive Role-Based Access Control (RBAC).

## Features

- 🔐 **JWT-based Authentication**: Secure token-based authentication
- 👥 **Role-Based Access Control (RBAC)**: Granular permission system with multiple user roles
- 📊 **Analytics Endpoints**: Comprehensive dealership analytics including:
  - Overall analytics overview
  - AI visibility metrics across platforms
  - Threat identification and risk assessment
  - Competitor analysis
  - Review analytics and sentiment
- 🔄 **Async Support**: Built on FastAPI for high-performance async operations
- 📝 **Auto-generated Documentation**: Interactive API docs via Swagger UI
- 🛡️ **Security**: Built-in CORS, trusted host middleware, and comprehensive error handling

## User Roles & Permissions

### Roles

| Role | Description | Access Level |
|------|-------------|--------------|
| **Admin** | Full system access | All dealerships, all operations |
| **Manager** | Dealership management | Assigned dealerships, read/write analytics |
| **Analyst** | Cross-dealership analytics | All dealerships, read-only analytics |
| **Viewer** | Read-only access | Assigned dealerships, read-only |

### Permissions

- `read:analytics` - View analytics data
- `write:analytics` - Modify analytics configurations
- `read:dealership` - View dealership information
- `write:dealership` - Modify dealership information
- `admin:all` - Full administrative access

## API Endpoints

### Authentication

```
POST /api/v1/auth/demo-token
```
Generate a demo JWT token (for testing only - remove in production)

### Analytics

```
GET  /api/v1/analytics/dealership/{dealership_id}
```
Get complete analytics overview for a dealership

```
GET  /api/v1/analytics/dealership/{dealership_id}/visibility
```
Get detailed AI visibility metrics

```
GET  /api/v1/analytics/dealership/{dealership_id}/threats
```
Get identified threats and risks

```
GET  /api/v1/analytics/dealership/{dealership_id}/competitors
```
Get competitor analysis

```
GET  /api/v1/analytics/dealership/{dealership_id}/reviews
```
Get review analytics and sentiment

```
POST /api/v1/analytics/dealership/{dealership_id}/refresh
```
Trigger analytics refresh (requires write:analytics permission)

### Health & Status

```
GET /health
```
Health check endpoint

```
GET /
```
API information and available endpoints

## Installation

### Prerequisites

- Python 3.9 or higher
- pip or poetry for dependency management

### Setup

1. **Clone the repository** (if not already done)

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Set environment variables**:
   ```bash
   export JWT_SECRET="your-secret-key-change-in-production"
   export OPENAI_API_KEY="your-openai-key"  # Optional
   export GOOGLE_SEARCH_API_KEY="your-google-key"  # Optional
   export GOOGLE_SEARCH_ENGINE_ID="your-engine-id"  # Optional
   export PERPLEXITY_API_KEY="your-perplexity-key"  # Optional
   export GOOGLE_GEMINI_API_KEY="your-gemini-key"  # Optional
   ```

4. **Run the API**:
   ```bash
   # Development mode with auto-reload
   uvicorn api.main:app --reload --host 0.0.0.0 --port 8000
   
   # Or use the main script
   python -m api.main
   ```

5. **Access the API documentation**:
   - Swagger UI: http://localhost:8000/docs
   - ReDoc: http://localhost:8000/redoc

## Usage Examples

### 1. Generate a Demo Token

```bash
curl -X POST "http://localhost:8000/api/v1/auth/demo-token" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "analyst@dealership.ai",
    "role": "analyst",
    "dealership_ids": ["deal_001", "deal_002"]
  }'
```

Response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 86400,
  "user": {
    "email": "analyst@dealership.ai",
    "role": "analyst",
    "dealership_ids": ["deal_001", "deal_002"]
  }
}
```

### 2. Get Dealership Analytics

```bash
curl -X GET "http://localhost:8000/api/v1/analytics/dealership/deal_001" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 3. Get AI Visibility Metrics

```bash
curl -X GET "http://localhost:8000/api/v1/analytics/dealership/deal_001/visibility" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 4. Get Threats (with filtering)

```bash
curl -X GET "http://localhost:8000/api/v1/analytics/dealership/deal_001/threats?severity=Critical" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 5. Refresh Analytics

```bash
curl -X POST "http://localhost:8000/api/v1/analytics/dealership/deal_001/refresh" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"force_refresh": true}'
```

## Testing with Python

```python
import httpx
import asyncio

async def test_api():
    base_url = "http://localhost:8000"
    
    # Get demo token
    async with httpx.AsyncClient() as client:
        # Get token
        response = await client.post(
            f"{base_url}/api/v1/auth/demo-token",
            json={
                "email": "analyst@dealership.ai",
                "role": "analyst",
                "dealership_ids": ["deal_001"]
            }
        )
        token = response.json()["access_token"]
        
        # Fetch analytics
        headers = {"Authorization": f"Bearer {token}"}
        response = await client.get(
            f"{base_url}/api/v1/analytics/dealership/deal_001",
            headers=headers
        )
        analytics = response.json()
        print(analytics)

asyncio.run(test_api())
```

## Security Considerations

### Production Deployment

1. **Remove the demo token endpoint**: The `/api/v1/auth/demo-token` endpoint is for testing only!

2. **Use strong JWT secrets**: Set a strong, random `JWT_SECRET` environment variable:
   ```bash
   export JWT_SECRET="$(openssl rand -base64 32)"
   ```

3. **Implement proper authentication**: Replace demo authentication with a real auth service (e.g., OAuth2, Auth0, Keycloak)

4. **Configure CORS properly**: Update allowed origins in `api/main.py`:
   ```python
   allow_origins=[
       "https://yourdomain.com",
       "https://app.yourdomain.com",
   ]
   ```

5. **Use HTTPS**: Always use HTTPS in production with valid SSL certificates

6. **Rate limiting**: Add rate limiting middleware to prevent abuse

7. **Database integration**: Replace mock data with real database queries

## Project Structure

```
api/
├── __init__.py
├── main.py                 # FastAPI application entry point
├── middleware/
│   ├── __init__.py
│   └── rbac.py            # RBAC middleware and authentication
└── routes/
    ├── __init__.py
    └── analytics.py       # Analytics API endpoints
```

## Integration with Multi-Agent System

The API integrates with the existing `dealership_ai_multi_agent.py` system:

- **PlatformAgent**: Searches across AI platforms (ChatGPT, Perplexity, Google, Gemini)
- **AnalysisAgent**: Analyzes search results and calculates metrics
- **CompetitorAgent**: Identifies and ranks competitors
- **ReviewAgent**: Aggregates review data from multiple sources
- **IntegrationAgent**: Orchestrates all agents

## Error Handling

The API provides comprehensive error handling:

- **401 Unauthorized**: Missing or invalid authentication token
- **403 Forbidden**: Insufficient permissions or dealership access denied
- **404 Not Found**: Resource not found
- **422 Unprocessable Entity**: Validation error
- **500 Internal Server Error**: Unexpected server error

## Development

### Running Tests

```bash
pytest tests/ -v --cov=api
```

### Code Formatting

```bash
black api/
```

### Linting

```bash
flake8 api/
mypy api/
```

## Future Enhancements

- [ ] Database integration (PostgreSQL/MySQL)
- [ ] Real-time analytics with WebSocket support
- [ ] Caching layer (Redis) for improved performance
- [ ] Background job queue for async analytics refresh
- [ ] Advanced filtering and search capabilities
- [ ] Export analytics to PDF/Excel
- [ ] Email notifications for critical threats
- [ ] Multi-tenancy support
- [ ] Audit logging
- [ ] GraphQL API endpoint

## Support

For issues or questions, please contact the development team or create an issue in the repository.

## License

[Add your license here]
