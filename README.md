# Dealership AI Analytics Platform

A comprehensive analytics platform for automotive dealerships featuring AI visibility metrics, sales analytics, and robust Role-Based Access Control (RBAC).

## 🚀 Features

- **AI Visibility Analytics** - Track dealership presence across AI platforms (ChatGPT, Claude, Gemini, etc.)
- **Comprehensive Metrics** - Sales, service, marketing, and competitor analytics
- **Role-Based Access Control** - Granular permissions for different user roles
- **RESTful API** - Well-documented endpoints with proper authentication
- **Security First** - JWT authentication, rate limiting, input validation
- **Export Capabilities** - Export analytics in CSV, PDF, and Excel formats

## 📋 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Update .env with your configuration
```

### Running the API Server

```bash
# Development mode
npm run dev

# Production build
npm run build
npm start

# Run tests
npm test
```

The API server will be available at `http://localhost:3000`

## 🔐 Authentication

The API uses JWT tokens for authentication. To get started:

1. Login with credentials to receive a JWT token
2. Include the token in the Authorization header for protected routes

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"owner@dealership.com","password":"password123"}'

# Use token in requests
curl -H "Authorization: Bearer <your-token>" \
  http://localhost:3000/api/analytics/dealership/dealership-123
```

## 👥 User Roles

- **Super Admin** - Full system access
- **Dealership Owner** - Complete dealership management
- **Dealership Manager** - Operational access
- **Sales Manager** - Sales data access
- **Service Manager** - Service data access  
- **Marketing Manager** - Marketing analytics access
- **Viewer** - Read-only access

## 📊 Key API Endpoints

- `GET /api/analytics/dealership/:id` - Comprehensive analytics
- `GET /api/analytics/dealership/:id/ai-visibility` - AI platform metrics
- `GET /api/analytics/dealership/:id/sales` - Sales analytics
- `GET /api/analytics/dealership/:id/competitors` - Competitor analysis
- `POST /api/analytics/dealership/:id/export` - Export data

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete endpoint documentation.

## 🛠️ Project Structure

```
├── src/
│   ├── server.ts              # Express server setup
│   ├── types/                 # TypeScript type definitions
│   ├── middleware/            # Auth, validation, error handling
│   ├── routes/                # API route handlers
│   ├── services/              # Business logic
│   └── tests/                 # Test files
├── examples/                  # API client examples
└── API_DOCUMENTATION.md       # Detailed API docs
```

## 🧪 Testing

Run the test suite:

```bash
npm test

# With coverage
npm run test:coverage
```

## 📚 Documentation

- [API Documentation](./API_DOCUMENTATION.md) - Complete API reference
- [Example Client](./examples/api-client.example.ts) - TypeScript client example

## 🔒 Security Features

- JWT-based authentication
- Role-based access control (RBAC)
- Rate limiting on all endpoints
- Input validation and sanitization  
- Security headers with Helmet.js
- CORS configuration

## 📝 License

Copyright © 2024 Dealership AI. All rights reserved.
