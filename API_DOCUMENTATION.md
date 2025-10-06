# Dealership Analytics API Documentation

## Overview

This API provides comprehensive analytics data for automotive dealerships with robust Role-Based Access Control (RBAC) middleware. The system ensures secure access to sensitive business metrics while providing granular permission control.

## Features

- 🔐 **JWT-based Authentication**
- 👥 **Role-Based Access Control (RBAC)**
- 📊 **Comprehensive Analytics Endpoints**
- 🚦 **Rate Limiting**
- ✅ **Input Validation**
- 🛡️ **Security Headers (Helmet)**
- 📝 **Request Logging**

## Getting Started

### Installation

```bash
npm install
```

### Environment Setup

1. Copy `.env.example` to `.env`
2. Update the environment variables:

```bash
PORT=3000
NODE_ENV=development
JWT_SECRET=your-secure-secret-key
JWT_EXPIRES_IN=24h
CORS_ORIGIN=http://localhost:3001
```

### Running the Server

```bash
# Development
npm run dev

# Production
npm run build
npm start
```

## Authentication

### Login

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@dealership.com",
  "password": "password123"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "1",
      "email": "admin@dealership.com",
      "name": "Admin User",
      "role": "super_admin",
      "permissions": ["view_analytics", "export_analytics", ...]
    }
  }
}
```

### Using the Token

Include the JWT token in the Authorization header:

```bash
Authorization: Bearer <your-jwt-token>
```

## User Roles & Permissions

### Available Roles

1. **super_admin** - Full system access
2. **dealership_owner** - Full dealership access
3. **dealership_manager** - Management access
4. **sales_manager** - Sales data access
5. **sales_rep** - Limited sales access
6. **service_manager** - Service data access
7. **marketing_manager** - Marketing data access
8. **viewer** - Read-only access

### Permission Matrix

| Permission | Super Admin | Owner | Manager | Sales Manager | Marketing Manager | Viewer |
|------------|-------------|-------|---------|---------------|-------------------|--------|
| VIEW_ANALYTICS | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| VIEW_DETAILED_ANALYTICS | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |
| EXPORT_ANALYTICS | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| VIEW_SALES_DATA | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| VIEW_MARKETING_DATA | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |
| SYSTEM_ADMIN | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

## API Endpoints

### Analytics Endpoints

#### 1. Get Comprehensive Analytics

```bash
GET /api/analytics/dealership/:dealershipId
```

**Required Permission:** `VIEW_ANALYTICS`

**Query Parameters:**
- `startDate` (optional): ISO 8601 date string
- `endDate` (optional): ISO 8601 date string
- `metrics` (optional): Comma-separated list of metrics
- `groupBy` (optional): day|week|month|quarter|year
- `compareWithPrevious` (optional): boolean

**Example:**
```bash
curl -H "Authorization: Bearer <token>" \
  "http://localhost:3000/api/analytics/dealership/dealership-123?startDate=2024-01-01&endDate=2024-12-31"
```

#### 2. Get AI Visibility Metrics

```bash
GET /api/analytics/dealership/:dealershipId/ai-visibility
```

**Required Permission:** `VIEW_ANALYTICS`

**Response:**
```json
{
  "success": true,
  "data": {
    "overallScore": 85,
    "platformScores": {
      "chatgpt": 90,
      "claude": 82,
      "gemini": 78,
      "perplexity": 88,
      "copilot": 85,
      "grok": 80
    },
    "invisiblePercentage": 15,
    "monthlyLossRisk": 25000,
    "sovPercentage": 35,
    "mentionCount": 245,
    "recommendationRate": 78
  }
}
```

#### 3. Get Sales Analytics

```bash
GET /api/analytics/dealership/:dealershipId/sales
```

**Required Permission:** `VIEW_SALES_DATA`

#### 4. Get Marketing Analytics

```bash
GET /api/analytics/dealership/:dealershipId/marketing
```

**Required Permission:** `VIEW_MARKETING_DATA`

#### 5. Get Competitor Analysis

```bash
GET /api/analytics/dealership/:dealershipId/competitors
```

**Required Permission:** `VIEW_DETAILED_ANALYTICS`

#### 6. Get Threat Analysis

```bash
GET /api/analytics/dealership/:dealershipId/threats
```

**Required Permission:** `VIEW_DETAILED_ANALYTICS`

#### 7. Export Analytics

```bash
POST /api/analytics/dealership/:dealershipId/export
Content-Type: application/json

{
  "format": "pdf",
  "metrics": ["aiVisibility", "sales", "marketing"],
  "startDate": "2024-01-01",
  "endDate": "2024-12-31",
  "email": "user@example.com" // optional
}
```

**Required Permission:** `EXPORT_ANALYTICS`

**Rate Limit:** 10 exports per hour

#### 8. Get Dashboard Summary

```bash
GET /api/analytics/dashboard
```

**Required Permission:** `VIEW_ANALYTICS`

Returns summarized analytics for the user's associated dealership.

## Error Handling

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [...] // Optional validation errors
}
```

### Common Error Codes

- `400` - Bad Request (validation failed)
- `401` - Unauthorized (no/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

## Rate Limiting

- **General API:** 100 requests per 15 minutes
- **Authentication:** 5 attempts per 15 minutes
- **Export:** 10 exports per hour

## Security Features

1. **Helmet.js** - Sets security headers
2. **CORS** - Configurable cross-origin requests
3. **Input Validation** - Express-validator on all inputs
4. **Rate Limiting** - Prevents abuse
5. **JWT Authentication** - Secure token-based auth
6. **RBAC** - Granular permission control
7. **Password Hashing** - bcrypt with configurable rounds

## Testing with cURL

### 1. Login and Get Token

```bash
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"owner@dealership.com","password":"password123"}' \
  | jq -r '.data.token')
```

### 2. Get Analytics

```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/analytics/dealership/dealership-123
```

### 3. Export Analytics

```bash
curl -X POST http://localhost:3000/api/analytics/dealership/dealership-123/export \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "format": "pdf",
    "metrics": ["aiVisibility", "sales"],
    "startDate": "2024-01-01",
    "endDate": "2024-12-31"
  }'
```

## Development

### Project Structure

```
src/
├── server.ts                 # Main server file
├── types/
│   ├── auth.types.ts        # Auth & RBAC types
│   └── analytics.types.ts   # Analytics data types
├── middleware/
│   ├── auth.middleware.ts    # Authentication & RBAC
│   ├── errorHandler.ts      # Global error handler
│   ├── rateLimiter.ts       # Rate limiting
│   └── validation.middleware.ts # Input validation
├── routes/
│   ├── auth.routes.ts       # Authentication routes
│   └── analytics.routes.ts  # Analytics routes
└── services/
    └── analytics.service.ts  # Business logic
```

### Adding New Permissions

1. Add to `Permission` enum in `auth.types.ts`
2. Update `ROLE_PERMISSIONS` mapping
3. Use in routes with `requirePermissions()`

### Adding New Roles

1. Add to `UserRole` enum
2. Define permissions in `ROLE_PERMISSIONS`
3. Update user creation/management logic

## Production Considerations

1. **Database Integration**: Replace mock data with real database queries
2. **Caching**: Implement Redis for frequently accessed data
3. **Monitoring**: Add APM (Application Performance Monitoring)
4. **Logging**: Use Winston or similar for production logging
5. **Secrets Management**: Use AWS Secrets Manager or similar
6. **Load Balancing**: Deploy with PM2 or containerize with Docker
7. **API Documentation**: Consider adding Swagger/OpenAPI

## License

Copyright © 2024 Dealership AI. All rights reserved.