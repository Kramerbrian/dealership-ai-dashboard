# Dealership Analytics API

A comprehensive API for dealership analytics data with proper RBAC (Role-Based Access Control) middleware.

## Features

- 🔐 **JWT Authentication** with refresh tokens
- 👥 **Role-Based Access Control** (Admin, Manager, Analyst)
- 📊 **Dealership Analytics** with Python ML integration
- 🚫 **Rate Limiting** and security middleware
- 📝 **Comprehensive Logging** with Winston
- ✅ **Input Validation** with Joi
- 🛡️ **Error Handling** with consistent responses

## Quick Start

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start the server:**
   ```bash
   npm start
   ```

4. **For development:**
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@dealership.com",
  "password": "password"
}
```

**Response:**
```json
{
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "admin@dealership.com",
    "firstName": "Admin",
    "lastName": "User",
    "role": "admin",
    "permissions": ["analytics:read:all", "analytics:write:all"]
  },
  "accessToken": "jwt.token.here",
  "refreshToken": "refresh.token.here",
  "expiresIn": "1h"
}
```

### Analytics

All analytics endpoints require authentication and appropriate role permissions.

#### Get Dealership Analytics
```http
GET /api/analytics/dealership/:dealershipId
Authorization: Bearer <token>
```

**Query Parameters:**
- `startDate` (optional): ISO date string
- `endDate` (optional): ISO date string
- `metrics` (optional): Array of ['visibility', 'reviews', 'competitors', 'revenue']
- `platforms` (optional): Array of platform names

#### Get Analytics Summary
```http
GET /api/analytics/summary
Authorization: Bearer <token>
```

#### Get Competitor Analysis
```http
GET /api/analytics/competitor/:dealershipId
Authorization: Bearer <token>
```

#### Get Review Analytics
```http
GET /api/analytics/reviews/:dealershipId
Authorization: Bearer <token>
```

#### Generate Report
```http
POST /api/analytics/generate-report
Authorization: Bearer <token>
Content-Type: application/json

{
  "dealershipIds": ["507f1f77bcf86cd799439011"],
  "reportType": "summary",
  "format": "json",
  "includeCharts": false
}
```

## Role-Based Access Control

### User Roles

1. **Admin**
   - Full access to all dealerships and features
   - Can manage users and system settings
   - Access to all analytics and reports

2. **Manager**
   - Access to assigned dealerships only
   - Can generate reports for assigned dealerships
   - Limited user management capabilities

3. **Analyst**
   - Read-only access to assigned dealerships
   - Can view analytics but cannot generate reports
   - No user management access

### Permissions

Roles are mapped to specific permissions:

```javascript
const rolePermissions = {
  admin: [
    'analytics:read:all',
    'analytics:write:all',
    'users:read:all',
    'users:write:all'
  ],
  manager: [
    'analytics:read:assigned',
    'analytics:write:assigned',
    'reports:generate:assigned'
  ],
  analyst: [
    'analytics:read:assigned'
  ]
};
```

## Error Handling

The API uses consistent error response format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": "Email is required"
  },
  "timestamp": "2023-12-07T10:30:00.000Z",
  "path": "/api/auth/login",
  "method": "POST"
}
```

### Common Error Codes

- `VALIDATION_ERROR` - Invalid input data
- `UNAUTHORIZED` - Authentication required
- `FORBIDDEN` - Access denied
- `NOT_FOUND` - Resource not found
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `INTERNAL_SERVER_ERROR` - Server error

## Python Integration

The API integrates with a Python multi-agent system for analytics processing:

```javascript
const { PythonShell } = require('python-shell');

const runAnalyticsAnalysis = async (businessName, location, options) => {
  return new Promise((resolve, reject) => {
    const pythonOptions = {
      mode: 'json',
      pythonPath: process.env.PYTHON_PATH || 'python3',
      scriptPath: __dirname + '/../',
      args: [businessName, location, JSON.stringify(options)]
    };

    PythonShell.run('dealership_ai_multi_agent.py', pythonOptions, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results[0]);
      }
    });
  });
};
```

## Security Features

- **JWT Authentication** with configurable expiration
- **Rate Limiting** (100 requests per 15 minutes per IP)
- **CORS** configuration for cross-origin requests
- **Helmet.js** for security headers
- **Input Validation** with Joi schemas
- **Error Sanitization** (no stack traces in production)

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3001` |
| `NODE_ENV` | Environment | `development` |
| `JWT_SECRET` | JWT signing secret | *Required* |
| `JWT_EXPIRES_IN` | JWT expiration time | `1h` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:3000` |
| `PYTHON_PATH` | Python executable path | `python3` |

## Development

### Project Structure

```
├── controllers/
│   ├── analyticsController.js    # Analytics business logic
│   └── authController.js         # Authentication logic
├── middleware/
│   ├── rbac.js                   # Authentication & authorization
│   ├── validation.js             # Input validation
│   └── errorHandler.js           # Error handling
├── routes/
│   ├── analytics.js              # Analytics routes
│   └── auth.js                   # Authentication routes
├── utils/
│   └── logger.js                 # Winston logger
├── server.js                     # Express server
└── dealership_ai_multi_agent.py  # Python analytics script
```

### Testing the API

1. **Start the server:**
   ```bash
   npm run dev
   ```

2. **Login to get a token:**
   ```bash
   curl -X POST http://localhost:3001/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@dealership.com","password":"password"}'
   ```

3. **Use the token in subsequent requests:**
   ```bash
   curl -X GET http://localhost:3001/api/analytics/dealership/507f1f77bcf86cd799439011 \
     -H "Authorization: Bearer <your-token>"
   ```

## Deployment

1. Set production environment variables
2. Install production dependencies: `npm ci --production`
3. Start the server: `npm start`
4. Set up reverse proxy (nginx) for production
5. Configure SSL certificates
6. Set up monitoring and logging

## Contributing

1. Follow the existing code structure
2. Add proper error handling
3. Include input validation
4. Write tests for new endpoints
5. Update documentation

## License

This project is part of the dealership analytics platform.