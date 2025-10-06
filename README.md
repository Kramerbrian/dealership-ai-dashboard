# Dealership Analytics API with RBAC

A comprehensive REST API for dealership analytics with advanced Role-Based Access Control (RBAC), built using FastAPI and integrated with the existing dealership AI multi-agent system.

## 🚀 Features

### Core Functionality
- **Multi-Agent Analytics**: Integrates with existing AI agents for comprehensive dealership analysis
- **Advanced RBAC**: Fine-grained permissions with role-based access control
- **JWT Authentication**: Secure token-based authentication with configurable expiration
- **Rate Limiting**: Built-in rate limiting to prevent abuse
- **Audit Logging**: Comprehensive logging of all API access and security events
- **Export Capabilities**: Support for JSON, CSV, and PDF export formats

### Security Features
- **Role-Based Permissions**: Admin, Manager, Viewer, and Premium user roles
- **Dealership-Specific Access**: Users can only access assigned dealerships
- **Security Headers**: OWASP-recommended security headers
- **Request Validation**: Input validation and sanitization
- **IP-based Rate Limiting**: Automatic blocking of suspicious IPs
- **Audit Trail**: Complete audit log for compliance and security monitoring

### API Endpoints
- `POST /auth/login` - User authentication
- `GET /auth/me` - Get current user information
- `GET /api/analytics` - Fetch dealership analytics data
- `GET /api/analytics/summary` - Get analytics summary
- `GET /api/analytics/export` - Export analytics in various formats
- `GET /api/dealerships` - List accessible dealerships
- `GET /api/permissions` - Get user permissions and capabilities
- `GET /api/health` - Health check endpoint

## 📋 Prerequisites

- Python 3.8+
- pip (Python package manager)
- Virtual environment (recommended)

## 🛠️ Installation

### Quick Start

1. **Clone and setup**:
   ```bash
   # Make startup script executable (if not already)
   chmod +x start_api.sh
   
   # Run the startup script
   ./start_api.sh
   ```

### Manual Installation

1. **Create virtual environment**:
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Set environment variables**:
   ```bash
   export SECRET_KEY="your-secret-key-here"
   export ENVIRONMENT="development"
   ```

4. **Start the server**:
   ```bash
   python api_server.py
   ```

## 🔐 Authentication & Authorization

### User Roles

| Role | Description | Permissions |
|------|-------------|-------------|
| **Admin** | Full system access | All permissions, access to all dealerships |
| **Manager** | Dealership management | Analytics, export, dealership management for assigned locations |
| **Viewer** | Read-only access | Basic analytics viewing for assigned dealerships |
| **Premium** | Enhanced features | Advanced analytics, export, AI logs access |

### Test Users

The system comes with pre-configured test users:

| Username | Password | Role | Dealership Access |
|----------|----------|------|------------------|
| `admin` | `admin123` | Admin | All dealerships |
| `manager` | `manager123` | Manager | Toyota Naples, Toyota Fort Myers |
| `viewer` | `viewer123` | Viewer | Toyota Naples only |
| `premium` | `premium123` | Premium | All dealerships |

## 📖 API Usage

### 1. Authentication

```bash
# Login and get JWT token
curl -X POST "http://localhost:8000/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

Response:
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "token_type": "bearer",
  "expires_in": 1800,
  "user_info": {
    "username": "admin",
    "email": "admin@dealershipai.com",
    "role": "admin",
    "dealership_ids": ["*"],
    "is_active": true
  }
}
```

### 2. Get Analytics Data

```bash
# Get dealership analytics (requires authentication)
curl -X GET "http://localhost:8000/api/analytics?business_name=Toyota%20of%20Naples&location=Naples,%20FL" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3. Export Analytics

```bash
# Export analytics in JSON format
curl -X GET "http://localhost:8000/api/analytics/export?business_name=Toyota%20of%20Naples&location=Naples,%20FL&format=json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 4. Check User Permissions

```bash
# Get current user permissions
curl -X GET "http://localhost:8000/api/permissions" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🧪 Testing

### Automated Testing

Run the comprehensive test suite:

```bash
# Install test dependencies
pip install aiohttp

# Run tests against local server
python test_api.py

# Run tests against different URL
python test_api.py --url http://your-server:8000
```

### Manual Testing

1. **Start the API server**:
   ```bash
   ./start_api.sh
   ```

2. **Access API documentation**:
   - Swagger UI: http://localhost:8000/docs
   - ReDoc: http://localhost:8000/redoc

3. **Test endpoints**:
   - Health check: http://localhost:8000/api/health
   - Try authentication with test users

## 📊 Analytics Integration

The API integrates with the existing `dealership_ai_multi_agent.py` system to provide:

- **AI Platform Visibility Scores**: ChatGPT, Claude, Gemini, Perplexity, etc.
- **Competitor Analysis**: Identification and ranking of competitors
- **Review Sentiment Analysis**: Aggregated ratings and sentiment from multiple sources
- **Revenue Impact Calculations**: Estimated revenue at risk from poor visibility
- **Automated Response Suggestions**: AI-generated witty responses for reviews

## 🛡️ Security Features

### RBAC Permissions

Fine-grained permissions control access to different features:

- `analytics:read` - Basic analytics access
- `analytics:export` - Export functionality
- `dealership:write` - Modify dealership settings
- `users:manage` - User management
- `ai:configure` - AI agent configuration

### Rate Limiting

Built-in rate limiting prevents abuse:

- **Default**: 100 requests per hour
- **Analytics**: 50 requests per hour  
- **Auth**: 10 attempts per 10 minutes

### Audit Logging

All API access is logged to `audit.log`:

```
2023-10-06 10:30:15,123 - AUDIT - INFO - AUTH_SUCCESS - User: admin, IP: 192.168.1.100
2023-10-06 10:30:45,456 - AUDIT - INFO - API_ACCESS - User: admin, Endpoint: GET /api/analytics, Status: 200, IP: 192.168.1.100, Dealership: toyota_naples
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SECRET_KEY` | JWT signing key | `your-secret-key-change-in-production` |
| `ENVIRONMENT` | Environment name | `development` |
| `OPENAI_API_KEY` | OpenAI API key (optional) | None |
| `GOOGLE_SEARCH_API_KEY` | Google Search API key (optional) | None |

### Customization

1. **Add new roles**: Edit `UserRole` enum and `RolePermissions.ROLE_PERMISSIONS`
2. **Add new permissions**: Add to `Permission` enum
3. **Modify rate limits**: Update `RateLimiter.limits` configuration
4. **Add new endpoints**: Follow existing patterns with proper RBAC decoration

## 📁 Project Structure

```
dealership-analytics-api/
├── api_server.py              # Main FastAPI application
├── rbac_middleware.py         # RBAC and security middleware
├── dealership_ai_multi_agent.py  # Existing AI analytics system
├── requirements.txt           # Python dependencies
├── start_api.sh              # Startup script
├── test_api.py               # Comprehensive test suite
├── README.md                 # This documentation
└── logs/                     # Log files (created at runtime)
    └── audit.log             # Security audit log
```

## 🚀 Production Deployment

### Security Checklist

- [ ] Change `SECRET_KEY` to a strong, random value
- [ ] Configure `allowed_hosts` in TrustedHostMiddleware
- [ ] Set up proper CORS origins (remove `"*"`)
- [ ] Use HTTPS with proper SSL certificates
- [ ] Set up proper database instead of in-memory user store
- [ ] Configure log rotation for audit logs
- [ ] Set up monitoring and alerting
- [ ] Review and adjust rate limits for your use case

### Docker Deployment

Create a `Dockerfile`:

```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8000

CMD ["python", "api_server.py"]
```

Build and run:

```bash
docker build -t dealership-analytics-api .
docker run -p 8000:8000 -e SECRET_KEY="your-production-secret" dealership-analytics-api
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes with proper tests
4. Ensure all tests pass: `python test_api.py`
5. Submit a pull request

## 📄 License

This project is proprietary software for dealershipAI. All rights reserved.

## 🆘 Support

For technical support or questions:

- Check the API documentation at `/docs`
- Run the test suite to verify functionality
- Review audit logs for security issues
- Contact the development team

---

**Built with ❤️ for dealershipAI - Empowering automotive dealers with AI-driven analytics and insights.**